import { Card, CardContent, Box, Typography } from '@mui/material';
import config from '../../../config';
import { useUserStore } from '../../../globalState/user';

export const EnvelopeCard = ({ envelope }: { envelope: any }) => {
  const { userDetails } = useUserStore();

  const {
    envelope_id,
    status,
    status_date_time,
    document_type,
    signed_by_landlord,
    signed_by_tenant,
    land_lord,
    tenant,
    sign_url_landlord,
    sign_url_tenant,
    created_at
  } = envelope || {};

  const isLandlord = userDetails.user_id.toString() === land_lord?._id?.toString();
  const isTenant = userDetails.user_id.toString() === tenant?._id?.toString();

  return (
    <Box display='flex' justifyContent='center'>
      <Card>
        <CardContent>
          <Typography color='textSecondary' gutterBottom>
            Status: {status}
          </Typography>
          <Typography color='textSecondary' gutterBottom>
            Status Date: {status_date_time}
          </Typography>

          {land_lord && (
            <div>
              <Typography color='textSecondary' gutterBottom>
                Signed by Landlord: {signed_by_landlord ? 'Yes' : 'No'}
              </Typography>
              <Typography color='textSecondary' gutterBottom>
                Landlord: {land_lord.first_name} {land_lord.last_name}
              </Typography>
            </div>
          )}
          {tenant && (
            <div>
              <Typography color='textSecondary' gutterBottom>
                Signed by Tenant: {signed_by_tenant ? 'Yes' : 'No'}
              </Typography>

              <Typography color='textSecondary' gutterBottom>
                Tenant: {tenant.first_name} {tenant.last_name}
              </Typography>
            </div>
          )}
          {isLandlord && (
            <Typography color='textSecondary' gutterBottom>
              Sign URL (Landlord):{' '}
              {!signed_by_landlord ? (
                <a href={sign_url_landlord} target='_blank' rel='noopener noreferrer'>
                  Sign
                </a>
              ) : (
                'Signed'
              )}
            </Typography>
          )}
          {isTenant && (
            <Typography color='textSecondary' gutterBottom>
              Sign URL (Tenant):{' '}
              {!signed_by_tenant ? (
                <a href={sign_url_tenant} target='_blank' rel='noopener noreferrer'>
                  Sign
                </a>
              ) : (
                'Signed'
              )}
            </Typography>
          )}

          <Typography color='textSecondary' gutterBottom>
            Created At: {created_at}
          </Typography>

          <Typography color='textSecondary' gutterBottom>
            Download:
            <a
              href={`${config.apiUrl}/api/docusign/envelope/${envelope_id}/download?fileName=${document_type}.pdf`}>
              Click here
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
