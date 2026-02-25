'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getApiUrl } from '@/utils/apiConfig';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'soh_auth_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      if (newToken) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, []);

  const fetchCurrentUser = useCallback(
    async (jwt) => {
      if (!jwt) {
        setUser(null);
        return null;
      }

      try {
        const res = await fetch(getApiUrl('/api/users/me'), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);
          return null;
        }

        const data = await res.json();
        if (data && data.success && data.user) {
          setUser(data.user);
          return data.user;
        }

        setUser(null);
        return null;
      } catch (err) {
        console.error('Error fetching current user:', err);
        setUser(null);
        return null;
      }
    },
    []
  );

  // Initialize from localStorage on first load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        let storedToken = null;
        if (typeof window !== 'undefined') {
          storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        }
        if (storedToken) {
          setToken(storedToken);
          await fetchCurrentUser(storedToken);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (email, password) => {
      setAuthError(null);
      try {
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          const message =
            data.message || (res.status === 403 ? 'Your account is not approved for access yet.' : 'Invalid email or password.');
          setAuthError(message);
          return { success: false, message };
        }

        const jwt = data.token;
        saveToken(jwt);
        setUser(data.user || null);
        setAuthError(null);
        return { success: true, user: data.user, token: jwt };
      } catch (err) {
        console.error('Login error:', err);
        const message = 'Unable to log in. Please try again.';
        setAuthError(message);
        return { success: false, message };
      }
    },
    [saveToken]
  );

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
    setAuthError(null);
  }, [saveToken]);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const message = data.message || 'Unable to request an account. Please try again.';
        return { success: false, message, errors: data.errors || [] };
      }

      return {
        success: true,
        message:
          data.message ||
          'Your account request has been submitted. An administrator will review and approve access before you can log in.',
      };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Unable to request an account. Please try again.' };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    setAuthError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || 'Unable to start password reset. Please try again.';
        return { success: false, message };
      }

      // Endpoint always returns a success-style message to avoid email enumeration.
      return {
        success: true,
        message:
          data.message ||
          'If an account exists with that email, you will receive a password reset link shortly.',
      };
    } catch (err) {
      console.error('Forgot-password error:', err);
      return { success: false, message: 'Unable to start password reset. Please try again.' };
    }
  }, []);

  const resetPassword = useCallback(async (tokenValue, newPassword) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue, password: newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const message = data.message || 'Unable to reset password. The link may have expired.';
        return { success: false, message };
      }

      return { success: true, message: data.message || 'Password has been reset. You can now log in.' };
    } catch (err) {
      console.error('Reset-password error:', err);
      return { success: false, message: 'Unable to reset password. Please try again.' };
    }
  }, []);

  const value = {
    token,
    user,
    initializing,
    authError,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

