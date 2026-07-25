import 'dotenv/config';
function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value)
        throw new Error(`Missing required environment variable: ${name}`);
    return value;
}
export const config = {
    port: Number(process.env.PORT ?? 3001),
    clientOrigin: required('CLIENT_ORIGIN', 'http://localhost:5173'),
    reconnectGraceMs: Number(process.env.PRESENCE_RECONNECT_GRACE_MS ?? 10_000),
};
