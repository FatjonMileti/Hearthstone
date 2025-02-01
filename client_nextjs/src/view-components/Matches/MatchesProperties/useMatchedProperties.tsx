import axios from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { MatchedPropertyType } from '../matches.type';

export const useMatchedProperties = ({
  params = {},
  options = {}
}: {
  params?: { disliked?: boolean; chosen?: boolean; matchRate?: number };
  options?: UseQueryOptions;
}) => {
  const userStore = useUserStore();

  const getMatchedProperties = async () => {
    try {
      const { data } = await axios(userStore.auth.access_token).get('/api/match', {
        params
      });
      return data.docs;
    } catch (err) {
      throw err;
    }
  };

  const query = useQuery<MatchedPropertyType[]>({
    queryKey: ['matched-properties', params],
    queryFn: () => getMatchedProperties(),
    initialData: [],
    refetchIntervalInBackground: false,
    refetchOnMount: !!options.refetchOnMount,
    refetchOnWindowFocus: false
  });

  return query;
};
