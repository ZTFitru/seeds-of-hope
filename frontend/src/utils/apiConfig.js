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
  // In production, use the production API URL from environment variable
  // Falls back to relative path /backend if not set (for same-domain deployment)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  
  // For production builds without explicit URL, use relative path
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
