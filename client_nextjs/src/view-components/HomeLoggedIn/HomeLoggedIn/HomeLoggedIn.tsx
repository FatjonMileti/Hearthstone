import React from 'react';
import { styled } from '@mui/system';
import { HeaderLoggedIn } from '../PagesComponents/HeaderLoggedIn/HeaderLoggedIn.tsx';
import { Footer } from '../Home/Footer.tsx';
import { Role } from '../../enums.ts';
import { useProfileStore } from '../../globalState/profile.tsx';
import { ShareAndEarnSection } from './ShareAndEarnSection/ShareAndEarnSection.tsx';
import { DailyNewss } from '../PagesComponents/DailyNews/DailyNews.tsx';
import { ValpalSection } from '../PagesComponents/ValpalSection/Home.ValpalSection.tsx';
import { InitialSetupModal } from '../InitialSetup/InitialSetupModal/InitialSetupModal.tsx';
import { MyDashboard } from '../AgentDashboard/MyDashboard.tsx';
import { OverViewSection } from './OverViewSection/OverViewSection.tsx';

export const HomeLoggedIn = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const profileStore = useProfileStore();

  if (profileStore.role === Role.Agent) {
    return <MyDashboard />;
  }

  if (profileStore.has_completed_initial_setup === false ) {
    return <InitialSetupModal />;
  }

  return (
    <div className={`home-logged-in-page ${className}`}>
      <HeaderLoggedIn />

      <div className='container'>
        <OverViewSection />
        <ValpalSection />
        <DailyNewss />
        <ShareAndEarnSection />
      </div>

      <Footer />
    </div>
  );
})`
  &.home-logged-in-page {
    display: grid;
    min-height: 100vh;
    grid-template-rows: min-content auto min-content;
    box-sizing: border-box;

    .container {
      display: grid;
      box-sizing: border-box;
    }
  }
`;
