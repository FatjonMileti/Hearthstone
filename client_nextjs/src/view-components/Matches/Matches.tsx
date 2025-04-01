import { useProfileStore } from '../../globalState/profile';
import { Role } from '../../enums';
import { MatchesForTenant } from './MatchesForTenant/MatchesForTenant';
import { MatchesForLandlord } from './MatchesForLandlord/MatchesForLandlord';

export const Matches = () => {
  const profileStore = useProfileStore();
  return (
    <>
      {profileStore.role === Role.Tenant && <MatchesForTenant />}
      {profileStore.role === Role.Landlord && <MatchesForLandlord />}
    </>
  );
};
