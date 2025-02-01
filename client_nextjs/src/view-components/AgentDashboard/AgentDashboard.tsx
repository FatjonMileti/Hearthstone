import React, { useState } from 'react';
import { styled } from '@mui/system';
import { Box, Paper, Grid } from '@mui/material';
import { Sessions } from './pages/Sessions';
import { PropertyLogs } from './pages/PropertyLogs';
import { DashboardNavbar } from './components/DashboardNavbar';
import { MatchesLogs } from './pages/MatchesLogs';
import { DashboardHeader } from './components/DashboardHeader';
import { SystemUsers } from './pages/SystemUsers';

const ItemContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(1),
  height: 'fit-content',
  color: theme.palette.text.secondary
}));

export const AgentDashboard = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const getRequestedComponent = () => {
    if (activeTab === 0) {
      return <Sessions />;
    }
    if (activeTab === 1) {
      return <PropertyLogs />;
    }

    if (activeTab === 2) {
      return <MatchesLogs />;
    }
    if (activeTab === 3) {
      return <SystemUsers user_type='Landlord' />;
    }

    if (activeTab === 4) {
      return <SystemUsers user_type='Tenant' />;
    }

    return <div></div>;
  };

  return (
    <div className={`home-page ${className}`}>
      <DashboardHeader />

      <div className='container'>
        <Box sx={{ flexGrow: 1, margin: '10px 25px 10px 25px' }}>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
            </Grid>
            <Grid item xs={10}>
              <ItemContent>
                <Box>{getRequestedComponent()}</Box>
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
