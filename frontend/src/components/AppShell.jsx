'use client';

import { AuthProvider } from './AuthContext';
import AuthGate from './AuthGate';

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}

