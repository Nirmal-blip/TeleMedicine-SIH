/**
 * Utility functions for cookie management
 */

/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * Check if a token cookie exists
 * @returns true if token cookie exists, false otherwise
 */
export const hasTokenCookie = (): boolean => {
  const token = getCookie('token');
  return token !== null && token !== '';
};

/**
 * Check if the token cookie is valid (not expired)
 * Note: This is a basic check. The actual validation happens on the server.
 * @returns true if token exists and appears valid, false otherwise
 */
export const isTokenValid = (): boolean => {
  const token = getCookie('token');
  if (!token) return false;
  
  try {
    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3;
  } catch {
    return false;
  }
};
