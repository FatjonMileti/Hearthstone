import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Typography } from '../../../components';
import { Button } from '../../../components';
import { TextField } from '../../../components';
import { Textarea } from '../../../components/Textarea';
import { Icon } from '../../../components';
import { ShowGlobalLoading } from '../../../components';
import { Avatar } from '../../../components';
import axios from '../../../utils/axios';
import { avatars } from '../../HomeLoggedIn/avatars';
import { useUserStore } from '../../../globalState/user';
import { useProfileStore } from '../../../globalState/profile';
import { AccountSettings } from './AccountSettings';
import { Select } from '../../../components/Select/Select';
import { Label } from '../../../components';
// import { NotificationSettings } from './NotificationSettings';

const userSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required'),
  phone: yup.string(),
  description: yup.string().transform((value) => value || undefined),
  avatar: yup.string(),
  age: yup
    .number()
    .min(18, 'You must be 18 years or older')
    .max(110)
    .transform((value) => value || undefined),
  have_pets: yup.string().transform((value) => value || undefined),
  address: yup.string().transform((value) => value || undefined),
  martial_status: yup.string().transform((value) => value || undefined)
});

interface ProfileDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  description?: string;
  avatar?: string;
  address?: string;
  age?: number;
  martial_status?: string;
  have_pets?: string;
}

export const ProfileDetails = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [loading, setLoading] = React.useState(false);
  const [activeComponent, setActiveComponent] = React.useState('Account details');

  const profileStore = useProfileStore();

  const { userDetails, auth } = useUserStore();

  const profileDetailsForm = useForm<ProfileDetails>({
    resolver: yupResolver(userSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      description: '',
      avatar: profileStore.avatar || undefined,
      address: '',
      age: undefined,
      martial_status: undefined,
      have_pets: undefined
    },
    mode: 'all'
  });

  React.useEffect(() => {
    profileDetailsForm.watch();
    loadProfile();
  }, []);

  React.useEffect(() => {
    profileDetailsForm.setValue('first_name', profileStore.first_name);
    profileDetailsForm.setValue('last_name', profileStore.last_name);
    profileDetailsForm.setValue('email', profileStore.email);
    profileDetailsForm.setValue('phone', profileStore.phone);
    profileDetailsForm.setValue('description', profileStore.description);
    profileDetailsForm.setValue('avatar', profileStore.avatar || '');
    profileDetailsForm.setValue('age', profileStore.age || undefined);
    profileDetailsForm.setValue('address', profileStore.address || '');
    profileDetailsForm.setValue('martial_status', profileStore.martial_status || undefined);
    profileDetailsForm.setValue('have_pets', profileStore.have_pets || undefined);
  }, [profileStore]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      await profileStore.fetchProfile(auth.access_token);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);

    data.have_pets = data.have_pets === 'Yes';
    try {
      await axios(auth.access_token).patch('/api/user/' + userDetails.user_id, data);
      await loadProfile();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={profileDetailsForm.handleSubmit(onSubmit)} className={`profile-details ${className}`}>
        {loading && <ShowGlobalLoading />}
        <div className='account-settings'>
          <div className='account-settings-header'>
            <Typography variant='body3' className='account-settings-title'>
              {' '}
              Account settings{' '}
            </Typography>
            <div className='account-settings-nav'>
              <Label
                variant='tertiary'
                size='large'
                active={activeComponent === 'Account details'}
                onClick={() => setActiveComponent('Account details')}>
                {' '}
                Account details
              </Label>
              <Label
                variant='tertiary'
                size='large'
                active={activeComponent === 'Security'}
                onClick={() => setActiveComponent('Security')}>
                Security
              </Label>
              <Label
                variant='tertiary'
                size='large'
                active={activeComponent === 'Notifications'}
                onClick={() => setActiveComponent('Notifications')}>
                Notifications
              </Label>
            </div>
          </div>
          {activeComponent === 'Account details' && (
            <>
              <div className='section'>
                <Typography className='section-title' variant='body4'>
                  Your avatar
                </Typography>
                <Controller
                  name='avatar'
                  control={profileDetailsForm.control}
                  render={({ field }) => (
                    <div className='setup-avatar'>
                      {avatars.map(({ image }, avatarIndex) => {
                        const active = avatarIndex === Number(field.value || '');
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
              <div className='left-part'>
                <div className='section'>
                  <Typography className='section-title' variant='body4'>
                    Contact information
                  </Typography>
                  <div className='contact-information'>
                    <TextField
                      label='First Name'
                      {...profileDetailsForm.register('first_name')}
                      error={!!profileDetailsForm.formState.errors?.first_name}
                      helperText={profileDetailsForm.formState.errors?.first_name?.message}
                      required
                    />
                    <TextField
                      label='Last Name'
                      {...profileDetailsForm.register('last_name')}
                      error={!!profileDetailsForm.formState.errors?.last_name}
                      helperText={profileDetailsForm.formState.errors?.last_name?.message}
                      required
                    />
                    <TextField
                      label='Email'
                      {...profileDetailsForm.register('email')}
                      error={!!profileDetailsForm.formState.errors?.email}
                      helperText={profileDetailsForm.formState.errors?.email?.message}
                      required
                    />
                    <TextField label='Phone' {...profileDetailsForm.register('phone')} />
                  </div>
                </div>
                <div className='section'>
                  <Typography className='section-title' variant='body4'>
                    Personal details
                  </Typography>
                  <div className='contact-information' style={{ marginBottom: '1rem' }}>
                    <TextField
                      type='number'
                      label='Age'
                      {...profileDetailsForm.register('age')}
                      error={!!profileDetailsForm.formState.errors?.age}
                      helperText={profileDetailsForm.formState.errors?.age?.message}
                    />

                    <Select
                      label={<>Martial status</>}
                      {...profileDetailsForm.register('martial_status')}
                      error={!!profileDetailsForm.formState.errors['martial_status']}
                      helperText={profileDetailsForm.formState.errors['martial_status']?.message?.toString()}>
                      <option></option>
                      <option value='Single'>Single</option>
                      <option value='Married'>Married</option>
                    </Select>
                    <Select
                      label='Pets?'
                      {...profileDetailsForm.register('have_pets')}
                      error={!!profileDetailsForm.formState.errors['have_pets']}
                      helperText={profileDetailsForm.formState.errors['have_pets']?.message?.toString()}>
                      <option></option>
                      <option value='Yes'>Yes</option>
                      <option value='No'>No</option>
                    </Select>
                    <div className='user-type'>
                      <Typography className='label'>User type</Typography>
                      <Typography variant='body4' className='user-type-content'>
                        {profileStore.role}
                      </Typography>
                    </div>
                  </div>
                  <Textarea
                    rows={6}
                    label='Describe yourself (your matches will see this)'
                    {...profileDetailsForm.register('description')}
                    defaultValue=''></Textarea>
                </div>

                <div className='section'>
                  <Textarea
                    rows={2}
                    label='Address'
                    {...profileDetailsForm.register('address')}
                    defaultValue=''></Textarea>
                </div>
              </div>
              <Button type='submit' size='large' disabled={!profileDetailsForm.formState.isValid}>
                Save changes
              </Button>
            </>
          )}
          {activeComponent === 'Security' && <AccountSettings />}
          {/*{activeComponent === 'Notifications' && <NotificationSettings />}*/}
        </div>
      </form>
    </>
  );
})`
  &.profile-details {
    display: grid;
    min-height: 100%;

    .account-settings {
      display: grid;
      row-gap: 32px;
      align-content: flex-start;

      .account-settings-header {
        display: grid;
        row-gap: 16px;

        .account-settings-title {
          font-family: At Gambit, sans-serif;
        }
        .account-settings-nav {
          display: flex;
          align-items: flex-start;
          border-bottom: 2px solid #f3f4f5;
          gap: 32px;

          .label {
            padding: 16px 0;
            margin-bottom: -2px;

            color: #646464;

            :hover {
              color: #0d2a38;
              border-color: #0d2a38;
            }
            &.active {
              color: #0d2a38;
              border-color: #0d2a38;
            }
          }
        }
      }

      .left-part {
        display: grid;
        gap: 32px;
        max-width: 441px;
      }
    }

    .section {
      display: grid;
      row-gap: 16px;
      .section-title {
        color: #646464;
      }
    }

    .contact-information {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;

      .user-type {
        display: flex;
        flex-direction: column;
        background-color: inherit;
        row-gap: 4px;

        font-family: 'Roobert', serif;

        .label {
          font-weight: 600;
          font-size: 12px;
          line-height: 16px;
          color: #0d2a38;
          font-family: 'Roobert', serif;
        }

        .user-type-content {
          padding: 12px;
          color: #646464;
          font-weight: 600;
        }

        .required-asterisk {
          color: #b4263b;
          font-weight: 600;
          font-size: 12px;
          line-height: 16px;
        }
      }
    }

    .setup-avatar {
      display: flex;
      column-gap: 20px;

      .avatar {
        position: relative;
        cursor: pointer;
        height: 72px;
        width: 72px;
        box-sizing: border-box;
        display: flex;

        .icon {
          display: none !important;
        }

        &.active {
          outline: 2px solid #e5155a;

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
            bottom: -8px;
            background: #e5155a;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 50%;
            //padding: 4px;
          }
        }
      }
    }
  }
`;
