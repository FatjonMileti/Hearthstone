import React from 'react';
import { styled } from '@mui/system';

export const HomeLoggedIn = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`home-logged-in-page ${className}`}><h1>Logged In Home</h1></div>;
})`
  display: grid;
  min-height: 100vh;
`;
