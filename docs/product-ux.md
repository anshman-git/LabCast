# LabCast Product UX Specification

**Role:** Lead Product Design direction for LabCast  
**Audience:** College teachers and students working in live computer-lab classrooms  
**Status:** Product-level design specification; implementation intentionally out of scope  
**Related visual direction:** Existing LabCast landing page tokens in [`client/src/index.css`](../client/src/index.css) and glass surfaces in [`client/src/App.css`](../client/src/App.css)

---

## 1. Product direction

LabCast should feel like a calm command center for a room full of screens. The product is not a generic LMS: the highest-value action is making the teacher's live context visible while keeping questions, participation, attendance, and shared files close at hand.

### Design principles

1. **The room is the primary object.** Every dashboard should make the next classroom action obvious.
2. **Signal over decoration.** Reserve cyan for active/live/primary actions, green for healthy or complete states, and magenta for attention or secondary emphasis.
3. **Dense where decisions happen, spacious where people orient.** Dashboards use purposeful groups and lists; live classroom mode gives the shared screen most of the canvas.
4. **Never hide the recovery path.** Empty, loading, offline, permission, and error states always include the next useful action.
5. **Teacher and student parity.** Both roles use the same mental model—rooms, people, activity, resources—while seeing role-specific actions.
6. **Accessible by default.** Keyboard order, visible focus, reduced motion, readable contrast, captions, and screen-reader labels are part of the design, not polish after implementation.

### Visual language

| Token | Value | Usage |
| --- | --- | --- |
| Ink | `#010B13` | App canvas and auth background |
| Sidebar ink | `#050A0F` | Persistent navigation, darker than content |
| Panel blue | `#0F172A` | Elevated surfaces and cards |
| Existing charcoal | `#1C2A36` | Secondary surface and input backgrounds |
| Sky aqua | `#00CCFF` | Primary action, live status, active navigation, focus |
| Biological green | `#00FF9D` | Healthy, complete, connected, present |
| Hyper magenta | `#BF00FF` | Attention, Q&A, selected secondary states |
| Cloud | `#F4F8FB` | Primary text |
| Mist | `#91A5B7` | Secondary text and metadata |
| Fog | `#CBD8E3` | Strong secondary text on dark surfaces |
| Glass line | `rgba(255,255,255,.12)` | Borders and separators |
| Error | `#FF6678` | Errors, failed connection, destructive feedback |
| Warning | `#F6C760` | Needs attention, pending work |

- **Typography:** Space Grotesk for headings and navigation labels; Source Sans 3 for reading-heavy content; JetBrains Mono or a system monospace for room codes, IDs, timestamps, and metrics.
- **Spacing:** 8px base unit. Page gutters: 24px mobile, 32px tablet, 40px desktop. Card padding: 20–24px. Dense list rows: 12–16px vertical padding.
- **Shape:** 24px panel radius, 18px card radius, 12px controls, 999px status pills. Avoid rounding every row when a divider communicates hierarchy better.
- **Glass recipe:** translucent panel fill, `backdrop-blur-xl`, 1px glass line, a subtle inset top highlight, and restrained tinted depth. Never use blur without a fill and border.
- **Motion:** 160–220ms ease-out for controls; 240–320ms for drawers and panels; live status may pulse once every 2.5s. Respect `prefers-reduced-motion` and replace movement with instant state changes.

---

## 2. Global application shell

### Desktop shell

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  LabCast mark       [room / course context]                 Search   Bell  Avatar │  64px top bar
├───────────────┬───────────────────────────────────────────────┬─────────────────┤
│  Workspace     │                                               │                 │
│  ● Dashboard   │                                               │  Optional       │
│    My classes  │                 Page content                  │  context rail   │
│    Calendar    │                                               │  (activity,     │
│               │                                               │   details, or   │
│  Workspace     │                                               │   people)       │
│    Resources   │                                               │                 │
│    Messages    │                                               │                 │
│               │                                               │                 │
│  Account       │                                               │                 │
│    Profile     │                                               │                 │
│    Settings    │                                               │                 │
│               │                                               │                 │
│  Help          │                                               │                 │
│  Collapse      │                                               │                 │
└───────────────┴───────────────────────────────────────────────┴─────────────────┘
  248px sidebar               flexible content                     300–360px rail
```

- Top bar is contextual rather than a second full navigation: breadcrumb/room name on the left, global search, notifications, help, and avatar menu on the right.
- The right rail is optional. Do not reserve it on pages that do not need context.
- Sidebar active state uses a narrow aqua rail, a low-opacity aqua surface, and an icon plus label; do not rely on color alone.
- Sidebar collapse preserves icon labels through tooltips and an accessible `aria-label`.

### Mobile shell

```text
┌───────────────────────────────┐
│  ☰  LabCast        Bell  AV   │  56px top bar
├───────────────────────────────┤
│                               │
│          page content         │
│                               │
├───────────────────────────────┤
│ Dashboard  Classes  +  Bell  AV│  optional bottom nav
└───────────────────────────────┘
```

- Hide the desktop sidebar behind a modal drawer triggered by the menu button.
- Keep the current page title in the top bar and provide a visible close button in the drawer.
- On classroom mobile, replace the global shell with the live-room shell described below; keep Leave visible at all times.
- Use a bottom navigation only for the four highest-frequency destinations: Dashboard, Classes, Create/Join, Notifications. Profile and Settings remain in the drawer.

### Shared components

- `AppShell`: top bar, persistent navigation, page title, optional context rail.
- `SidebarNav`: role-aware item groups, active state, collapse, mobile drawer.
- `Breadcrumbs`: page hierarchy or current course/room context.
- `GlobalSearch`: search rooms, people, files, and messages with recent searches and no-results state.
- `NotificationBell`: unread count, keyboard-accessible popover, link to full notification screen.
- `AvatarMenu`: profile, role switch if permitted, help, sign out.
- `StatusPill`: Live, Upcoming, Draft, Offline, Needs attention, Complete.
- `GlassCard`: reserved for meaningful grouping or elevation, not every list row.
- `PrimaryButton`, `SecondaryButton`, `QuietButton`, `DestructiveButton`, `IconButton`.
- `SkeletonBlock`, `EmptyState`, `ErrorState`, `Toast`, `ConfirmDialog`.

### Role model

- **Teacher:** create/manage rooms, start sharing, manage participants, moderate chat/Q&A, take attendance, share resources, view analytics.
- **Student:** join rooms, view schedule, follow screen share, raise hand, chat/Q&A, share screen when allowed, submit/access resources, view personal attendance and feedback.
- **Shared:** profile, settings, notifications, help, sign out.

---

# 3. Screen specifications

## Screen 1 — Login

### Goal
Let a returning teacher or student enter LabCast with the least possible friction while preserving confidence about the correct workspace.

### Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LabCast mark                                             Help             │
├───────────────────────────────┬──────────────────────────────────────────┤
│                               │                                          │
│  [ambient abstract visual]    │       Welcome back                       │
│  "Every screen in sync."      │       Sign in to your classroom workspace│
│  01 / 02 / 03 small proof      │                                          │
│                               │       Work email                         │
│                               │       [________________________]         │
│                               │       Password                 [show]    │
│                               │       [ ] Remember me   Forgot password? │
│                               │       [        Sign in        ]          │
│                               │       ───────── or ─────────              │
│                               │       [ Continue with Google ]           │
│                               │       New to LabCast? Create account     │
└───────────────────────────────┴──────────────────────────────────────────┘
```

### Components

- Auth shell with LabCast mark, help link, and split visual panel.
- Email input, password input with show/hide button, remember-me checkbox.
- Primary sign-in button with loading state.
- Secondary social login button(s), using monochrome provider marks.
- Forgot password link and create-account link.
- Inline form validation and a page-level error banner for service failures.

### Layout and sidebar

- Desktop: 42% ambient visual panel / 58% form panel, centered form max width 420px.
- Tablet: visual panel becomes a shallow top banner; form remains centered.
- Mobile: visual panel becomes a compact 120–160px header with the promise statement; form occupies the full viewport with 20–24px gutters.
- No application sidebar. Auth navigation is intentionally limited to help and account recovery.

### Cards and buttons

- Form sits in a single glass panel; inputs use a quiet filled surface with an aqua focus line.
- Primary: `Sign in`; secondary: `Continue with Google`; quiet: `Forgot password?`.
- Disable the primary button only while submitting; do not disable it simply because the form is empty.

### Empty, loading, and error states

- **Empty:** untouched fields with visible labels and example format text; never rely on placeholders as labels.
- **Loading:** button label changes to `Signing in…`, includes a small spinner, preserves width, and prevents duplicate submission.
- **Validation:** `Enter a valid university email` / `Enter your password` under the relevant field, announced with `aria-live`.
- **Error:** inline `Email or password is incorrect` without revealing which credential failed; include `Forgot password?`.
- **Service error:** top alert `LabCast is having trouble signing you in. Try again or check your connection.` with retry.

### Accessibility

- Form has a visible `Sign in` heading and a programmatic form label.
- Every input has a persistent `<label>`, `autocomplete`, and described-by relationship for errors.
- Password visibility control has an accessible name and does not move focus.
- Focus order: email → password → remember → forgot → sign in → social → register.
- Do not use the ambient visual as the only source of meaning; decorative images are hidden from assistive technology.

---

## Screen 2 — Register

### Goal
Create an account and establish the correct role without forcing the user through a long onboarding wizard.

### Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LabCast mark                                             Already a member │
├───────────────────────────────┬──────────────────────────────────────────┤
│  [ambient visual]              │       Create your LabCast account        │
│  Teach clearly. Learn together.│       Name [________________________]    │
│                               │       University email [______________]  │
│                               │       Password [________________ show]   │
│                               │       I am a   ( Teacher ) ( Student )    │
│                               │       [ ] I agree to Terms + Privacy     │
│                               │       [       Create account       ]     │
│                               │       Already have an account? Sign in   │
└───────────────────────────────┴──────────────────────────────────────────┘
```

### Components

- Name, university email, password fields.
- Role selector as a two-option segmented control with descriptions, not a hidden select.
- Terms checkbox with linked documents.
- Create account button, sign-in link, inline validation.
- Optional invitation-code field appears only when the user arrives from a classroom invite.

### Layout and sidebar

- Same auth shell as Login for recognition and lower cognitive load.
- Desktop form max width 460px because of the role selector and consent row.
- Mobile stacks fields and makes role choices full-width, 48px minimum height.

### Cards and buttons

- Role options are two selectable cards with radio semantics; selected state uses border + icon + text, not color alone.
- Primary: `Create account`; quiet: `Sign in`.
- If an invite is present, show a compact context card above the form: `You were invited to Intro to UX Systems by Riley Bennett`.

### Empty, loading, and error states

- **Empty:** role unset; the primary action remains available but shows the role error on submit.
- **Loading:** `Creating account…` with preserved button width.
- **Validation:** name length, university email, password requirements, role required, terms required.
- **Error:** duplicate email message with `Sign in instead` action; invalid invitation with `Ask for a new invite`.
- **Success:** transition to a short role-specific welcome screen, then the appropriate dashboard; do not drop users on an unexplained blank dashboard.

### Accessibility

- Role selector uses `radiogroup`/`radio` semantics and supports arrow-key selection.
- Password requirements are visible before typing and announced as a list; do not rely on color changes.
- Terms link opens in a new tab only with explicit accessible text.
- Maintain logical error focus: move focus to the first invalid field after submit.

---

## Screen 3 — Teacher Dashboard

### Goal
Help teachers answer three questions in under five seconds: What is live? What is next? What needs my attention?

### Wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ sidebar │ Dashboard                                      Search  Bell  RB        │
│         ├───────────────────────────────────────────────────────────────────────┤
│         │ Good morning, Riley                         [ Create classroom ]       │
│         │ Tuesday, October 14                           [ Join with code ]        │
│         │                                                                       │
│         │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────────────┐ │
│         │ │Live rooms  │ │Attendance │ │To review  │ │This week              │ │
│         │ │ 01         │ │ 91.8%     │ │ 14 items  │ │ +12% participation    │ │
│         │ └────────────┘ └────────────┘ └────────────┘ └───────────────────────┘ │
│         │                                                                       │
│         │ Active classrooms                                  View all →         │
│         │ ┌───────────────────────┐ ┌───────────────────────┐                  │
│         │ │ LIVE · Design Systems │ │ UPCOMING · Web Studio │                  │
│         │ │ 24 participants       │ │ Starts in 42 min      │                  │
│         │ │ [Enter classroom]     │ │ [Open details]        │                  │
│         │ └───────────────────────┘ └───────────────────────┘                  │
│         │                                                                       │
│         │ Recent activity                         Requires attention           │
│         │ timeline / submissions                 [3 unread]                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Teacher `AppShell` with Dashboard active.
- Greeting header with current date, primary `Create classroom`, secondary `Join with code`.
- KPI strip: Live rooms, attendance, pending review, participation trend.
- Active classroom cards with live status, participant count, next action, and overflow menu.
- Recent activity timeline for joins, raised hands, file shares, and submissions.
- Requires-attention list with priority, student/class context, and direct action.
- Optional right context rail for today's schedule and activity feed.

### Layout and sidebar

- Desktop: 248px sidebar, flexible 8-column main, optional 300px context rail.
- Main content order: greeting/actions → KPI strip → active rooms → activity/attention.
- Sidebar groups: Overview (Dashboard, Calendar), Teaching (Classrooms, Resources), Account (Profile, Settings).
- Tablet: hide context rail and move attention list below active classrooms.
- Mobile: top bar + drawer; KPI cards become a 2×2 grid; active room becomes a horizontal snap list; attention is placed before recent activity.

### Cards and buttons

- KPI items use flat grouped surfaces, not four identical floating cards; the live metric gets a subtle aqua rail.
- Active classroom cards are the dominant cards and have one clear action each.
- Primary: `Create classroom`; contextual live action: `Enter classroom`; secondary: `Join with code`.
- Overflow menu actions: Edit, Duplicate, Archive. Destructive archive requires confirmation.

### Empty, loading, and error states

- **No classrooms:** empty state with a monitor-plus icon, `Create your first classroom`, and a secondary `Join a classroom` action.
- **No attention items:** positive state `Nothing needs your attention right now.` with a muted check icon.
- **Loading:** shell appears immediately; greeting and card regions use content-shaped skeletons; no layout jump.
- **Partial error:** failing widget shows `Could not load attendance` + `Retry`; other widgets remain usable.
- **Offline:** top status strip explains that last-known classroom data is shown and live actions are unavailable.

### Accessibility

- KPI labels are associated with values; trends include text such as `up 12 percent from last week`.
- Live classroom status is not communicated only by pulse/color; use `Live, 24 participants` text.
- Activity timeline uses list semantics and readable timestamp text, not only relative time.
- Keyboard shortcut hints are supplemental, never the only way to trigger actions.

---

## Screen 4 — Student Dashboard

### Goal
Give students one obvious next action and a trustworthy overview of where they stand across classes.

### Wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ sidebar │ Student home                                  Search  Bell  AS     │
│         ├───────────────────────────────────────────────────────────────────┤
│         │ Next up                                                            │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │ LIVE NOW · Design Systems 204                                 │ │
│         │ │ Intro to UX Systems · Room DS-204                             │ │
│         │ │ [ Join classroom ]            Starts now                      │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ Your progress                    My classes                      │
│         │ ┌────────────────┐               [DS204] [Web Studio] [Research]  │
│         │ │ 68% complete   │               horizontal class cards            │
│         │ │ 4 of 6 modules │                                               │
│         │ └────────────────┘                                               │
│         │                                                                   │
│         │ Upcoming work                       Recent feedback               │
│         │ ┌──────────────────────────────┐   ┌──────────────────────────┐  │
│         │ │ Assignment · due tomorrow   │   │ Prototype critique        │  │
│         │ │ Reading · due Friday        │   │ 87 / 100 · Riley          │  │
│         │ └──────────────────────────────┘   └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Student `AppShell` with Dashboard active.
- `NextUpCard` with live/upcoming state, teacher, course, room, and one primary action.
- Progress overview with accessible textual percentage and a visual ring or bar.
- My classes horizontal list with current attendance and next session.
- Upcoming work list with due dates and urgency.
- Recent grades/feedback list with teacher comment preview.

### Layout and sidebar

- Desktop: 248px sidebar + 2-column main; no persistent right rail unless a course is selected.
- Sidebar groups: Overview (Dashboard, Calendar), Learn (My classes, Resources), Account (Profile, Settings).
- Mobile: Next Up occupies the first viewport; classes become horizontally scrollable with visible scroll affordance; lists become one column.

### Cards and buttons

- `NextUpCard` is the strongest surface and changes treatment for Live, Starting soon, or Upcoming.
- Progress is a single meaningful grouped module, not multiple decorative rings.
- Primary: `Join classroom`, `Open assignment`, or `View feedback`, depending on state.
- Quiet actions: `View all classes`, `See all feedback`.

### Empty, loading, and error states

- **No upcoming work:** `You are all caught up.` with a calendar icon and link to class resources.
- **No feedback:** `Feedback will appear here after your teacher reviews your work.`
- **No enrolled classes:** `Join your first classroom` with room-code input action.
- **Loading:** skeleton for Next Up, one progress block, and list rows; keep sidebar and top bar interactive.
- **Error:** if one class feed fails, isolate the error to that class and show `Try again`; do not replace the entire dashboard.

### Accessibility

- Progress ring has a hidden text equivalent: `Course progress: 68 percent, 4 of 6 modules complete`.
- Due dates include absolute date and relative urgency, e.g. `Due Friday, October 17 — in 2 days`.
- Horizontal class carousel supports keyboard focus, visible scroll buttons, and no critical content hidden offscreen.

---

## Screen 5 — Classroom

### Goal
Make a live teaching session feel immediate, legible, and resilient when bandwidth or attention is limited.

### Wireframe

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ LabCast / Design Systems 204   LIVE ●   24 present       Chat  Q&A  People  ⋯  │
├───────────────────────────────────────────────────────────────┬────────────────┤
│                                                               │ Chat           │
│                                                               │ ─────────────  │
│                 shared screen / presentation                  │ Alex: question │
│                    70% of viewport                           │ Teacher: reply │
│                                                               │                │
│  [presenter badge]                              [fit] [fullscreen]│ [message…]  │
├───────────────────────────────────────────────────────────────┴────────────────┤
│          mic     camera       [ Share screen ]      raise hand     ⋯   [Leave]  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Full-screen classroom shell with room name, live status, participant count, connection indicator, and exit action.
- Main stage for teacher screen share or fallback states.
- Right interaction panel with tabs: Chat, Q&A, Participants.
- Bottom floating control dock: mute, camera, screen share, raise hand, more controls, leave.
- Teacher-only controls: start/stop share, participant moderation, mute all, lock room, end room.
- Student-only controls: raise hand, request screen share if enabled, report issue.
- Connection-quality indicator with text status and a details popover.

### Layout and sidebar

- No global application sidebar during a live session. Classroom controls are the navigation.
- Desktop: stage 70–76% width, interaction panel 24–30%; panel can collapse to maximize stage.
- Tablet: stage remains primary; interaction panel becomes a drawer or bottom sheet.
- Mobile: stage is full width above a tabbed sheet; controls are two rows if required. Leave remains a labeled red button, never hidden in overflow.

### Cards and buttons

- Stage is not a card; it is the canvas. Use a small status overlay and minimal chrome.
- Chat messages use grouped bubbles: teacher messages get a left aqua marker; student messages get neutral glass fill.
- Primary live action: `Share screen`; destructive: `Leave` / teacher `End classroom`.
- `Raise hand` has selected/unselected state plus explicit text label for screen readers.
- Avoid icon-only controls for microphone, camera, or screen share unless tooltips and accessible names are present.

### Empty, loading, and error states

- **Waiting room:** stage shows `The teacher will start sharing soon` with participant count and a calm illustration/icon.
- **No chat:** `Start the conversation with a question or note.`
- **No participants:** teacher sees `Share the room code to invite your class`; student sees `Waiting for classmates`.
- **Loading:** stage skeleton includes the expected aspect ratio; controls remain present but disabled only when the underlying capability is unavailable.
- **Permission error:** `LabCast needs microphone access to use audio` with a browser-permission help action.
- **Connection degradation:** persistent but non-blocking banner `Your connection is unstable. Video quality is reduced.` with retry/reconnect.
- **Share failure:** inline stage error with `Try again` and `Share a different window`.
- **Room ended:** replace the stage with summary actions: `View attendance`, `Download shared files`, `Return to dashboard`.

### Accessibility

- Provide live captions and a transcript entry point; identify speakers in captions.
- Announce join/leave, raised hand, and Q&A events through a polite live region, with a user setting to reduce announcements.
- Maintain keyboard shortcuts for mute, raise hand, and chat, but expose them in visible help.
- Focus trap only inside a modal/bottom sheet; never trap focus in the whole classroom.
- Ensure stage has a meaningful accessible label: `Screen shared by Riley Bennett: Intro to UX Systems`.
- Respect reduced motion and provide an audio-only fallback for low bandwidth.

---

## Screen 6 — Profile

### Goal
Let a person manage their identity and what classmates/teachers see without mixing personal preferences into account settings.

### Wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ sidebar │ Profile                                                           │
│         ├───────────────────────────────────────────────────────────────────┤
│         │ Profile                                                           │
│         │ Manage the identity shown in classrooms and feedback.             │
│         │                                                                     │
│         │ ┌────────────────────┐  ┌────────────────────────────────────────┐ │
│         │ │ [avatar]           │  │ Display name [ Riley Bennett        ] │ │
│         │ │ Change photo       │  │ Pronouns     [ they / them          ] │ │
│         │ │ JPG/PNG · 5MB      │  │ Department   [ Interaction Design   ] │ │
│         │ └────────────────────┘  │ Bio          [______________________] │ │
│         │                         └────────────────────────────────────────┘ │
│         │ Public classroom preview: [ avatar ] Riley Bennett · Teacher       │
│         │                                                     [ Save changes ]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Standard `AppShell`, Profile active in Account group.
- Avatar upload/dropzone with preview, remove, and validation.
- Display name, pronouns, department/major, short bio.
- Role badge and classroom identity preview.
- Save bar that appears only when there are unsaved changes.

### Layout and sidebar

- Desktop: main content max width 920px, two-column form after the avatar block.
- Profile is a top-level sidebar destination; Settings remains separate.
- Mobile: avatar block first, fields stack, save bar becomes sticky at the bottom with safe-area padding.

### Cards and buttons

- Avatar upload is a dashed-border interaction surface; form fields are grouped in one panel.
- Primary: `Save changes`; secondary: `Cancel`; destructive: `Remove photo` with confirmation.
- Preview is a flat inline section separated by a divider, not another decorative card.

### Empty, loading, and error states

- **No avatar:** initials fallback with `Add a profile photo`.
- **Loading:** avatar preview skeleton and disabled save only during upload; text fields should remain editable.
- **Validation:** display name required; bio character counter; file type/size error next to upload.
- **Error:** save error banner with `Your changes were not saved. Try again.` and preserve form values.
- **Success:** non-blocking toast `Profile updated` plus a visible saved timestamp in the save bar.

### Accessibility

- File dropzone has a real file input, keyboard activation, and clear supported-format text.
- Avatar alt text follows the display-name value; decorative initials have an equivalent label.
- Character count is announced near the bio field without interrupting every keystroke.
- Unsaved changes are communicated before navigating away, not only through color.

---

## Screen 7 — Settings

### Goal
Give users control over notifications, display, privacy, security, and classroom defaults without overwhelming them.

### Wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ sidebar │ Settings                                                          │
│         ├──────────────────────┬────────────────────────────────────────────┤
│         │ Settings              │ Notifications                              │
│         │  Account              │ Choose what reaches you during class.      │
│         │  Notifications        │                                            │
│         │  Display              │ Email notifications     [ on  ]            │
│         │  Classroom             │ In-app mentions         [ on  ]            │
│         │  Security              │ Classroom reminders     [ on  ]            │
│         │                       │ Quiet hours              [ 22:00 — 07:00 ] │
│         │                       │                                            │
│         │                       │ Classroom defaults                        │
│         │                       │ Allow student screen share [ on ]         │
│         │                       │ Save chat transcript      [ off ]          │
│         │                       │                                            │
│         │                       │                          [ Save changes ]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Settings shell with secondary settings navigation: Account, Notifications, Display, Classroom, Security.
- Toggle rows with descriptions, not unlabeled switches.
- Selects/time inputs for quiet hours, timezone, default room behavior.
- Security actions: change password, active sessions, sign out all devices, delete account.
- Sticky save bar with dirty state and reset action.

### Layout and sidebar

- Desktop: global sidebar plus a 216px settings subnav and 640–720px content column.
- Mobile: settings subnav becomes a select-like navigation header or accordion list; one settings category per view.
- Keep destructive account controls visually separated at the bottom of Security.

### Cards and buttons

- Prefer grouped sections separated by dividers over a grid of setting cards.
- Each setting row has label, helper text, current value/control, and optional inline status.
- Primary: `Save changes`; quiet: `Reset`; destructive: `Sign out all devices`, `Delete account`.
- Toggles have 44px minimum tap area, visible on/off text or an accessible state label.

### Empty, loading, and error states

- **No settings changes:** hide the save bar or show a disabled `No changes` state; do not present a fake save action.
- **Loading:** preserve setting labels and show skeleton control shapes only for remote preferences.
- **Error:** field-level save errors remain adjacent to their setting; page-level error summarizes if multiple saves fail.
- **Security failure:** re-authentication dialog with reason and cancel path; never silently fail.

### Accessibility

- Settings navigation uses a landmark and current-page indication.
- Toggle controls use `switch` semantics and expose `aria-checked` plus the current state in text.
- Do not use a color-only warning for destructive settings; include explanatory copy.
- Keep keyboard focus in the same setting after autosave or validation.

---

## Screen 8 — Notifications

### Goal
Make important classroom events actionable without turning every interaction into an interruption.

### Wireframe

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ sidebar │ Notifications                              [ Mark all as read ]   │
│         ├───────────────────────────────────────────────────────────────────┤
│         │ [All] [Mentions] [Classrooms] [Grades]     Filter / settings      │
│         │                                                                     │
│         │ TODAY                                                               │
│         │ ┃ [grade]  Assignment reviewed                                       │
│         │ ┃          Riley left feedback on Prototype critique · 8 min ago     │
│         │ ┃ [chat]   Mention in Design Systems 204                            │
│         │            “Can you look at the second screen?” · 24 min ago        │
│         │                                                                     │
│         │ EARLIER                                                             │
│         │   [room]   Web Studio starts tomorrow at 10:00 AM                    │
│         │            Reminder · Yesterday                                    │
│         │                                                                     │
│         │                         [ Load more ]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

- Notifications page with unread count, filter tabs, mark-all-read action, and settings link.
- Notification list grouped by date with type icon, title, context, timestamp, unread indicator, and direct action.
- Notification types: grade, announcement, mention, classroom, raised hand, file, system.
- Optional notification drawer opened from the global bell; drawer and full page share the same row component.
- Bulk actions: mark read/unread, archive only if product policy supports it.

### Layout and sidebar

- Desktop: global sidebar + centered 760px notification column; no right rail needed.
- The bell popover shows the latest 5 notifications and a `View all notifications` link.
- Mobile: filter tabs become horizontally scrollable; mark-all action remains in the top bar; rows use full width and larger tap targets.

### Cards and buttons

- Use divided list rows rather than an array of identical cards.
- Unread rows get an aqua left border and a small status dot, plus a bold title; read state remains visually legible.
- Primary action is contextual per row: `View feedback`, `Open classroom`, `View file`.
- Quiet action: `Mark all as read`; filter controls are text buttons/tabs.

### Empty, loading, and error states

- **No notifications:** centered ghost/bell icon, `You are all caught up`, and a link to notification preferences.
- **Filtered empty:** `No grade notifications yet` with `Clear filter`.
- **Loading:** 5 realistic list-row skeletons with preserved grouping rhythm.
- **Error:** `Notifications could not load` with retry; keep the bell accessible and show an error badge only if necessary.
- **Permission/quiet mode:** explain when notifications are paused and provide a direct settings action.

### Accessibility

- Notifications list uses list semantics; unread state is included in the accessible name.
- Timestamp includes an absolute date/time in a visually hidden label.
- New notification announcements are polite and batched; do not announce every chat message during a live classroom.
- Filter tabs support arrow-key movement and expose selected state.
- Mark-all confirmation is not required for reversible read/unread actions; undo is preferred.

---

# 4. Cross-screen state system

## Loading

- Render the global shell immediately so users know the product has loaded.
- Skeletons match the final geometry and preserve the same reading order.
- Avoid full-screen spinners except for route-level authentication or classroom connection.
- Do not animate skeletons for users with reduced motion; use a static low-contrast block.

## Empty

Every empty state has four parts:

```text
[contextual icon]
Short, human heading
One sentence explaining why this is empty
[primary next action]  [optional secondary action]
```

Copy should describe the next step, not imply the product is broken: `Create your first classroom`, `Join with a room code`, `You are all caught up`.

## Error

- Inline errors stay next to the failed field or widget.
- Page-level errors explain impact, preserve user input, and offer retry.
- Connection errors include whether the product is using stale data or whether actions are blocked.
- Destructive failures never leave the user guessing whether the action completed; show a clear final status.

## Success and undo

- Prefer low-interruption toasts with an undo action for reversible operations: archive, mark read, remove file.
- For saved forms, show a saved timestamp in addition to a toast so the confirmation persists after the toast disappears.

---

# 5. Core flows

## Teacher starts a live classroom

```text
Teacher dashboard → Create classroom → Configure title + sharing defaults
→ Classroom preflight → Start classroom → Live classroom stage
```

Preflight checks microphone, camera, screen-share capability, participant permissions, and the room code. A teacher can start with camera/mic off.

## Student joins a classroom

```text
Student dashboard → Join classroom → Enter room code or invitation link
→ Join preview (name + device permissions) → Waiting room or live stage
```

If the room is not live, the student sees the scheduled start time and can add a reminder rather than a dead-end error.

## Notification to action

```text
Bell → latest notification → contextual destination
→ perform action → return to original list with read state preserved
```

Deep links must preserve the course/room context and return the user to the originating notification position where possible.

---

# 6. Responsive and accessibility acceptance checklist

- Desktop shell works at 1280px and remains usable at 1024px without horizontal scrolling.
- Mobile layouts are designed for 390px width with 44px minimum touch targets.
- All primary flows are usable with keyboard only.
- Focus is visible against the dark canvas and never disappears inside glass surfaces.
- Every icon-only control has an accessible name and tooltip where useful.
- Color contrast meets WCAG AA for body text and controls; status color is always paired with text or iconography.
- Dialogs and drawers restore focus to their trigger when closed.
- Live classroom status, captions, chat, and connection changes have intentionally scoped announcements.
- Reduced-motion mode removes the product float, pulsing live indicator, and sliding transitions without removing state feedback.
- Errors are actionable, preserve input, and do not rely on a toast as the only communication channel.
- The interface supports browser zoom to 200% without losing access to classroom controls or primary actions.
- Screen reader order follows the visual priority: page title → primary action → critical status → content → secondary context.

---

## Product decision summary

LabCast uses one shared application shell and one shared state vocabulary across both roles. The teacher dashboard is attention-oriented, the student dashboard is next-action-oriented, the classroom is stage-oriented, and account surfaces are form-oriented. This keeps the product coherent without making teacher and student experiences identical.
