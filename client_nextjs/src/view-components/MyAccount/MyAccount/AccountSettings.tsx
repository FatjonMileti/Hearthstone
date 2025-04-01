import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { useNavigate } from '../../../compat/router';
import { AxiosError } from 'axios';

import { Typography } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { CloseButton } from '../../../components/CloseButton';
import { Modal } from '../../../components/Modal';

import request from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';

export const AccountSettings = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [deleteAccountModalVisibility, setDeleteAccountModalVisibility] = React.useState(false);
  const [resetPasswordModalVisibility, setResetPasswordModalVisibility] = React.useState(false);

  const userStore = useUserStore();
  const navigate = useNavigate();

  const onCloseAccount = async () => {
    try {
      const response = await request(userStore.auth.access_token).delete('/api/user');
      if (response.status === 204) {
        logOut();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

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

  const onResetPassword = async () => {
    try {
      const response = await request(userStore.auth.access_token).post('/api/user/change-password', {});

      if (response.status === 201) {
        logOut();
      }
    } catch (err: AxiosError | any) {
      const message = err?.response?.data?.message;

      if (!message) throw err;
    }
  };

  return (
    <div className={`account-settings ${className}`}>
      <div className='section'>
        <Typography className='section-title' variant='body4'>
          Password reset
        </Typography>
        <div className='password-reset'>
          <Typography variant='body5'>
            An email with password reset instructions will be sent to your email. After reseting your password
            you will have to login again.
          </Typography>

          <Button variant='secondary' size='medium' onClick={() => setResetPasswordModalVisibility(true)}>
            Reset password
          </Button>
        </div>
      </div>

      <div className='section'>
        <Typography className='section-title' variant='body4'>
          Close account
        </Typography>
        <div className='close-account'>
          <Typography variant='body5'>
            If you want to delete your account you can do so by clicking the button below. Be aware that any
            matches or ongoing messages will be deleted and can not be recovered.
          </Typography>
          <Link onClick={() => setDeleteAccountModalVisibility(true)}>Close my Hearthstone account</Link>
        </div>
      </div>
      <ConfirmationModal
        open={resetPasswordModalVisibility}
        onBackdropClick={() => setResetPasswordModalVisibility(false)}>
        <div className='modal-header'>
          <CloseButton onClick={() => setResetPasswordModalVisibility(false)} />
        </div>
        <Typography variant='body4' className='description'>
          An email with password reset instructions will be sent to your email. After reseting your password
          you will have to login again.
        </Typography>
        <div className='actions'>
          <Button size='large' variant='secondary' onClick={() => setResetPasswordModalVisibility(false)}>
            Cancel
          </Button>
          <Button size='large' onClick={() => onResetPassword()}>
            Reset
          </Button>
        </div>
      </ConfirmationModal>
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
          <Button size='large' onClick={onCloseAccount}>
            Delete
          </Button>
        </div>
      </ConfirmationModal>
    </div>
  );
})`
  &.account-settings {
    display: grid;
    min-height: 100%;
    max-width: 325px;
    row-gap: 32px;
    align-content: flex-start;

    .section {
      display: grid;
      row-gap: 16px;
      .section-title {
        color: #646464;
      }
    }

    .password-reset {
      display: grid;
      row-gap: 16px;

      .button {
        padding: 12px 20px;
      }
    }

    .close-account {
      display: grid;
      row-gap: 16px;
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
