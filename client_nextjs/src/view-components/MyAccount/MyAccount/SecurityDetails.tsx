import { styled } from '@mui/system';
import React, { Fragment, HTMLAttributes, useRef } from 'react';
import { ShowGlobalLoading, Typography } from '../../components/index.ts';
import { Icon, Label } from '../../components/index.ts';
import Apple from './Apple_logo_black 1.svg';
import Google from './Google.svg';
import axios from '../../utils/axios.ts';
import { useUserStore } from '../../globalState/user.tsx';
import { IconProps } from '../../components/Icon.tsx';
import { DocumentType, IUser_Documents } from './user.interface.ts';
import { useProfileStore } from '../../globalState/profile.tsx';
import { useMutation } from '@tanstack/react-query';

interface DeviceHistory {
  deviceType: 'mobile' | 'desktop';
  deviceName: string;
  browser: string;
}

const deviceIcon: { [key: string]: IconProps['icon'] } = {
  mobile: 'mobile',
  desktop: 'computer'
};

const device_history: DeviceHistory[] = [
  {
    deviceType: 'mobile',
    deviceName: 'iOS 16.1',
    browser: 'Chrome • 04 May 2024 @ 11:30'
  },
  {
    deviceType: 'desktop',
    deviceName: 'OS X 10.15.7',
    browser: 'Chrome • 04 May 2024 @ 11:30'
  }
];

export const SecurityDetails = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const profileStore = useProfileStore();

  const isIdCardUploaded = profileStore.documents?.find((d) => d.type === DocumentType['Proof of ID']);

  const inputRef = useRef<HTMLInputElement>(null);

  const { auth, userDetails } = useUserStore();

  const idCardMutation = useMutation(
    async (idCard: File) => {
      const formData = new FormData();
      formData.append('files', idCard);

      const response = await axios(auth.access_token).post<Omit<IUser_Documents, 'type'>[]>(
        '/api/document/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const uploadedFile = response.data[0];

      const updatedDocuments = [
        ...profileStore.documents.filter((d) => d.type !== DocumentType['Proof of ID']),
        {
          ...uploadedFile,
          type: DocumentType['Proof of ID']
        }
      ].map(({ type, key, mimetype, originalName, link }) => ({ type, key, mimetype, originalName, link }));

      await axios(auth.access_token).patch('/api/user/' + userDetails.user_id, {
        documents: updatedDocuments
      });
    },
    {
      onSuccess: () => {
        profileStore.fetchProfile(auth.access_token);
      }
    }
  );

  const onIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) {
      return;
    }
    idCardMutation.mutate(selectedFile);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <>
      {idCardMutation.isLoading && <ShowGlobalLoading />}
      <div className={`security-details ${className}`}>
        <Typography variant='body2' className='section-title'>
          Security details
        </Typography>
        <div className='section-wrapper'>
          <div className='login-backup-wrapper'>
            <div className='id-details'>
              <div className='government-id-details'>
                {isIdCardUploaded && <Icon icon='completed-badge' size={48} />}

                <div>
                  <Typography variant='body4' className='government-id'>
                    Government ID
                  </Typography>
                  <Typography variant='body5' className='verified-on'>
                    Verified on: 6 May 2024
                  </Typography>
                </div>
              </div>
              <input
                type='file'
                accept='image/*, application/pdf'
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={onIdCardChange}
              />
              <Label variant='secondary' size='small' onClick={handleClick}>
                Update ID details
              </Label>
            </div>
            <div className='login section'>
              <Typography variant='body3' className='title'>
                Login
              </Typography>
              <div className='content'>
                <div className='update-password'>
                  <div>
                    <Typography variant='body4' className='password'>
                      Password
                    </Typography>
                    <Typography variant='body5' className='last-updated'>
                      Last updated: 6 May 2024
                    </Typography>
                  </div>
                  <Label variant='secondary' size='small'>
                    Update password
                  </Label>
                </div>
                <div className='two-factor-authentication'>
                  <div>
                    <Typography variant='body4' className='authentication'>
                      Two-factor authentication
                    </Typography>
                    <Typography variant='body5' className='enabled'>
                      Not enabled
                    </Typography>
                  </div>
                  <Label variant='primary' size='small'>
                    Setup two-factor
                  </Label>
                </div>
              </div>
            </div>
            <div className='backup section'>
              <Typography variant='body3' className='title'>
                Backup accounts
              </Typography>
              <div className='content'>
                <div className='backup-with'>
                  <div className='connected-account'>
                    <img src={Apple} alt='apple' className='logo' />
                    <div>
                      <Typography variant='body4' className='device'>
                        Apple
                      </Typography>
                      <Typography variant='body5' className='connected'>
                        Not connected
                      </Typography>
                    </div>
                  </div>
                  <Label variant='primary' size='small'>
                    Connect
                  </Label>
                </div>
                <div className='backup-with'>
                  <div className='connected-account'>
                    <img src={Google} alt='google' className='logo' />
                    <div>
                      <Typography variant='body4' className='device'>
                        Google
                      </Typography>
                      <Typography variant='body5' className='connected'>
                        Not connected
                      </Typography>
                    </div>
                  </div>
                  <Label variant='primary' size='small'>
                    Connect
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className='right-part'>
            <Typography variant='body3' className='device-history'>
              Device history
            </Typography>
            <div className='device-list'>
              {device_history.map((device, deviceIndex) => (
                <Fragment key={deviceIndex}>
                  <div className='device'>
                    <div className='device-info'>
                      <Icon icon={deviceIcon[device.deviceType]} size={32} />
                      <div>
                        <Typography variant='body5' className='device-name'>
                          {device.deviceName}
                        </Typography>
                        <Typography variant='body6' className='browser'>
                          {device.browser}
                        </Typography>
                      </div>
                    </div>
                    <Label variant='secondary' size='small'>
                      Forget
                    </Label>
                  </div>
                  {deviceIndex + 1 < device_history.length && <div className='line'></div>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
})`
  &.security-details {
    display: grid;
    gap: 40px;

    .section-title {
      color: #0d2a38;
      font-weight: 600;
      line-height: 48px;
    }

    .section-wrapper {
      position: relative;
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      justify-content: space-between;
      column-gap: 32px;

      .login-backup-wrapper {
        display: grid;
        grid-template-rows: repeat(3, min-content);
        row-gap: 24px;
        max-width: 556px;

        .id-details {
          display: grid;
          //grid-template-columns: auto min-content;
          padding: 24px;
          gap: 16px;
          align-items: center;

          border-radius: 8px;
          background: linear-gradient(180deg, #c0daff 0%, #d9e9ff 100%);
          box-shadow: 0 4px 32px 0 rgba(13, 42, 56, 0.1);

          .government-id-details {
            display: flex;
            align-items: center;
            gap: 16px;

            .government-id {
              color: #0d2a38;
              font-weight: 700;
            }

            .verified-on {
              color: #646464;
              font-weight: 500;
              line-height: 24px;
            }
          }
        }

        .section {
          display: grid;
          gap: 16px;

          .title {
            color: #0d2a38;
            font-weight: 600;
          }

          .content {
            display: grid;
            gap: 8px;
          }
        }

        .login {
          .update-password {
            display: flex;
            padding: 24px;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            border: 1px solid #e7e7e7;

            .password {
              color: #0d2a38;
              font-weight: 700;
            }

            .last-updated {
              color: #646464;
              font-weight: 500;
              line-height: 24px;
            }
          }

          .two-factor-authentication {
            display: flex;
            padding: 24px;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            border: 1px solid #e7e7e7;

            .authentication {
              color: #0d2a38;
              font-weight: 700;
            }

            .enabled {
              color: #646464;
              font-weight: 500;
              line-height: 24px;
            }
          }
        }

        .backup-with {
          display: flex;
          padding: 24px;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
          border: 1px solid #e7e7e7;

          .connected-account {
            display: flex;
            gap: 16px;

            .logo {
              width: 24px;
              height: 24px;
              padding: 12px;
              border-radius: 4px;
              background: #f3f4f5;
            }

            .device {
              color: #0d2a38;
              font-weight: 700;
            }

            .connected {
              color: #646464;
              font-weight: 500;
              line-height: 24px;
            }
          }
        }
      }

      .right-part {
        display: flex;
        flex-direction: column;
        justify-self: flex-end;
        min-width: 324px;
        gap: 16px;

        .device-history {
          font-weight: 600;
          color: #0d2a38;
        }

        .device-list {
          display: grid;
          gap: 16px;

          .device {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;

            .device-info {
              display: flex;
              gap: 8px;

              .device-name {
                color: #0d2a38;
                font-weight: 700;
                line-height: 24px;
              }

              .browser {
                color: #646464;
                font-weight: 500;
                line-height: 20px;
              }
            }
          }

          .line {
            height: 1px;
            background-color: #e7e7e7;
          }
        }
      }
    }
  }
`;
