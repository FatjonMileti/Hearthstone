import { createTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

const themeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 834,
      laptop: 1024,
      desktop: 1440,
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
};

export const theme = createTheme(themeOptions);
