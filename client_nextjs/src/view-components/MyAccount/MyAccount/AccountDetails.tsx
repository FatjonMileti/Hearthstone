import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { ShowGlobalLoading } from '../../components/index.ts';
import { Avatar } from '../../components/index.ts';
import { Icon } from '../../components/index.ts';
import { InfoCard } from './components/InfoCard.tsx';
import { Typography } from '../../components/index.ts';
import { Button } from '../../components/index.ts';
import { TextField } from '../../components/index.ts';
import { Textarea } from '../../components/Textarea.tsx';

import { useProfileStore } from '../../globalState/profile.tsx';
import { useUserStore } from '../../globalState/user.tsx';
import axios from '../../utils/axios.ts';
import { avatars } from '../HomeLoggedIn/avatars.tsx';
import { useMutation } from '@tanstack/react-query';

const userSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required'),
  phone: yup.string(),
  description: yup.string(),
  avatar: yup.string()
});

interface AccountDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  description?: string;
  avatar?: string;
}

export const AccountDetails = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const profileStore = useProfileStore();
  const userStore = useUserStore();

  const accountDetails = useProfileStore(({ first_name, last_name, email, phone, description, avatar }) => ({
    first_name,
    last_name,
    email,
    phone,
    description,
    avatar
  }));

  const accountDetailsForm = useForm<AccountDetails>({
    resolver: yupResolver(userSchema),
    defaultValues: accountDetails,
    mode: 'all'
  });

  React.useEffect(() => {
    accountDetailsForm.reset(accountDetails);
  }, [JSON.stringify(accountDetails)]);

  const accountDetailsMutation = useMutation(
    async (data: AccountDetails) => {
      return await axios(userStore.auth.access_token).patch(
        '/api/user/' + userStore.userDetails.user_id,
        data
      );
    },
    {
      onSuccess: () => {
        profileStore.fetchProfile(userStore.auth.access_token);
      },
      onError: (err) => {
        console.log(err);
      }
    }
  );

  return (
    <>
      {accountDetailsMutation.isLoading && <ShowGlobalLoading />}
      <form
        onSubmit={accountDetailsForm.handleSubmit((data) => accountDetailsMutation.mutate(data))}
        className={`account-details ${className}`}>
        <div className='account-details-header'>
          <Typography variant='body2' className='section-title'>
            My Bio
          </Typography>
          <Button
            type='submit'
            size='medium'
            className='submit-button'
            disabled={!accountDetailsForm.formState.isValid || !accountDetailsForm.formState.isDirty}>
            Save changes
          </Button>
        </div>
        <div className='profile-details-wrapper'>
          <div className='personal-details'>
            <Typography variant='body3' className='title'>
              Personal details
            </Typography>
            <div className='personal-details-form'>
              <div className='contact-information'>
                <TextField
                  label='First Name'
                  {...accountDetailsForm.register('first_name')}
                  error={!!accountDetailsForm.formState.errors?.first_name}
                  helperText={accountDetailsForm.formState.errors?.first_name?.message}
                  required
                />
                <TextField
                  label='Last Name'
                  {...accountDetailsForm.register('last_name')}
                  error={!!accountDetailsForm.formState.errors?.last_name}
                  helperText={accountDetailsForm.formState.errors?.last_name?.message}
                  required
                />
                <TextField
                  label='Email'
                  {...accountDetailsForm.register('email')}
                  error={!!accountDetailsForm.formState.errors?.email}
                  helperText={accountDetailsForm.formState.errors?.email?.message}
                  required
                />
                <TextField
                  label='Phone number'
                  {...accountDetailsForm.register('phone')}
                  startAdornment={
                    <span
                      style={{ marginLeft: '12px', fontSize: '14px', lineHeight: '24px', color: '#A7A7A7' }}>
                      +44
                    </span>
                  }
                />
              </div>
              <Textarea
                hint={
                  'The bio section will help your matches find out more about and can exponentially increase your chances of getting a perfect match. You can describe yourself using maximum 240 characters.'
                }
                rows={7}
                label='About yourself'
                placeholder='Say something about yourself...'
                {...accountDetailsForm.register('description')}
                defaultValue=''></Textarea>
              <div className='avatar-section'>
                <div>
                  <Typography className='avatar-section-title' variant='body6'>
                    Avatar
                  </Typography>
                  <Typography className='avatar-section-description' variant='body6'>
                    Select the avatar that will be displayed on your account. All avatars are AI generated and
                    you can not use personal photos or upload them.
                  </Typography>
                </div>
                <Controller
                  name='avatar'
                  control={accountDetailsForm.control}
                  render={({ field }) => (
                    <div className='setup-avatar'>
                      {avatars.map(({ image }, avatarIndex) => {
                        const active = avatarIndex === Number(field.value);
                        return (
                          <Avatar
                            image={image}
                            onClick={() => field.onChange({ target: { value: avatarIndex.toString() } })}
                            key={avatarIndex}
                            className={`${active ? 'active' : ''}`}>
                            <Icon icon='checked' color='white' size={16} />
                          </Avatar>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
          <div className='right-part'>
            <InfoCard
              icon='performance-inquiry'
              title='Why and how we use your information?'
              description='Your information is used only to find relevant matches and to complete the legal documents needed when the transaction goes through.'
            />
            <InfoCard
              icon='lock'
              title='How secure is your information?'
              description='Your personal details are used only by Hearthstone and are not shared with any third parties or other companies outside Hearthstone.'
            />
            <InfoCard
              icon='achievement'
              title='How does account completion work?'
              description='Having a 100% account completion actually help you find perfect matches as it provides more information to your potential matches.'
            />
          </div>
        </div>
      </form>
    </>
  );
})`
  &.account-details {
    display: grid;
    gap: 40px;

    .account-details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .section-title {
        color: #0d2a38;
        font-weight: 600;
        line-height: 48px;
      }

      .submit-button {
        padding: 12px 24px;
      }
    }

    .profile-details-wrapper {
      position: relative;
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      justify-content: space-between;
      column-gap: 32px;

      .personal-details {
        display: grid;
        gap: 16px;
        max-width: 556px;

        .title {
          color: #0d2a38;
          font-weight: 600;
        }

        .personal-details-form {
          display: grid;
          gap: 24px;

          .contact-information {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .avatar-section {
            display: grid;
            gap: 16px;

            .avatar-section-title {
              color: #646464;
              font-weight: 700;
              line-height: 20px;
            }

            .avatar-section-description {
              color: #646464;
              font-weight: 500;
              line-height: 20px;
            }

            .setup-avatar {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .avatar {
                position: relative;
                cursor: pointer;
                height: 64px;
                width: 64px;
                box-sizing: border-box;
                display: flex;

                .icon {
                  display: none !important;
                }
                transition: outline-width 0.2s;

                &.active {
                  outline: 1px solid #184d6d;

                  :before {
                    content: '';
                    z-index: 1;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 50%;
                    position: absolute;
                  }

                  .icon {
                    display: initial !important;
                    position: absolute;
                    z-index: 4;
                    top: 0;
                    right: 0;
                    background: #184d6d;
                    border-radius: 50%;
                    padding: 2px;
                  }
                }
              }
            }
          }
        }
      }
      .right-part {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
    }
  }
`;
