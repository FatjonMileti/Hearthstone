import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Switch, Typography, Button, ShowGlobalLoading } from '../../../components/index';
import { InfoCard } from './components/InfoCard';
import axios from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';
import { UserNotifications } from './user.interface';
import { useProfileStore } from '../../../globalState/profile';
import GirlOnPhone from './images/girl on phone.png';

const userNotificationSchema = yup.object().shape({
  email_updates: yup.boolean(),
  sms_updates: yup.boolean(),
  desktop_notification: yup.boolean(),
  offers_updates: yup.boolean(),
  news_updates: yup.boolean()
});

export const CommunicationSettings = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const { userDetails, auth } = useUserStore();
  const profileStore = useProfileStore();

  const notificationForm = useForm<UserNotifications>({
    resolver: yupResolver(userNotificationSchema) as any,
    defaultValues: profileStore.notification
  });

  React.useEffect(() => {
    notificationForm.reset(profileStore.notification);
  }, [profileStore.notification]);

  const settingsMutation = useMutation(
    async (data: UserNotifications) => {
      return await axios(auth.access_token).patch('/api/user/' + userDetails.user_id, {
        notification: data
      });
    },
    {
      onSuccess: () => {
        profileStore.fetchProfile(auth.access_token);
      }
    }
  );

  return (
    <>
      {settingsMutation.isLoading && <ShowGlobalLoading />}
      <form
        onSubmit={notificationForm.handleSubmit((data) => settingsMutation.mutate(data))}
        className={`communication-settings ${className}`}>
        <div className='communication-settings-header'>
          <Typography variant='body2' className='section-title'>
            Communication settings
          </Typography>
          <Button
            type='submit'
            size='medium'
            className='submit-button'
            disabled={!notificationForm.formState.isDirty}>
            Save changes
          </Button>
        </div>
        <div className='section-wrapper'>
          <div className='communication-settings-wrapper'>
            <div className='section'>
              <Typography variant='body3' className='title'>
                Account notifications
              </Typography>
              <div className='notification-list'>
                <div className='notification'>
                  <div className='texts'>
                    <Typography variant='body4' className='notification-title'>
                      Email updates
                    </Typography>
                    <Typography variant='body6' className='notification-description'>
                      Receive email updates about the status of your matches, messages received as well as
                      updates on legal documents upload.
                    </Typography>
                  </div>
                  <Controller
                    name='email_updates'
                    control={notificationForm.control}
                    render={({ field }) => {
                      return <Switch size='medium' checked={field.value} onChange={field.onChange} />;
                    }}
                  />
                </div>
                <div className='notification'>
                  <div className='texts'>
                    <Typography variant='body4' className='notification-title'>
                      SMS updates
                    </Typography>
                    <Typography variant='body6' className='notification-description'>
                      Receive SMS updates about the status of your matches, messages received as well as
                      updates on legal documents upload.
                    </Typography>
                  </div>
                  <Controller
                    name='sms_updates'
                    control={notificationForm.control}
                    render={({ field }) => {
                      return <Switch size='medium' checked={field.value} onChange={field.onChange} />;
                    }}
                  />
                </div>
                <div className='notification'>
                  <div className='texts'>
                    <Typography variant='body4' className='notification-title'>
                      Desktop notifications
                    </Typography>
                    <Typography variant='body6' className='notification-description'>
                      Turn on notifications to get notified of new responses on your device.
                    </Typography>
                  </div>
                  <Controller
                    name='desktop_notification'
                    control={notificationForm.control}
                    render={({ field }) => {
                      return <Switch size='medium' checked={field.value} onChange={field.onChange} />;
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='section'>
              <Typography variant='body3' className='title'>
                Marketing notifications
              </Typography>
              <div className='notification-list'>
                <div className='notification'>
                  <div className='texts'>
                    <Typography variant='body4' className='notification-title'>
                      Offers updates
                    </Typography>
                    <Typography variant='body6' className='notification-description'>
                      Receive email updates about special offers and discounts.
                    </Typography>
                  </div>
                  <Controller
                    name='offers_updates'
                    control={notificationForm.control}
                    render={({ field }) => {
                      return <Switch size='medium' checked={field.value} onChange={field.onChange} />;
                    }}
                  />
                </div>
                <div className='notification'>
                  <div className='texts'>
                    <Typography variant='body4' className='notification-title'>
                      News updates
                    </Typography>
                    <Typography variant='body6' className='notification-description'>
                      Receive email updates about new articles published.
                    </Typography>
                  </div>
                  <Controller
                    name='news_updates'
                    control={notificationForm.control}
                    render={({ field }) => {
                      return <Switch size='medium' checked={field.value} onChange={field.onChange} />;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='right-part'>
            <InfoCard
              icon='remind'
              title='Why enable desktop notifications?'
              description='With desktop notifications enabled you will get notified instantly once you have a match, you receive a message or Hearthstone updates directly from your account.'
            />
            <img src={GirlOnPhone} alt='girl on phone' className='girl-on-phone' />
          </div>
        </div>
      </form>
    </>
  );
})`
  &.communication-settings {
    display: grid;
    gap: 40px;

    .communication-settings-header {
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

    .section-wrapper {
      position: relative;
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      justify-content: space-between;
      column-gap: 32px;

      .communication-settings-wrapper {
        display: grid;
        grid-template-rows: min-content auto;
        row-gap: 24px;
        max-width: 556px;

        .section {
          display: grid;
          grid-template-rows: min-content auto;
          gap: 16px;

          .title {
            color: #0d2a38;
            font-weight: 600;
          }

          .notification-list {
            display: grid;
            gap: 8px;

            .notification {
              display: flex;
              padding: 24px;
              align-items: center;
              justify-content: space-between;
              gap: 16px;

              border-radius: 8px;
              border: 1px solid #e7e7e7;

              .texts {
                display: grid;
                gap: 4px;

                .notification-title {
                  color: #0d2a38;
                  font-size: 18px;
                  font-weight: 600;
                }

                .notification-description {
                  color: #646464;
                  font-weight: 500;
                  line-height: 20px;
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

        .girl-on-phone {
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          width: 300px;
          height: 300px;
        }
      }
    }
  }
`;
