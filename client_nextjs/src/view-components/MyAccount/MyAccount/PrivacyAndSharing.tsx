import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { Button, CloseButton, Label, Modal, ShowGlobalLoading, Typography } from '../../components/index.ts';
import request from '../../utils/axios.ts';
import { useUserStore } from '../../globalState/user.tsx';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

export const PrivacyAndSharing = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [deleteAccountModalVisibility, setDeleteAccountModalVisibility] = React.useState(false);

  const userStore = useUserStore();
  const navigate = useNavigate();

  const closeAccountMutation = useMutation(
    async () => {
      return await request(userStore.auth.access_token).delete('/api/user');
    },
    {
      onSuccess: () => {
        logOut();
      }
    }
  );

  const logOut = async () => {
    try {
      await request(userStore.auth.access_token).post('/api/account/logout', {
        refresh_token: userStore.auth.refresh_token
      });
    } catch (err) {
    } finally {
      userStore.set((user: any) => ({ ...user, auth: null, userDetails: null, ability: null }));
      navigate('/');
    }
  };

  return (
    <>
      {closeAccountMutation.isLoading && <ShowGlobalLoading />}
      <div className={`privacy-and-sharing-section ${className}`}>
        <Typography variant='body2' className='privacy-and-sharing'>
          Privacy and sharing
        </Typography>
        <div className='section-wrapper'>
          <Typography variant='body3' className='section-title'>
            Data management
          </Typography>
          <div className='section'>
            <div className='texts'>
              <Typography variant='body4' className='title'>
                Request your personal data
              </Typography>
              <Typography variant='body6' className='description'>
                We’ll create a file copy for you to download your personal data.
              </Typography>
            </div>
            <Label variant='secondary' size='small'>
              Request file
            </Label>
          </div>
          <Typography variant='body3' className='section-title'>
            Account deletion
          </Typography>
          <div className='section'>
            <div className='texts'>
              <Typography variant='body4' className='title'>
                Delete account
              </Typography>
              <Typography variant='body6' className='description'>
                This will permanently delete your account and your data, in accordance with applicable law.
              </Typography>
            </div>
            <Label variant='secondary' size='small' onClick={() => setDeleteAccountModalVisibility(true)}>
              Delete account
            </Label>
          </div>
        </div>
        <ConfirmationModal
          open={deleteAccountModalVisibility}
          onBackdropClick={() => setDeleteAccountModalVisibility(false)}>
          <div className='modal-header'>
            <CloseButton onClick={() => setDeleteAccountModalVisibility(false)} />
          </div>
          <Typography variant='body2' className='title'>
            Are you sure you want to delete the account?
          </Typography>
          <Typography variant='body4' className='description'>
            The action can't be reverted anymore. Do you want to delete the account?
          </Typography>
          <div className='actions'>
            <Button size='large' variant='secondary' onClick={() => setDeleteAccountModalVisibility(false)}>
              Cancel
            </Button>
            <Button size='large' onClick={() => closeAccountMutation.mutate()}>
              Delete
            </Button>
          </div>
        </ConfirmationModal>
      </div>
    </>
  );
})`
  &.privacy-and-sharing-section {
    display: grid;
    gap: 40px;

    .privacy-and-sharing {
      color: #0d2a38;
      font-weight: 600;
      line-height: 48px;
    }

    .section-wrapper {
      position: relative;
      max-width: 556px;
      display: grid;
      gap: 16px;

      .section-title {
        color: #0d2a38;
        font-weight: 600;
      }

      .section {
        display: grid;
        padding: 24px;
        gap: 16px;

        border-radius: 8px;
        border: 1px solid #e7e7e7;

        .texts {
          display: grid;
          gap: 4px;

          .title {
            color: #0d2a38;
            font-size: 18px;
            font-weight: 600;
          }

          .description {
            color: #646464;
            font-weight: 500;
            line-height: 20px;
          }
        }
      }
    }
  }
`;

const ConfirmationModal = styled(Modal)`
  & {
    .modal-container {
      padding: 0;
    }

    padding: 24px;
    max-width: 440px;

    .modal-header {
      display: flex;
      justify-content: flex-end;
    }

    .title {
      margin-top: 24px;
      text-align: center;
    }

    .description {
      margin-top: 16px;
      text-align: center;
    }

    .actions {
      margin-top: 48px;
      display: flex;
      column-gap: 16px;

      .button {
        flex-grow: 1;
      }
    }
  }
`;
