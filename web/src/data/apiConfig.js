// MedMarg Dynamic API Base URL configuration
// Automatically targets current hostname (localhost on dev, VPS IP on production)

export const API_BASE = typeof window !== 'undefined' && window.location.hostname 
    ? `http://${window.location.hostname}:5080` 
    : 'http://localhost:5080';
