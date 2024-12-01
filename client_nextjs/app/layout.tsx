import '../src/assets/css/Index.css';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/theme/theme';
import { CookieConsent } from '../src/components/CookieConsent';
import { GlobalLoading } from '../src/components/ShowGlobalLoading';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <GlobalLoading>{children}</GlobalLoading>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
