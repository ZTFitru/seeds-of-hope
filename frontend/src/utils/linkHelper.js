/**
 * Helper function to get the correct link format based on environment
 * - In development: returns paths without .html (for Next.js routing)
 * - In production/build: returns paths with .html (for static HTML files)
 */
export function getLinkHref(path) {
  // In development mode, Next.js handles routing without .html
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // For production/static export, add .html extension if it's not the root or a hash link
  // Exempt hash links (e.g., '#contactus' or '/#contactus') from .html extension
  if (path === '/' || path.includes('#')) {
    return path;
  }
  
  // Add .html extension for all other paths
  return path.endsWith('.html') ? path : `${path}.html`;
}

