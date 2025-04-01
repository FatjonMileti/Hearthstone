import React from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { AxiosError } from 'axios';
import * as yup from 'yup';

import { Modal, ModalProps } from '../../components/Modal';
import { ShowGlobalLoading } from '../../components/ShowGlobalLoading';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { IconButton } from '../../components/IconButton';
import { CloseButton } from '../../components/CloseButton';
import { Label } from '../../components/Label';
import { SocialAccountButton } from '../../components/SocialAccountButton';

import config from '../../config';
import { VerifyEmailModal } from './VerifyEmailModal';

const schema = yup.object().shape({
  firstName: yup.string().required('first name is required'),
  lastName: yup.string().required('last name is required'),
  email: yup.string().email().required('email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(32, 'Password must not exceed 32 characters')
    .test('password-strength', 'Password must contain uppercase letter, number, and symbol', (value) => {
      if (!value) return false;
      return /[A-Z]/.test(value) && /\d/.test(value) && /[!@#$%^&*()\-=_+[\]{}|\\;:'",.<>?/]/.test(value);
    })
    .required('Password is required')
});

interface CreateAccountModalProps extends ModalProps {
  onSigInClick?: () => void;
}
export const CreateAccountModal = styled(
  ({
    className,
    onSigInClick = () => {},
    onBackdropClick = () => {},
    ...otherProps
  }: CreateAccountModalProps) => {
    const form = useForm({ resolver: yupResolver(schema) as any, mode: 'all' });

    const [showVerifyEmailModal, setShowVerifyEmailModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const onSubmit = async (data: any) => {
      setLoading(true);
      const { firstName, lastName, email, password } = data;

      try {
        await axios.post(`${config.apiUrl}/api/account/register`, {
          first_name: firstName,
          last_name: lastName,
          email,
          password
        });

        onBackdropClick();
        setShowVerifyEmailModal(true);
      } catch (err: AxiosError | any) {
        const message = err?.response?.data?.message;

        if (!message) throw err;

        if (message === 'user_already_exists') {
          return form.setError('email', { message: 'User already registered!', type: 'server' });
        }
        if (
          [
            'should_have_uppercase',
            'should_have_number',
            'should_have_symbol',
            'password_length_less_than_eight'
          ].includes(message)
        ) {
          return form.setError('password', {
            message: 'Password must contain uppercase letter, number, and symbol',
            type: 'server'
          });
        }

        throw err;
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        {loading && <ShowGlobalLoading />}

        <VerifyEmailModal
          open={showVerifyEmailModal}
          onBackdropClick={() => setShowVerifyEmailModal(false)}
          onSigInClick={() => {
            setShowVerifyEmailModal(false);
            onSigInClick();
          }}
        />
        <Modal
          {...otherProps}
          onBackdropClick={onBackdropClick}
          className={classNames('create-account-modal', className)}>
          <div className='modal-header'>
            <Typography variant='body3' className='title'>
              Create account
            </Typography>
            <CloseButton inverted={false} background={true} size='medium' onClick={onBackdropClick} />
          </div>

          <div className='container'>
            <div className='already-have-account'>
              <Typography variant='body4' className='already-in-Hearthstone'>
                Already have an account?
              </Typography>
              <Label variant='tertiary' size='medium' onClick={onSigInClick}>
                Sign in
              </Label>
            </div>

            <form className='content'>
              <div className='form-fields'>
                <TextField
                  label='First Name'
                  className='first-name-input'
                  required
                  {...form.register('firstName')}
                  error={!!form.formState.errors.firstName}
                  helperText={form.formState.errors.firstName?.message?.toString()}
                  placeholder='Enter your first name'
                />
                <TextField
                  label='Last Name'
                  className='last-name-input'
                  required
                  {...form.register('lastName')}
                  error={!!form.formState.errors.lastName}
                  helperText={form.formState.errors.lastName?.message?.toString()}
                  placeholder='Enter your last name'
                />
                <TextField
                  label='Email'
                  className='email-input'
                  required
                  {...form.register('email')}
                  error={!!form.formState.errors.email}
                  helperText={form.formState.errors.email?.message?.toString()}
                  placeholder='Enter your email'
                />

                <TextField
                  type={showPassword ? 'text' : 'password'}
                  label='Password'
                  className='password-input'
                  required
                  {...form.register('password')}
                  endAdornment={
                    <IconButton
                      noBackground
                      style={{ color: '#184d6d' }}
                      onClick={() => setShowPassword((show) => !show)}>
                      {<Icon icon={showPassword ? 'eye-invisible' : 'eye'} />}
                    </IconButton>
                  }
                  error={!!form.formState.errors.password}
                  helperText={form.formState.errors.password?.message?.toString()}
                />
              </div>
            </form>

            <Button
              className='login-button'
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid}
              size='large'>
              Create Account
            </Button>

            <div className='or-line'>
              <span />
              <Typography variant='body5'>OR CREATE ACCOUNT WITH</Typography>
              <span />
            </div>

            <div className='login-with-social-accounts '>
              <SocialAccountButton icon='facebook-f' />
              <SocialAccountButton icon='twitter' />
              <SocialAccountButton icon='instagram' />
              <SocialAccountButton icon='google' />
            </div>
          </div>
        </Modal>
      </>
    );
  }
)`
  &.create-account-modal {
    overflow-y: auto;
    max-height: 100vh;
    max-width: 100%;
    width: 440px;
    display: grid;

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

      .already-have-account {
        margin-top: 8px;
        display: flex;
        align-items: center;
        column-gap: 8px;

        .already-in-Hearthstone {
          color: #646464;
        }
      }

      .login-with-social-accounts {
        display: flex;
        justify-content: center;
        column-gap: 24px;
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

      .form-fields {
        display: grid;
        grid-template:
          'f l'
          'e e'
          'p p';

        row-gap: 28px;
        column-gap: 16px;

        max-width: 672px;

        .first-name-input {
          grid-area: f;
        }
        .last-name-input {
          grid-area: l;
        }

        .email-input {
          grid-area: e;
        }

        .password-input {
          grid-area: p;
        }
      }

      .login-button {
        width: 100%;
      }
    }
  }
`;
