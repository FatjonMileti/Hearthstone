import { useProfileStore } from '../../../../globalState/profile';
import { Role } from '../../../../enums';
import { DashboardOverviewForTenant } from './DashboardOverViewForTenant/DashboardOverviewForTenant';
import { DashboardOverviewForLandlord } from './DashboardOverViewForLandlord/DashboardOverviewForLandlord';

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
