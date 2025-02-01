import axios from '../../../utils/axios.ts';

interface DismissSuggestedPropertyParams {
  access_token: string;
  propertyId: string;
}

export const dismissSuggestedProperty = ({ access_token, propertyId }: DismissSuggestedPropertyParams) => {
  return axios(access_token).post('/api/match/dislikes/properties', {
    property: propertyId
  });
};
