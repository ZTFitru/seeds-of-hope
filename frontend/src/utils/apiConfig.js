/**
 * API Configuration
 * 
 * Centralized configuration for backend API endpoints.
 * Uses environment variables to switch between development and production URLs.
 * 
 * For Next.js static export, use NEXT_PUBLIC_ prefix for environment variables
 * as they are embedded at build time.
 */

/**
 * Get the base URL for API calls
 * @returns {string} The base URL for the backend API
 */
export function getApiBaseUrl() {
  // Priority 1: Use explicit API URL from environment variable (if set)
  // This can be a full URL like https://seedsofhopesc.org/backend
  // or a relative path like /backend
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL.trim();
    // Remove trailing slash if present
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  }
  
  // Priority 2: In development, use localhost
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Priority 3: For production builds without explicit URL, use relative path
  // This assumes the backend is served from /backend on the same domain
  return '/backend';
}

/**
 * Get the full API endpoint URL
 * @param {string} endpoint - The API endpoint path (e.g., '/api/contact')
 * @returns {string} The full URL to the API endpoint
 */
export function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}
