'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

function isPublicPath(pathname) {
  if (!pathname) return false;
  // Public routes:
  // - Home (includes #contactus section)
  // - Password reset page the user gets via email link
  // - PayPal donation return/cancel pages so donors can see status without an account
  if (pathname === '/') return true;
  if (pathname === '/reset-password') return true;
  if (pathname === '/donation/success') return true;
  if (pathname === '/donation/cancel') return true;
  // Admin login and admin panel handle their own gating.
  if (pathname === '/admin-login') return true;
  if (pathname === '/admin') return true;
  return false;
}

export default function AuthGate({ children }) {
  const { user, initializing, authError, login, register, requestPasswordReset } = useAuth();
  const pathname = usePathname();

  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [forcedOpen, setForcedOpen] = useState(false);

  // Allow other components (e.g., the header) to request opening the auth modal.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpen = () => {
      setView('login');
      setForcedOpen(true);
    };

    window.addEventListener('auth:open', handleOpen);

    return () => {
      window.removeEventListener('auth:open', handleOpen);
    };
  }, []);

  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  // On non-public routes, block rendering of protected content until we know
  // whether there is a logged-in user. Public routes always render normally.
  const shouldBlockContent = useMemo(() => {
    if (isPublic) return false;
    if (initializing) return true;
    // Only allow inside content to render once there is a logged-in user.
    // Server-side middleware still enforces isActive/role for real security.
    return !user;
  }, [isPublic, initializing, user]);

  // If a user logs in successfully, close any forced-open modal.
  useEffect(() => {
    if (user && forcedOpen) {
      setForcedOpen(false);
    }
  }, [user, forcedOpen]);

  const showModal = shouldBlockContent || forcedOpen;

  // Reset messages when switching view
  useEffect(() => {
    setMessage(null);
  }, [view]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await login(loginForm.email.trim(), loginForm.password);
      if (!result.success) {
        setMessage(result.message || 'Unable to log in.');
      } else {
        setMessage(null);
        // Successful login will cause user to be set and modal to disappear automatically.
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        email: registerForm.email.trim(),
        password: registerForm.password,
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        phone: registerForm.phone.trim() || undefined,
        role: 'pending',
      };
      const result = await register(payload);
      setMessage(result.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await requestPasswordReset(forgotEmail.trim());
      setMessage(result.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!shouldBlockContent && children}

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black">
          <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6 relative text-black">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold mb-1">Restricted Access</h2>
              <p className="text-sm text-gray-600">
                Please log in with your approved account, request access, or reset your password to continue.
              </p>
            </div>

            <div className="flex mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setView('login')}
                className={`flex-1 py-2 text-sm font-semibold ${
                  view === 'login'
                    ? 'border-b-2 border-green-600 text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setView('register')}
                className={`flex-1 py-2 text-sm font-semibold ${
                  view === 'register'
                    ? 'border-b-2 border-green-600 text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Request Account
              </button>
              <button
                type="button"
                onClick={() => setView('forgot')}
                className={`flex-1 py-2 text-sm font-semibold ${
                  view === 'forgot'
                    ? 'border-b-2 border-green-600 text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reset Password
              </button>
            </div>

            {authError && view === 'login' && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {authError}
              </div>
            )}

            {message && (
              <div className="mb-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                {message}
              </div>
            )}

            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <p className="text-xs text-gray-600">
                  Fill out this form to request a user account. An administrator will review and approve access
                  before you can use the site.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.firstName}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.lastName}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Contact number"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Request Account'}
                </button>
              </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Enter the email associated with your account. If we find it, we&apos;ll send a password reset
                  link.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

