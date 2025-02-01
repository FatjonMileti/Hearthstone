import axios from '../../../utils/axios';
import { mapTenant } from '../../Matches/MatchesTenants/serializers';
import { useUserStore } from '../../../globalState/user';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { SuggestedTenantType } from '../../Matches/matches.type';

export const useSuggestedTenants = ({
  params = {},
  options = {}
}: {
  params?: { disliked?: boolean; chosen?: boolean; propertyId?: string };
  options?: UseQueryOptions;
}) => {
  const userStore = useUserStore();

  const getSuggestedTenants = async () => {
    try {
      const { data } = await axios(userStore.auth.access_token).get('/api/suggestion/tenant', {
        params
      });
      // await new Promise((resolve) => setTimeout(resolve, 500));
      return data.docs.map(mapTenant);
    } catch (err) {
      throw err;
    }
  };

  const query = useQuery<SuggestedTenantType[]>({
    queryKey: ['suggested-tenants', Object.values(params)],
    queryFn: () => getSuggestedTenants(),
    initialData: [],
    refetchIntervalInBackground: false,
    refetchOnMount: !!options.refetchOnMount,
    refetchOnWindowFocus: false,
    retry: false
  });

  return query;
};
