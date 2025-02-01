import axios from '../../../utils/axios.ts';

interface CancelMatchedTenantParams {
  access_token: string;
  matchId: string;
}

export const cancelMatchedTenant = ({ access_token, matchId }: CancelMatchedTenantParams) => {
  return axios(access_token).delete(`/api/match/${matchId}`);
};
