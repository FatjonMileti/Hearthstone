import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../../components';
import { Button } from '../../../../components';
import { Link } from '../../../../components';
import request from '../../../../utils/axios';
import { useUserStore } from '../../../../globalState/user';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

export const AccountSettings = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const userStore = useUserStore();

  const navigate = useNavigate();

  const closeAccount = async () => {
    const confirmation = confirm('Are you sure you want to delete?');
    if (confirmation) {
      try {
        const response = await request(userStore.auth!.access_token).delete('/api/user');
        if (response.status === 204) {
          logOut();
        }
      } catch (error: any) {
        console.log(error);
      }
    } else {
      console.log('Deletion canceled.');
    }
  };

  const logOut = async () => {
    try {
      await request(userStore.auth!.access_token).post('/api/account/logout', {
        refresh_token: userStore.auth!.refresh_token
      });
    } catch (err) {
    } finally {
      userStore.set({ auth: null, userDetails: null, ability: null });
      navigate('/');
    }
  };

  const resetPassword = async () => {
    const confirmation = confirm(
      'An email with password reset instructions will be sent to your email. After reseting your password you will have to login again.'
    );
    if (confirmation) {
      try {
        const response = await request(userStore.auth!.access_token).post('/api/user/change-password', {});

        if (response.status === 201) {
          logOut();
        }
      } catch (err: AxiosError | any) {
        const message = err?.response?.data?.message;

        if (!message) throw err;
      }
    }
  };

  return (
    <div className={`account-settings ${className}`}>
      <div className='left-part'>
        <div className='section'>
          <Typography className='section-title' variant='body4'>
            Password reset
          </Typography>
          <div className='password-reset'>
            <Typography variant='body5'>
              An email with password reset instructions will be sent to your email. After reseting your
              password you will have to login again.
            </Typography>

            <Button variant='secondary' onClick={() => resetPassword()}>
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
            <Link onClick={() => closeAccount()}>Close my Hearthstone account</Link>
          </div>
        </div>
      </div>
      <div className='right-part'></div>
    </div>
  );
})`
  &.account-settings {
    display: grid;
    grid-template-columns: 50% 50%;
    min-height: 100%;

    .left-part {
      display: grid;
      row-gap: 32px;
      align-content: flex-start;
    }

    .right-part {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }

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
    }

    .close-account {
      display: grid;
      row-gap: 16px;
    }
  }
`;
