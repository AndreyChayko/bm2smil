import { FETCH_TIMEOUT_MS, MAX_FETCH_SIZE_BYTES } from '../config.js';
import { fetch } from 'undici';

/**
 * Validate that a string is an HTTP(S) URL and return the normalized URL.
 */
export function validateHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw Object.assign(new Error('Invalid URL'), { status: 400 });
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw Object.assign(new Error('Only http/https protocols are allowed'), { status: 400 });
  }
  return url;
}

/**
 * Fetch JSON with timeouts and basic size/content-type validation.
 * Throws an error with optional `status` property on failure.
 */
export async function fetchJsonWithLimits(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!resp.ok) {
      throw Object.assign(new Error(`Fetch failed: ${resp.status} ${resp.statusText}`), {
        status: 502,
      });
    }

    const contentType = resp.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      throw Object.assign(new Error('Remote resource is not JSON'), { status: 415 });
    }

    const contentLength = resp.headers.get('content-length');
    if (contentLength) {
      const len = Number(contentLength);
      if (Number.isFinite(len) && len > MAX_FETCH_SIZE_BYTES) {
        throw Object.assign(new Error('Remote JSON is too large'), { status: 413 });
      }
    }

    const text = await resp.text();
    if (new TextEncoder().encode(text).length > MAX_FETCH_SIZE_BYTES) {
      throw Object.assign(new Error('Remote JSON exceeds allowed size'), { status: 413 });
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw Object.assign(new Error('Failed to parse JSON from remote resource'), {
        status: 422,
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}
