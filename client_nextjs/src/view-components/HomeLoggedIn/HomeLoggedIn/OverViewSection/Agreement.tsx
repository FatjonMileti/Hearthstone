import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Label, ShowGlobalLoading, Typography } from '../../../../components/index';
import agreementImage from './DashboardOverViewForTenant/pierre.png';
import { useProfileStore } from '../../../../globalState/profile';
import axiosWithToken from '../../../../utils/axios';
import axios from '../../../../utils/axios';
import { useUserStore } from '../../../../globalState/user';
import config from '../../../../config';
import { Role } from '../../../../enums';
import { useMutation } from '@tanstack/react-query';
import { motion, MotionProps } from 'framer-motion';

interface AgreementProps extends HTMLAttributes<HTMLDivElement> {
  motionProps?: MotionProps;
}
export const Agreement = styled(({ className, motionProps = {} }: AgreementProps) => {
  const profileStore = useProfileStore();
  const userSore = useUserStore();

  const onSignTransactionAgreement = async () => {
    agreementMutation.mutate();
  };

  const agreementMutation = useMutation(
    async () => {
      if (!profileStore.has_transaction_agreement) {
        await axiosWithToken(userSore.auth.access_token).post(
          '/api/docusign/create-transaction-envelope',
          {}
        );
      }

      if (!profileStore.signed_transaction_agreement) {
        const { data, status } = await axios(userSore.auth.access_token).get(
          `${config.apiUrl}/api/docusign?document_type=Hearthstone transaction agreement`
        );

        if (status === 200) {
          window.location.href =
            profileStore.role === Role.Tenant ? data.sign_url_tenant : data.sign_url_landlord;
        } else {
          throw Error('Failed to sign transaction');
        }
      }
    },
    {
      onSuccess: () => {
        profileStore.fetchProfile(userSore.auth.access_token);
      }
    }
  );

  const onDownloadTransactionAgreement = () => {
    window.open(
      profileStore.transaction_agreement_link + '?fileName=HearthstoneTransactionAgreement.pdf',
      '_blank'
    );
  };

  return (
    <>
      {agreementMutation.isLoading && <ShowGlobalLoading />}
      <motion.div className={classNames('agreement', className)} {...motionProps}>
        <div className='left-content'>
          <div className='texts-wrapper'>
            <Typography variant='body1'>Sign the transaction agreement to rent</Typography>
            <Typography variant='body4'>
              In order to continue the process of renting you first need to sign the Hearthstone transaction
              agreement. We use the transaction agreement as a guarantee that information for both parties
              will remain secure.
            </Typography>
          </div>
          {!profileStore.signed_transaction_agreement && (
            <Label
              className='sign-agreement-button'
              variant='special'
              size='large'
              onClick={onSignTransactionAgreement}>
              Sign transaction agreement
            </Label>
          )}

          {profileStore.signed_transaction_agreement && profileStore.transaction_agreement_link && (
            <Label
              className='download-agreement-button'
              variant='special'
              size='large'
              onClick={onDownloadTransactionAgreement}>
              Download transaction agreement
            </Label>
          )}
        </div>
        <div className='right-content'></div>
      </motion.div>
    </>
  );
})`
  &.agreement {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 904px;
    align-items: flex-start;
    gap: 24px;
    border-radius: 16px;
    overflow: hidden;

    background: linear-gradient(180deg, #d9e9ff 0%, #c0daff 100%);

    /* Shadow L */
    box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);

    .left-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 48px;
      box-sizing: border-box;
      height: 100%;
      justify-content: space-between;

      .texts-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .sign-agreement-button,
      .download-agreement-button {
        width: 100%;
      }
    }

    .right-content {
      width: 440px;
      height: 440px;
      background-size: cover;
      background-image: url('${agreementImage}');
      background-repeat: no-repeat;
      background-position: center;

      display: flex;
      gap: 10px;
      flex-direction: column;
      justify-content: space-between;
    }
  }
`;
