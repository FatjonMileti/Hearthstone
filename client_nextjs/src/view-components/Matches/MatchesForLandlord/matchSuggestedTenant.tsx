import axios from '../../../utils/axios.ts';

interface MatchSuggestedTenantParams {
  access_token: string;
  tenantId: string;
  propertyId: string;
}
export const matchSuggestedTenant = ({ access_token, tenantId, propertyId }: MatchSuggestedTenantParams) => {
  return axios(access_token).post('/api/match/tenants', {
    tenant: tenantId,
    property: propertyId
  });
};
