import axios from '../../../utils/axios.ts';

interface DismissSuggestedTenantParams {
  access_token: string;
  tenantId: string;
  propertyId: string;
}

export const dismissSuggestedTenant = ({
  access_token,
  tenantId,
  propertyId
}: DismissSuggestedTenantParams) => {
  return axios(access_token).post('/api/match/dislikes/tenants', {
    tenant: tenantId,
    property: propertyId
  });
};
