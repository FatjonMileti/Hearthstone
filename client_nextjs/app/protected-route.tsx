import { ReactNode } from 'react';
import { useUserStore } from '../src/store/userStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth } = useUserStore();
  // In real implementation, if auth is null, redirect to home or login.
  // For scaffold parity, render minimal message.
  if (!auth) {
    return <div>Please log in to view this page.</div>;
  }
  return <>{children}</>;
}
