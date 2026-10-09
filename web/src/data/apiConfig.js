// MedMarg Dynamic API Base URL configuration
// Automatically targets current hostname & protocol (https vs http)

const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const protocol = isBrowser ? window.location.protocol : 'http:';

export const API_BASE = isBrowser
    ? (isDev 
        ? 'http://localhost:5080' 
        : `${protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`)
    : 'http://localhost:5080';

/**
 * Safe fetch helper with fallback and timeout
 */
export async function safeFetch(url, options = {}, timeoutMs = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

/**
 * Safe JSON parser helper to prevent Unexpected '<' token errors on HTML fallback
 */
export async function safeJson(response) {
    if (!response || !response.ok) return null;
    const ct = response.headers.get('content-type');
    if (ct && !ct.includes('application/json')) {
        return null;
    }
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}
