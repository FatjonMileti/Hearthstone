import axios from 'axios';

import { useQuery } from '@tanstack/react-query';
import config from '../../../config';
import { SuggestedPropertyType } from '../../Matches/matches.type';
import { useCriteriaWithoutAccountStore } from '../../../globalState/useCriteriaWithoutAccount';

export const useSuggestedPropertiesWithoutAccount = () => {
  const criteriaStore = useCriteriaWithoutAccountStore();
  const getSuggestedProperties = async () => {
    try {
      const { data } = await axios.post(
        `${config.apiUrl}/api/suggestion/without-account/properties`,

        criteriaStore.criteria
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return data.docs;
    } catch (err) {
      throw err;
    }
  };

  const query = useQuery<SuggestedPropertyType[]>({
    queryKey: ['suggested-properties-without-account'],
    queryFn: () => getSuggestedProperties(),
    initialData: [],
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: false,
    retry: false
  });

  return query;
};
