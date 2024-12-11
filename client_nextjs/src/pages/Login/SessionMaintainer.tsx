import { ReactNode, useEffect, useRef } from 'react';
import { useUserStore } from '../src/store/userStore';
import { useProfileStore } from '../src/store/profileStore';
import { axiosWithToken } from '../src/lib/axios';

export const refreshToken = async (debug = false) => {
  const store = useUserStore.getState();
  try {
    const res = await axiosWithToken(null).post('/api/account/refresh', {
      refresh_token: store.auth?.refresh_token,
    });
    const accessToken = res.data.access_token;
    const userDetails = JSON.parse(atob(accessToken.split('.')[1]));
    useUserStore.getState().set({
      auth: {
        ...res.data,
        expirationTime: Date.now() + res.data.expires_in * 1000,
        refreshExpirationTime: Date.now() + res.data.refresh_expires_in * 1000,
      },
      userDetails: { ...userDetails, rules: res.data.rules },
    });
    return true;
  } catch (err) {
    if (debug) console.log('Refresh token failed:', err);
    useUserStore.getState().set({ auth: null, userDetails: null, ability: null });
    return false;
  }
};

export default function SessionMaintainer({ children }: { children: ReactNode }) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { auth } = useUserStore();
  const profileStore = useProfileStore();

  useEffect(() => {
    if (!auth) return;
    const timeUntilRefresh = auth.expirationTime ? auth.expirationTime - Date.now() - 5000 : 0;
    if (timeUntilRefresh <= 0) {
      if (auth.refreshExpirationTime && Date.now() < auth.refreshExpirationTime) {
        refreshToken(true);
      } else {
        useUserStore.getState().set({ auth: null, userDetails: null, ability: null });
      }
    } else {
      timerRef.current = setTimeout(() => refreshToken(true), timeUntilRefresh);
    }

    profileStore.fetchProfile(auth.access_token).catch(() => {
      useUserStore.getState().set({ auth: null, userDetails: null, ability: null });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [auth]);

  return <>{children}</>;
}
