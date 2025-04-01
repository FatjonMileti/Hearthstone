import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Typography } from '../../../../components';
import { Button } from '../../../../components';
import { TextField } from '../../../../components';
import { Textarea } from '../../../../components/Textarea';
import { Icon } from '../../../../components';
import { ShowGlobalLoading } from '../../../../components';
import { Avatar } from '../../../../components';

import axios from '../../../../utils/axios';
import { avatars } from '../../../HomeLoggedIn/avatars';
import { useUserStore } from '../../../../globalState/user';
import { useProfileStore } from '../../../../globalState/profile';

const userSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required'),
  phone: yup.string().nullable(),
  description: yup.string().nullable(),
  avatar: yup.string().nullable(),
});

interface ProfileDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  description: string;
  avatar?: string;
}

export const ProfileDetails = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [loading, setLoading] = React.useState(false);

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
      avatar: profileStore.avatar ? profileStore.avatar : undefined
    }
  });

  const handleSelectedAvatar = (index: number) => {
    profileDetailsForm.setValue('avatar', index.toString());
  };

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
              />
              <TextField
                label='Last Name'
                {...profileDetailsForm.register('last_name')}
                error={!!profileDetailsForm.formState.errors?.last_name}
                helperText={profileDetailsForm.formState.errors?.last_name?.message}
              />
              <TextField
                label='Email'
                {...profileDetailsForm.register('email')}
                error={!!profileDetailsForm.formState.errors?.email}
                helperText={profileDetailsForm.formState.errors?.email?.message}
              />
              <TextField label='Phone' {...profileDetailsForm.register('phone')} />
            </div>
          </div>

          <div className='section'>
            <Typography className='section-title' variant='body4'>
              Personal details
            </Typography>
            <div className='personal-details'>
              <Textarea
                rows={6}
                label='Describe yourself (your matches will see this)'
                {...profileDetailsForm.register('description')}
                defaultValue=''></Textarea>
            </div>
          </div>

          <div className='section'>
            <Typography className='section-title' variant='body4'>
              Setup avatar
            </Typography>
            <div className='setup-avatar'>
              {avatars.map(({ image }, avatarIndex) => {
                const active = avatarIndex === parseInt(profileDetailsForm.getValues('avatar') || '');

                return (
                  <Avatar
                    image={image}
                    onClick={() => handleSelectedAvatar(avatarIndex)}
                    key={avatarIndex}
                    className={`${active ? 'active' : ''}`}>
                    <Icon icon='checked' color='black' size={10} />
                  </Avatar>
                );
              })}
            </div>
          </div>
        </div>
        <div className='right-part'>
          <Button type='submit'>Save changes</Button>
        </div>
      </form>
    </>
  );
})`
  &.profile-details {
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

    .contact-information {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
    }

    .personal-details {
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
          outline: 2px solid #eee0d3;

          :before {
            content: '';
            z-index: 1;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 50%;
            border: 2px solid var(--primary-brand-sand, #eee0d3);
            position: absolute;
          }

          .icon {
            display: initial !important;
            position: absolute;
            z-index: 4;
            bottom: -8px;
            background: #eee0d3;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 50%;
            padding: 4px;
          }
        }
      }
    }
  }
`;
