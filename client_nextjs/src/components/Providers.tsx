'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import SocketProvider from './SocketProvider';
import { theme } from '../theme/theme';
import { GlobalLoading } from './ShowGlobalLoading';
import { CookieConsent } from './CookieConsent';
import { SessionMaintainer } from '../view-components/Login/SessionMaintainer';
import { GlobalSetCriteria } from '../view-components/SetCriteria/GlobalSetCriteria';
import { useUserStore } from '../globalState/user';
import { useProfileStore } from '../globalState/profile';
import { useCriteriaStore } from '../globalState/criteria';
import { useNotificationsStore } from '../globalState/notifications';
import { Role } from '../enums';

const queryClient = new QueryClient();

function AppGlobals({ children }: { children: React.ReactNode }) {
  const userStore = useUserStore();
  const criteriaStore = useCriteriaStore();
  const profileStore = useProfileStore();
  const notificationsStore = useNotificationsStore();

  React.useEffect(() => {
    if (userStore.auth) {
      criteriaStore.fetchCriteria(userStore.auth.access_token);
      notificationsStore.fetchNotifications(userStore.auth.access_token);
      return () => {
        criteriaStore.reset();
      };
    }
  }, [userStore.auth]);

  return (
    <>
      <GlobalLoading />
      <SessionMaintainer debug>
        {userStore.auth &&
          profileStore.has_completed_initial_setup &&
          profileStore.role === Role.Tenant && <GlobalSetCriteria />}
        {children}
      </SessionMaintainer>
      <CookieConsent />
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <SocketProvider>
            <AppGlobals>{children}</AppGlobals>
          </SocketProvider>
        </CookiesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
