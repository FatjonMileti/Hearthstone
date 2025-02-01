import React from 'react';
import { styled } from '@mui/system';
import axios from '../../../utils/axios';
import config from '../../../config';
import { useUserStore } from '../../../globalState/user';
import { useParams } from 'react-router-dom';
import { EnvelopeCard } from './EnvelopeCard';
import { DashboardHeader } from '../../AgentDashboard/components/DashboardHeader';

export const AgreementDetails = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { auth } = useUserStore();
  const [envelope, setEnvelope] = React.useState<any>(null);

  const params = useParams<{ id: string }>();
  React.useEffect(() => {
    getEnvelope();
  }, []);

  const getEnvelope = async () => {
    const { data } = await axios(auth.access_token).get(
      `${config.apiUrl}/api/docusign/envelope/${params.id}`
    );
    setEnvelope(data);
  };

  console.log({ envelope });
  return (
    <div className={`home-page ${className}`}>
      <DashboardHeader />

      <div className='container'>
        <div className='content'>{envelope && <EnvelopeCard envelope={envelope} />}</div>
      </div>
    </div>
  );
})`
  &.home-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    background-color: #f7f1e7;

    grid-template-rows: min-content auto;

    .header {
      z-index: 1;
    }
  }
`;
