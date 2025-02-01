import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';

import { Avatar, Label, Modal } from '../../../components/index.ts';
import { Typography } from '../../../components/index.ts';
import { Icon } from '../../../components/index.ts';

import verified from '../../MyAccount/images/verified.svg';
import { avatars, getAvatarFormIndex } from '../../HomeLoggedIn/avatars.tsx';
import { ApiPropertyDocumentType } from '../../Properties/NewProperty/property.types.ts';
import { RoundAction } from '../../../components/RoundAction.tsx';

export interface TenantMatchData {
  chosen: boolean;
  matched?: boolean;
  criteria: any;
  property: ApiPropertyDocumentType;
  percentage: number;
}

interface ViewProfileProps extends HTMLAttributes<HTMLDivElement> {
  closeViewProfile: () => void;
  likeTenant?: () => void;
  dislikeTenant?: () => void;
  disableLikeTenant?: boolean;
  tenantMatch: TenantMatchData;
}

export const ViewProfile = styled(
  ({
    className,
    closeViewProfile,
    likeTenant = () => {},
    dislikeTenant = () => {},
    disableLikeTenant = false,
    tenantMatch
  }: ViewProfileProps) => {
    const {
      propertyType,
      propertyPreferences,
      areaOfInterest,
      radius,
      moveIn,
      nrOfBedrooms,
      nrOfBathrooms,
      specificPropertyFeatures,
      depositAmount,
      firstName,
      lastName,
      avatar
    } = tenantMatch.criteria;

    const awaitingMatch = tenantMatch.chosen && !tenantMatch.matched;
    return (
      <Modal className={`view-profile-modal ${className}`} open={true} onBackdropClick={closeViewProfile}>
        <div className='modal-header'>
          <Typography variant='body2' className='modal-title'>
            Match details
          </Typography>
          <RoundAction icon='close' onClick={closeViewProfile} />
        </div>
        <div>
          {awaitingMatch && (
            <div className='match-request awaiting'>
              <Icon icon='watch' size={24} />
              <Typography variant='body5' className='message'>
                Match request sent
              </Typography>
            </div>
          )}

          {tenantMatch.matched && (
            <div className='match-request accepted'>
              <Icon icon='like' size={24} />
              <Typography variant='body5' className='message'>
                You are perfectly matched with this tenant
              </Typography>
            </div>
          )}
        </div>
        <div className='modal-content'>
          <div className='avatar-side' style={{ backgroundImage: `url(${getAvatarFormIndex(avatar)})` }}>
            {!avatar && <Icon icon='user' size={240} className='user-icon' />}
          </div>
          <div className='details-side'>
            <div className='header'>
              <div className='header-left'>
                <Avatar image={avatars[avatar]?.image} />
                <div className='tenant-name-wrapper'>
                  <Typography variant='body3' className='tenant-name'>
                    {`${firstName} ${lastName}`}
                  </Typography>
                  <img src={verified} alt='Verified indicator' />
                </div>
              </div>
              <div>
                <Typography variant='body6' className='match-rate'>
                  Match rate
                </Typography>
                <Typography variant='body4' className='percentage'>
                  {tenantMatch.percentage}%
                </Typography>
              </div>
            </div>
            <div className='about-section'>
              <Typography variant='body4' className='title'>
                About tenant
              </Typography>
              <Typography variant='body4' className='description'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </div>
            <div className='line'></div>
            <div className='looking-for-section'>
              <Typography variant='body4' className='looking-for'>
                Looking for
              </Typography>
              <div className='looking-for-content'>
                <div className='details'>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Property type
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {propertyType}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Property class:
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {propertyPreferences}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Location
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {areaOfInterest}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Radius
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {radius}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Moving in:
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {moveIn}
                    </Typography>
                  </div>
                </div>
                <div className='details'>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Deposit
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {depositAmount}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Bedrooms
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {nrOfBedrooms}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Bathrooms
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {nrOfBathrooms}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Parking spots:
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {specificPropertyFeatures.includes('Parking spot') ? 'Yes' : 'No'}
                    </Typography>
                  </div>
                  <div className='detail'>
                    <Typography variant='body4' className='detail-name'>
                      Pets:
                    </Typography>
                    <Typography variant='body4' className='detail-value'>
                      {specificPropertyFeatures.includes('Allows pets') ? 'Yes' : 'No'}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
            <div className='line'></div>
            {!awaitingMatch && (
              <div className='action-buttons'>
                <Label variant='secondary' size='large' onClick={dislikeTenant}>
                  <Icon icon='dislike' size={24} />
                  {tenantMatch.matched ? 'Unmatch' : 'Dismiss'}
                </Label>
                {tenantMatch.matched ? (
                  <Label variant='special' size='large' className='message-button' onClick={closeViewProfile}>
                    <Icon icon='email' size={24} />
                    Message
                  </Label>
                ) : (
                  <Label
                    variant='special'
                    size='large'
                    className='match-button'
                    onClick={likeTenant}
                    disabled={disableLikeTenant}>
                    <Icon icon='like' size={24} />
                    Match
                  </Label>
                )}
              </div>
            )}
            {awaitingMatch && (
              <Label variant='secondary' className='cancel-request' onClick={dislikeTenant} size='large'>
                <Icon icon='close' size={24} />
                Cancel match request
              </Label>
            )}
          </div>
        </div>
      </Modal>
    );
  }
)`
  &.view-profile-modal {
    display: grid;
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow-y: auto;
    max-width: 100vw;
    max-height: 100vh;

    border-radius: 0;

    .modal-container {
      position: relative;
      padding: 0 !important;
      display: grid;
      grid-template-rows: min-content min-content auto;

      .modal-header {
        padding: 24px 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        border-bottom: 1px solid #f3f4f5;

        .modal-title {
          color: #0d2a38;
          font-weight: 600;
          line-height: 48px;
        }
      }

      .match-request {
        display: flex;
        padding: 8px;
        justify-content: center;
        align-items: center;
        gap: 8px;

        .message {
          font-weight: 700;
          line-height: 24px;
        }

        &.awaiting {
          color: #646464;
          background-color: #f3f4f5;
        }

        &.accepted {
          color: #408140;
          background-color: #ecf2ec;
        }
      }

      .modal-content {
        display: grid;
        padding: 24px 36px 48px 36px;
        grid-template-columns: 1fr 0.49fr;
        gap: 24px;

        ${(props) => props.theme.breakpoints.down('laptop')} {
          grid-template-columns: 1fr;
        }

        .avatar-side {
          display: grid;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 16px;
          box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.25);

          ${(props) => props.theme.breakpoints.down('laptop')} {
            order: 0;
            height: 732px;
          }

          background-color: #f7f1e7;

          .user-icon {
            place-self: center;
          }
        }

        .details-side {
          display: grid;
          padding: 24px;
          align-content: flex-start;
          row-gap: 24px;
          background-color: #f3f4f5;
          border-radius: 16px;

          ${(props) => props.theme.breakpoints.down('laptop')} {
            order: 1;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;

            .header-left {
              display: flex;
              column-gap: 16px;
              align-items: center;

              .avatar {
                width: 48px;
                height: 48px;
              }

              .tenant-name-wrapper {
                display: flex;
                align-items: center;
                gap: 4px;

                .tenant-name {
                  font-weight: 900;
                }

                img {
                  width: 24px;
                  height: 24px;
                }
              }
            }

            .match-rate {
              color: #646464;
              font-weight: 500;
              line-height: 20px;
            }

            .percentage {
              display: grid;
              justify-items: flex-end;
              color: #e5155a;
              font-size: 18px;
              font-weight: 900;
            }
          }

          .about-section {
            display: grid;
            gap: 8px;

            .title {
              color: #0d2a38;
              font-size: 18px;
              font-weight: 900;
            }

            .description {
              color: #0d2a38;
              font-weight: 500;
            }
          }
          .line {
            background-color: #e7e7e7;
            height: 1px;
          }
          .looking-for-section {
            display: grid;
            gap: 16px;

            .looking-for {
              color: #0d2a38;
              font-weight: 700;
            }

            .looking-for-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              column-gap: 16px;

              .details {
                display: grid;
                gap: 8px;

                .detail {
                  .detail-name {
                    color: #a7a7a7;
                    font-weight: 500;
                  }
                  .detail-value {
                    color: #0d2a38;
                    font-weight: 700;
                  }
                }
              }
            }
          }
          .action-buttons {
            display: grid;
            grid-template-columns: min-content auto;
            justify-items: flex-end;
            gap: 16px;
            box-sizing: border-box;

            .match-button {
              width: 100%;
            }

            .message-button {
              width: 100%;
            }
          }

          .cancel-request {
            width: 100%;
          }
        }
      }
    }
  }
`;
