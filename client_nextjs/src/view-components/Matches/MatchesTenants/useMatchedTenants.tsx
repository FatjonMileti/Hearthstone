import axios from '../../../utils/axios';
import { mapTenant } from './serializers';
import { useUserStore } from '../../../globalState/user';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { MatchedTenantType } from '../matches.type';

export const useMatchedTenants = ({
  params = {},
  options = {}
}: {
  params?: { disliked?: boolean; chosen?: boolean; matchRate?: number };
  options?: UseQueryOptions;
}) => {
  const userStore = useUserStore();

  const getMatchedTenants = async () => {
    try {
      const { data } = await axios(userStore.auth.access_token).get('/api/match', {
        params
      });
      return data.docs.map(mapTenant);
    } catch (err) {
      throw err;
    }
  };

  const query = useQuery<MatchedTenantType[]>({
    queryKey: ['matched-tenants', params],
    queryFn: () => getMatchedTenants(),
    initialData: [],
    refetchIntervalInBackground: false,
    refetchOnMount: !!options.refetchOnMount,
    refetchOnWindowFocus: false
  });

  return query;
};
