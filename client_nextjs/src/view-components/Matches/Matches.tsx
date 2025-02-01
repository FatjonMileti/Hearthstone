import { useProfileStore } from '../../globalState/profile.tsx';
import { Role } from '../../enums.ts';
import { MatchesForTenant } from './MatchesForTenant/MatchesForTenant.tsx';
import { MatchesForLandlord } from './MatchesForLandlord/MatchesForLandlord.tsx';

export const Matches = () => {
  const profileStore = useProfileStore();
  return (
    <>
      {profileStore.role === Role.Tenant && <MatchesForTenant />}
      {profileStore.role === Role.Landlord && <MatchesForLandlord />}
    </>
  );
};
