import { useUserStore } from '../../globalState/user';
import { SuggestionsTenants } from './SugestionsTenants/SuggestionsTenants';
import { SuggestionsProperties } from './SuggestionsProperties/SuggestionsProperties';

export const Suggestions = () => {
  const userStore = useUserStore();

  return (
    <>
      {userStore?.userDetails?.role === 'Landlord' && <SuggestionsTenants />}
      {userStore?.userDetails?.role === 'Tenant' && <SuggestionsProperties />}
    </>
  );
};
