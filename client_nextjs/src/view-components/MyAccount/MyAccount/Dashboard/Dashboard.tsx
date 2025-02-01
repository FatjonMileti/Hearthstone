import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';

import { Typography } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { ShowGlobalLoading } from '../../../components/ShowGlobalLoading';
import { useAgreement } from '../useAgreement';
import hand from '../images/hand.png';
import { DashboardYourProperties } from './Dashboard.YourProperties';
import { useProfileStore } from '../../../globalState/profile';

export const Dashboard = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const { loading, getTransactionAgreementStatus, buttonLabel, handleTransactionAgreement } = useAgreement();
  const profileStore = useProfileStore();

  return (
    <div className={`dashboard ${className}`}>
      {loading && <ShowGlobalLoading />}

      <div className='transaction-agreement'>
        <div className='left-part'>
          <Typography className='title' variant='body4'>
            {getTransactionAgreementStatus()}
          </Typography>

          <Typography variant='body5' className='description'>
            The transaction agreement serves as a guarantee for both you, your match and Hearthstone that
            everything will be covered following the ongoing UK laws.
          </Typography>

          <Button
            size='small'
            variant='secondary'
            className='sign-button'
            onClick={() => handleTransactionAgreement()}>
            {buttonLabel()}
          </Button>
        </div>
      </div>

      {profileStore.role === 'Landlord' && (
        <>
          <DashboardYourProperties />
        </>
      )}
      {profileStore.role === 'Tenant' && (
        <>
          <div />
        </>
      )}
    </div>
  );
})`
  &.dashboard {
    display: grid;
    gap: 32px 24px;
    grid-template-rows: min-content auto;

    .transaction-agreement {
      box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      background-image: url('${hand}');
      background-repeat: no-repeat;
      background-position-x: right;
      overflow: hidden;
      background-color: white;

      .left-part {
        padding: 24px;
        .title {
          font-size: 18px;
          font-weight: 700;
        }

        .description {
          margin-top: 16px;
        }

        .sign-button {
          margin-top: 24px;
          background-color: #184d6d;
          color: #fff;
        }
      }
    }
  }
`;
