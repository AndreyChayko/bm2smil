/**
 * Server configuration constants.
 */
export const PORT = Number(process.env.PORT ?? 5174);

/** Maximum size (bytes) for JSON bodies (application/json and urlencoded). */
export const MAX_BODY_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/** Maximum size (bytes) for uploaded files via Multer. */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Maximum size (bytes) when fetching external JSON by URL. */
export const MAX_FETCH_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Timeout (ms) for external fetch requests. */
export const FETCH_TIMEOUT_MS = 10_000; // 10 seconds
