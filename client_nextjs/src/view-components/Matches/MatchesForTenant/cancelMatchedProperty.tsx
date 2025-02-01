import axios from '../../../utils/axios.ts';

interface CancelMatchedPropertyParams {
  access_token: string;
  matchId: string;
}

export const cancelMatchedProperty = ({ access_token, matchId }: CancelMatchedPropertyParams) => {
  return axios(access_token).delete(`/api/match/${matchId}`);
};
