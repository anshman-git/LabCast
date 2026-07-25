# LabCast Technical Architecture

## System Overview

LabCast is a real-time collaboration and media platform designed for approximately 10,000 registered users. It uses Firebase for identity and durable application data, Node.js/Express for trusted business operations, Socket.IO for signaling and presence, and WebRTC for media transport.

```text
React web client ── HTTPS/WSS ── Express API + Socket.IO ── Redis
       │                                  │
       ├── Firebase Auth / Firestore       ├── Firebase Admin
       └── WebRTC media ── STUN/TURN ──────┴── SFU for group sessions
```

Use WebRTC mesh only for two to four participants. Group rooms, screen sharing, recording, or reliability-sensitive sessions should use an SFU such as LiveKit, mediasoup, or Janus. Socket.IO remains the coordination plane.

## 1. Folder Structure

```text
labcast/
├── apps/
│   ├── web/                         # React + TypeScript SPA
│   │   └── src/
│   │       ├── app/                 # Bootstrap, providers, router
│   │       ├── features/            # auth, rooms, sessions, chat
│   │       ├── components/          # shared UI
│   │       ├── pages/               # route compositions
│   │       ├── services/            # API, Firebase, Socket, WebRTC
│   │       ├── stores/              # UI, presence, media state
│   │       ├── hooks/  ├── types/  └── utils/
│   └── api/                         # Node.js + Express + Socket.IO
│       └── src/
│           ├── config/  ├── middleware/  ├── modules/
│           ├── realtime/            # gateway, handlers, room registry
│           ├── integrations/        # Firebase Admin, Redis, TURN/SFU
│           ├── jobs/  ├── observability/  └── shared/
├── packages/
│   ├── contracts/                   # runtime schemas, DTOs, event contracts
│   ├── config/                      # shared lint/type/build config
│   └── ui/                          # optional design system
├── infrastructure/
│   ├── terraform/  ├── firebase/  └── docker/
├── docs/adr/  ├── docs/runbooks/  └── .github/workflows/
└── ARCHITECTURE.md
```

`packages/contracts` contains implementation-neutral request, response, and event schemas. Validate those contracts at each network boundary.

## 2. Backend Architecture

Begin with a modular monolith: one independently deployed API, with strict domain boundaries that can later be extracted based on measured load.

- **Express API:** room lifecycle, invitations, history, moderation, uploads, and admin endpoints.
- **Socket gateway:** authenticated connections, presence, signaling relay, reconnection, and room-scoped ephemeral events.
- **Firebase Admin:** token verification, privileged Firestore access, claims management, and trusted Storage workflows.
- **Redis:** Socket.IO adapter, presence registry, rate limits, idempotency keys, and short-lived coordination data. It is not the source of truth.
- **Workers and durable queue:** notifications, cleanup, audit fan-out, analytics aggregation, recording lifecycle, and retries.

Request flow: Firebase ID token → Express middleware verification → schema validation → service authorization → Firestore repository/transaction → versioned JSON response and audit event. Use transactions for capacity, memberships, and state transitions. Use idempotency keys for retryable creation and command requests.

API conventions: `/v1` versioning, cursor pagination, bounded queries, RFC 9457-like error bodies with stable error codes, request IDs, per-actor/IP rate limits, and structured logs.

## 3. Frontend Architecture

- Lazy-load route-level pages and guard authenticated/authorized routes.
- Use a query/cache layer for REST data; invalidate on successful mutation and relevant socket events.
- Firebase client SDK manages auth and only tightly rule-protected Firestore reads/listeners. Privileged writes go through the API.
- A single Socket service connects after token availability, refreshes connection authentication after token changes, and offers typed subscriptions.
- A WebRTC service owns peer connections/transports, local tracks, ICE restart, quality stats, and cleanup.
- Separate durable server data, ephemeral UI state, presence state, and high-frequency media state to avoid unnecessary renders.

The client validates all received payloads, ignores stale room revisions, and treats server role/capacity decisions as authoritative.

## 4. Socket.IO Event Flow

1. Client gets a Firebase ID token and opens WSS with the token in Socket.IO auth data.
2. Gateway verifies it, applies connection/IP quotas, and attaches a typed actor.
3. Client sends `room:join` with `roomId` and an operation ID.
4. Gateway checks membership/policy, joins `room:<roomId>`, writes short-lived presence to Redis, and returns `room:joined` with room revision and participant snapshot.
5. It broadcasts `participant:joined`; a grace period prevents false leaves during reconnects.

| Direction | Events | Purpose |
|---|---|---|
| Client → server | `room:join`, `room:leave` | Presence lifecycle |
| Client → server | `signal:offer`, `signal:answer`, `signal:ice` | Targeted WebRTC signaling |
| Client → server | `media:state`, `room:command` | State and moderated actions |
| Server → client | `room:joined`, `room:error` | Command outcome |
| Server → room | `participant:*`, `room:state` | Presence and authoritative state |
| Server → client | `signal:*` | Targeted signaling delivery |

State-changing commands require acknowledgements and idempotency keys. Signals are never persisted and may only be sent between currently authorized members of the same room. Apply event schemas, payload caps, and event-specific rate limits. Use a Redis adapter plus load-balancer sticky sessions when scaling sockets across API instances.

## 5. WebRTC Flow

1. After joining, select mesh or SFU mode from room policy.
2. Request devices and create local media tracks.
3. In mesh, a deterministic initiator creates `RTCPeerConnection`, adds tracks, creates an SDP offer, and relays it through Socket.IO.
4. The target sets the offer, returns an SDP answer, and both sides exchange trickle ICE candidates.
5. Configure STUN plus mandatory TURN using short-lived authenticated credentials issued by the backend.
6. On network changes, use bounded ICE restart retries; surface reconnecting/failure states in the UI.
7. On exit, close connections, remove remote streams, stop locally owned tracks as appropriate, and clear timers.

For SFU mode, use simulcast/adaptive bitrate and autoscale by publisher count, packet load, CPU, and egress bitrate. Sample `getStats()` for RTT, loss, jitter, bitrate, selected candidate type, and connection state. Use `replaceTrack` for device changes; do not renegotiate for mute/unmute. WebRTC uses DTLS-SRTP; true E2EE through an SFU requires a separately approved insertable-streams design.

## 6. Authentication Flow

1. User signs in with Firebase Auth (OIDC, email/password, or configured SSO).
2. Firebase SDK refreshes short-lived ID tokens.
3. Client attaches its current token to REST requests and Socket.IO authentication.
4. Express/Socket middleware verifies tokens with Firebase Admin and maps claims to an actor.
5. Every room operation rechecks membership and policy; a valid token alone grants no room access.
6. Global role changes use Admin custom claims; room roles live in membership documents. Clients refresh token and reconnect after changes.

Use `user`, `host`, `moderator`, and `admin` roles. Check revocation for sensitive actions and use an authorization-version value to reject stale privileges.

## 7. Firestore Collections

Firestore holds durable product state. Keep live presence, socket IDs, ICE, typing, and media-quality telemetry in Redis/client memory.

| Collection / path | Key fields | Purpose |
|---|---|---|
| `users/{uid}` | profile, status, timestamps | User profile subset |
| `rooms/{roomId}` | ownerId, state, mode, capacity, participantCount, revision | Room configuration/lifecycle |
| `rooms/{roomId}/members/{uid}` | role, status, permissions, joinedAt | Durable room authorization |
| `rooms/{roomId}/sessions/{sessionId}` | start/end, mode, participant summary | Historical sessions |
| `rooms/{roomId}/messages/{messageId}` | senderId, body, createdAt, deletedAt | Optional durable chat |
| `invites/{inviteId}` | roomId, recipient, expiry, usage/status | Server-created invitations |
| `auditLogs/{eventId}` | actor, action, target, occurredAt | Append-only audit trail |
| `idempotency/{scope_key}` | request hash, result, expiry | Retry safety |

Capacity and member count updates occur within Firestore transactions; periodically reconcile counts. Version required composite indexes and Firestore/Storage rules alongside infrastructure.

## 8. Security

- HTTPS/WSS only, HSTS, TLS 1.2+, CORS allowlist, CSP, and no token logging.
- Verify Firebase tokens on every privileged backend action; MFA for admins and revocation on compromise.
- Default-deny Firestore/Storage rules, membership-scoped queries, and independent server-side authorization checks.
- Managed secret storage for Firebase Admin credentials, Redis, TURN secret, and third-party keys; never commit service accounts.
- Time-limited HMAC TURN credentials; restrict relay ports and monitor allocation/bandwidth abuse.
- Runtime validation, body/event size caps, API/event rate limits, connection quotas, abuse/risk controls, and audit logging.
- Data minimization, controlled retention/deletion, encrypt managed data at rest, and pseudonymous operational logs.
- Lockfiles, dependency and container scanning, SBOMs, signed artifacts, and regular patching.

## 9. Deployment

Use isolated development, staging, and production Firebase/cloud projects, domains, service accounts, Redis instances, and TURN credentials. Develop and test integrations with Firebase Emulator Suite.

- Publish the React SPA to a CDN with immutable hashed assets.
- Deploy containerized Express/Socket.IO behind a WebSocket-capable regional load balancer, health checks, autoscaling, and session affinity.
- Run at least two API instances across failure domains and configure the Redis Socket.IO adapter.
- Use managed HA Redis, preserving application truth in Firestore.
- Deploy TURN across at least two zones/regions with UDP and TCP/TLS listeners, alarms, and sufficient relay egress.
- Run a dedicated managed or self-hosted SFU pool, independently autoscaled from the API.
- Store artifacts in Cloud Storage with strict rules and lifecycle policies.

CI/CD stages: format/lint, type checks, tests, Firebase-emulator integration tests, dependency/container scans, staged rollout, and rollbackable releases. Provision with Terraform and version Firestore rules/indexes with the application.

## 10. Scalability

Capacity planning must use explicit targets for concurrent users, sockets, rooms, publishers per SFU, TURN egress, and messages per second; do not equate 10,000 registered users with 10,000 simultaneous broadcasters.

| Layer | Scale approach |
|---|---|
| CDN | Stateless global asset delivery |
| API | Stateless horizontal autoscaling on latency, CPU, and concurrency |
| Socket.IO | Autoscale on active connections/event throughput; Redis adapter + affinity |
| Mesh | Hard cap at 2–4 participants |
| SFU | Shard rooms; autoscale on packets, publishers, CPU, and egress |
| TURN | Scale on allocations and network bandwidth; regional placement |
| Firestore | Indexed narrow queries, no hot documents, sharded counters if required |
| Workers | Independent scaling by durable queue depth and age |

Instrument structured logs, distributed traces, API/socket/SFU/TURN metrics, and SLOs for join success, signaling delivery, WebRTC connect time, API errors, and media quality. Create runbooks for Redis, Firebase quota, TURN, SFU, token verification, and abuse incidents. Before launch, execute concurrency/load tests, adverse-network tests, authorization security tests, and failure simulations for API, Redis, TURN, and SFU outages.

## Architecture Decisions to Record

Create ADRs before implementation for mesh versus SFU launch strategy, chosen SFU/TURN hosting and regions, direct Firestore access policy, role/moderation/invitation model, recording and retention, E2EE requirements, and availability/recovery objectives.
