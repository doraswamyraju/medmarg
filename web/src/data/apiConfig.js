// MedMarg Dynamic API Base URL configuration
// Automatically targets current hostname (localhost on dev, VPS IP on production)

const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE = typeof window !== 'undefined' && window.location.hostname
    ? (isDev ? 'http://localhost:5080' : `http://${window.location.hostname}:5080`)
    : 'http://localhost:5080';

/**
 * Safe fetch helper with timeout so network delays/firewalls never hang the UI
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
