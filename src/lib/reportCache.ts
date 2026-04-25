/**
 * Simple in-memory cache for generated reports keyed by Stripe / dev session_id.
 *
 * This cache lives only inside the current server process and is lost whenever
 * the serverless function, Node process, or deployment restarts. In production,
 * replace it with durable storage such as a database table or Redis so reports
 * remain idempotent across cold starts and multiple server instances.
 */
export const reportCache = new Map<string, string>();
