'use client';

import { useUserStore } from '../globalState/user';
import { Home } from '../pages/Home';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const userStore = useUserStore();
  if (!userStore.auth) {
    return <Home />;
  }
  return <>{children}</>;
}
