import { MyMatchesTenants } from './MatchesTenants/MyMatchesTenants';
import { useUserStore } from '../../globalState/user';
import { MyMatchesProperties } from './MatchesProperties/MyMatchesProperties';

export const MyMatches = () => {
  const userStore = useUserStore();

  return (
    <>
      {userStore?.userDetails?.role === 'Landlord' && <MyMatchesTenants />}
      {userStore?.userDetails?.role === 'Tenant' && <MyMatchesProperties />}
    </>
  );
};
