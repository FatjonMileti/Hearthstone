import { useProfileStore } from '../../../globalState/profile.tsx';
import { Role } from '../../../enums.ts';
import { DashboardOverviewForTenant } from './DashboardOverViewForTenant/DashboardOverviewForTenant.tsx';
import { DashboardOverviewForLandlord } from './DashboardOverViewForLandlord/DashboardOverviewForLandlord.tsx';

export enum States {
  Default = 'Default',
  MatchesAwaiting = 'MatchesAwaiting',
  PerfectMatch = 'PerfectMatch',
  MultiplePerfectMatches = 'MultiplePerfectMatches',
  Agreement = 'Agreement',
  FinalDocs = 'FinalDocs'
}

export const DashboardOverview = () => {
  const profileStore = useProfileStore();
  return (
    <>
      {profileStore.role === Role.Tenant && <DashboardOverviewForTenant />}
      {profileStore.role === Role.Landlord && <DashboardOverviewForLandlord />}
    </>
  );
};
