'use client';

import { styled } from '@mui/system';
import React from 'react';
import * as yup from 'yup';
import classNames from 'classnames';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from '../../compat/router';
import dynamic from 'next/dynamic';

import { Modal, ModalProps } from '../../components/Modal';
import { ShowGlobalLoading } from '../../components';
import { Typography } from '../../components';
import { Button } from '../../components';
import { Icon } from '../../components';
const LoginWithFacebook = dynamic(() => import('./components/LoginWithFacebook').then((m) => m.LoginWithFacebook), { ssr: false });
import { TextField } from '../../components';
import { IconButton } from '../../components';
import { CloseButton } from '../../components';
import { Label } from '../../components';
import { SocialAccountButton } from '../../components';

import { LoginWithTwitter } from './components/LoginWithTwitter';
const LoginWithGoogle = dynamic(() => import('./components/LoginWithGoogle').then((m) => m.LoginWithGoogle), { ssr: false });

import config from '../../config';
import { useUserStore } from '../../globalState/user';
import axiosWithToken from '../../utils/axios';
import { Role } from '../../enums';

const schema = yup.object().shape({
  email: yup.string().email().required('email is required'),
  password: yup.string().min(6).max(32).required()
});

export const decodeJWT = (accessToken: string) => JSON.parse(window.atob(accessToken.split('.')[1]));

interface LoginModalProps extends ModalProps {
  onCreateAccountClick: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginModal = styled(
  ({ className, onCreateAccountClick, onForgotPasswordClick, ...otherProps }: LoginModalProps) => {
    const loginForm = useForm({ resolver: yupResolver(schema) as any, mode: 'all' });
    const [showPassword, setShowPassword] = React.useState(false);
    const userStore = useUserStore();
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!!userStore.auth) navigate(userStore.userDetails.role === Role.Agent ? '/dashboard' : '/');
    }, [userStore.auth]);

    const onSubmit = async (data: any) => {
      setLoading(true);

      const { email, password } = data;

      try {
        const response = await axios.post(`${config.apiUrl}/api/account/login`, {
          email,
          password
        });

        const userDetails = decodeJWT(response.data.access_token);
        userDetails.rules = response.data.rules;

        const auth = response.data;

        userStore.set((user: any) => ({
          ...user,
          auth: {
            ...auth,
            expirationTime: Date.now() + auth.expires_in * 1000,
            refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
          },
          userDetails
        }));
      } catch (err: AxiosError | any) {
        const message = err?.response?.data?.message;

        if (!message) throw err;

        if (message === 'user_not_found') {
          return loginForm.setError('email', { message: 'user not found!', type: 'server' });
        }

        if (message === 'incorrect_password') {
          return loginForm.setError('password', { message: 'incorrect password', type: 'server' });
        }

        throw err;
      } finally {
        setLoading(false);
      }
    };

    const loginWithSocials = async ({ provider, user: SocialUser }: { provider: string; user: any }) => {
      const response = await axios.post(`${config.apiUrl}/api/account/login-social`, {
        provider,
        user: SocialUser
      });

      const userDetails = decodeJWT(response.data.access_token);
      userDetails.rules = response.data.rules;

      const auth = response.data;

      userStore.set((user: any) => ({
        ...user,
        auth: {
          ...auth,
          expirationTime: Date.now() + auth.expires_in * 1000,
          refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
        },
        userDetails
      }));
    };

    const loginWithTwitter = async (response: { access_token: string; validated: boolean }) => {
      try {
        if (response.validated) {
          const userDetails = decodeJWT(response.access_token);
          const getAuthData = await axiosWithToken(response.access_token).get(
            '/api/account/get-access-tokens'
          );

          const auth = getAuthData.data;

          userStore.set((user: any) => ({
            ...user,
            auth: {
              ...auth,
              expirationTime: Date.now() + auth.expires_in * 1000,
              refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
            },
            userDetails
          }));
        }
      } catch (err) {
        console.log(err);
        //handle error
      }
    };

    const handleFacebookLoginFailure = (error: string) => {
      // Handle login failure
      console.error('Facebook login failed:', error);
      return loginForm.setError('facebook', { message: 'Facebook login failed', type: 'client' });
    };

    return (
      <>
        {loading && <ShowGlobalLoading />}
        <Modal {...otherProps} className={classNames('login-with-modal', className)}>
          <div className='modal-header'>
            <Typography variant='body3' className='title'>
              Sign in
            </Typography>
            <CloseButton
              inverted={false}
              background={true}
              size='medium'
              onClick={otherProps.onBackdropClick}
            />
          </div>
          <div className='container'>
            <div className='dont-have-account'>
              <Typography variant='body4' className='new-to-Hearthstone'>
                New to Hearthstone?
              </Typography>
              <Label variant='tertiary' onClick={onCreateAccountClick}>
                Create account
              </Label>
            </div>

            <form className='content'>
              <TextField
                label='Email'
                className='email-input'
                required
                {...loginForm.register('email')}
                error={!!loginForm.formState.errors.email}
                helperText={loginForm.formState.errors.email?.message?.toString()}
              />

              <TextField
                type={showPassword ? 'text' : 'password'}
                label='Password'
                className='password-input'
                required
                {...loginForm.register('password')}
                endAdornment={
                  <IconButton
                    noBackground
                    style={{ color: '#184d6d' }}
                    onClick={() => setShowPassword((show) => !show)}>
                    {<Icon icon={showPassword ? 'eye-invisible' : 'eye'} />}
                  </IconButton>
                }
                error={!!loginForm.formState.errors.password}
                helperText={loginForm.formState.errors.password?.message?.toString()}
              />

              <div className='forgot-your-password-section'>
                <Typography variant='body4'>Forgot your password?</Typography>
                <Label variant='tertiary' onClick={onForgotPasswordClick}>
                  Reset password
                </Label>
              </div>
            </form>

            <Button
              className='login-button'
              disabled={!loginForm.formState.isValid}
              size='large'
              onClick={loginForm.handleSubmit(onSubmit)}>
              Sign in
            </Button>

            <div className='or-line'>
              <span />
              <Typography variant='body5'>OR LOGIN WITH</Typography>
              <span />
            </div>

            <div className='login-with-social-accounts'>
              <LoginWithFacebook
                appId={config.facebook.facebook_id}
                onLoginSuccess={loginWithSocials}
                onLoginFailure={handleFacebookLoginFailure}
                scope='email'
              />

              <LoginWithTwitter onSuccess={loginWithTwitter} />

              <SocialAccountButton icon='instagram' />

              <LoginWithGoogle onSuccess={loginWithSocials} />
            </div>
          </div>
        </Modal>
      </>
    );
  }
)`
  &.login-with-modal {
    overflow-y: auto;
    max-height: 100vh;
    max-width: 100%;
    width: 440px;
    display: grid;

    .modal-container {
      display: grid;
      row-gap: 8px;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          font-family: At Gambit, serif;
        }
      }

      .container {
        display: grid;
        height: max-content;
        row-gap: 24px;

        .dont-have-account {
          display: flex;
          align-items: center;
          column-gap: 8px;

          .new-to-Hearthstone {
            color: #646464;
          }
        }

        .login-with-social-accounts {
          display: flex;
          justify-content: center;
          column-gap: 24px;
        }

        .content {
          .email-input {
          }

          .password-input {
            margin-top: 28px;
          }

          .forgot-your-password-section {
            margin-top: 32px;
            display: flex;
            align-items: center;
            column-gap: 8px;
          }
        }

        .login-button {
          width: 100%;
        }

        .or-line {
          display: grid;
          grid-template-columns: auto max-content auto;
          column-gap: 16px;
          align-items: center;
          .typography {
            color: #a7a7a7;
          }

          span {
            height: 2px;
            background-color: #e7e7e7;
          }
        }
      }
    }
  }
`;
