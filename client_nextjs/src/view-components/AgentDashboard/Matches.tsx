import React from 'react';
import { styled } from '@mui/system';
import { Box, Paper, Grid } from '@mui/material';
import { DashboardHeader } from './components/DashboardHeader';
import { SystemMatches } from './pages/SystemMatches';

const ItemContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(1),
  height: 'fit-content',
  color: theme.palette.text.secondary
}));

export const Matches = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`home-page ${className}`}>
      <DashboardHeader />

      <div className='container'>
        <Box sx={{ flexGrow: 1, margin: '10px 25px 10px 25px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ItemContent>
                <Box>
                  <SystemMatches />
                </Box>
              </ItemContent>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
})`
  &.home-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    background-color: #f7f1e7;

    grid-template-rows: min-content auto;

    .header {
      z-index: 1;
    }
  }
`;
