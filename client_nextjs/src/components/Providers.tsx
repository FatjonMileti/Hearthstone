'use client';

import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import SocketProvider from './SocketProvider';
import { theme } from '../theme/theme';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <SocketProvider>{children}</SocketProvider>
        </CookiesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
