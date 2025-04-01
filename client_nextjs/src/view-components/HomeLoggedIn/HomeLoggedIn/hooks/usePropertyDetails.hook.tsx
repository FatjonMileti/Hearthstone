import { useUserStore } from '../../../../globalState/user';
import axiosWithToken from '../../../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { ApiPropertyDocumentType } from '../../../Properties/NewProperty/property.types';

export type TPropertyDetails = {
  property: string;
  views: number;
  matches: number;
  property_score: number;
  tenants: any[];
  my_chosen_matches: number;
};

interface PropertyWithDetails {
  property: ApiPropertyDocumentType;
  details: TPropertyDetails;
}

export const usePropertyDetailsHook = () => {
  const { auth } = useUserStore();
  const getLatestPropertyWithDetails = async (): Promise<PropertyWithDetails | undefined> => {
    try {
      const { data, status } = await axiosWithToken(auth.access_token).get('/api/asset/last');

      if (status === 200) {
        return data;
      }

      return undefined;
    } catch (err) {
      throw err;
    }
  };

  const query = useQuery<PropertyWithDetails | undefined>({
    queryKey: ['property-details'],
    queryFn: () => getLatestPropertyWithDetails(),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: false
  });

  return query;
};
