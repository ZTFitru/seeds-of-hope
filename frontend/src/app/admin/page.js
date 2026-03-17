 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { getApiUrl } from '@/utils/apiConfig';

export default function AdminPage() {
  const router = useRouter();
  const { user, initializing, token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      router.replace('/admin-login');
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/');
      return;
    }

    // Once we know we have an admin, load pending users.
    const fetchPending = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl('/api/users?pending=true'), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setError(data.message || 'Unable to load pending users.');
          setPendingUsers([]);
          return;
        }

        setPendingUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        console.error('Error loading pending users:', err);
        setError('Unable to load pending users.');
        setPendingUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchPending();
  }, [initializing, user, token, router]);

  const handleDecision = async (id, action) => {
    setActionLoadingId(id);
    setError(null);
    try {
      const endpoint =
        action === 'approve'
          ? `/api/users/${id}/approve-access`
          : `/api/users/${id}/deny-access`;

      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || `Unable to ${action} this request.`);
        return;
      }

      // Remove this user from the pending list
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(`Error trying to ${action} access:`, err);
      setError(`Unable to ${action} this request.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (initializing || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-sm">Checking admin access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-sm text-gray-600">
            You are signed in as an administrator. Review and approve or deny pending user access requests below.
          </p>
        </header>

        <section className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending access requests</h2>
            {loadingUsers && (
              <span className="text-xs text-gray-500">Loading…</span>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loadingUsers && pendingUsers.length === 0 && !error && (
            <p className="text-sm text-gray-600">There are currently no users with a pending role.</p>
          )}

          {pendingUsers.length > 0 && (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 rounded-lg px-3 py-2 gap-2"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-600">{u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Role: <span className="font-mono">{u.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === u.id}
                      onClick={() => handleDecision(u.id, 'deny')}
                      className="px-3 py-1 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoadingId === u.id ? 'Processing…' : 'Deny'}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === u.id}
                      onClick={() => handleDecision(u.id, 'approve')}
                      className="px-3 py-1 rounded-md bg-green-600 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoadingId === u.id ? 'Processing…' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
