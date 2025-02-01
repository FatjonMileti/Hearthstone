import { useUserStore } from '../../globalState/user';
import axios from '../../utils/axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const getMatchesCount = async ({
  access_token,
  params
}: {
  access_token: string;
  params?: MatchCountParams['params'];
}) => {
  const { data } = await axios(access_token).get<{ number: number }>('/api/match/count', { params });

  return data;
};

interface MatchCountParams {
  params?: {
    chosen?: boolean;
    disliked?: boolean;
  };
  options?: UseQueryOptions;
}

interface MatchCount {
  number: number;
}

export const useMatchesCount = ({ params = {}, options = {} }: MatchCountParams) => {
  const userStore = useUserStore();

  const query = useQuery<MatchCount>({
    queryKey: ['number'],
    queryFn: () =>
      getMatchesCount({
        params,
        access_token: userStore.auth.access_token
      }),
    refetchIntervalInBackground: false,
    refetchOnMount: !!options?.refetchOnMount,
    refetchOnWindowFocus: false
  });

  return query;
};
