import axios from '../../../utils/axios.ts';

interface MatchSuggestedPropertyParams {
  access_token: string;
  propertyId: string;
}
export const matchSuggestedProperty = ({ access_token, propertyId }: MatchSuggestedPropertyParams) => {
  return axios(access_token).post('/api/match/properties', {
    property: propertyId
  });
};
