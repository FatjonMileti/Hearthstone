import { styled } from '@mui/system';
import { Typography } from '../../../components/index.ts';
import { Modal, ModalProps } from '../../../components/Modal.tsx';

import { Icon } from '../../../components/index.ts';
import { useState } from 'react';
import { Map } from '../../../components/Map.tsx';
import classNames from 'classnames';
import { Carousel } from './MatchesProperties.Carousel.tsx';
import { NearestThings } from './ViewProperty.NearestThings.tsx';
import { avatars } from '../../HomeLoggedIn/avatars.tsx';

import { AreaUnit } from '../../Properties/NewProperty/property.constants.ts';
import { SuggestedPropertyType } from '../matches.type.ts';
import { Avatar, Label } from '../../../components/index.ts';
import verified from '../../MyAccount/images/verified.svg';
import { RoundAction } from '../../../components/RoundAction.tsx';

interface ViewPropertyModalProps extends ModalProps {
  propertyMatch: SuggestedPropertyType;
  likeProperty?: () => void;
  dislikeProperty?: () => void;
  disableLikeProperty?: boolean;
  chatWith?: () => void;
}

export const ViewProperty = styled(
  ({
    className,
    closeModal,
    propertyMatch,
    chatWith = () => {},
    likeProperty = () => {},
    dislikeProperty = () => {},
    disableLikeProperty = false,
    ...rest
  }: ViewPropertyModalProps) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const property = propertyMatch.property;

    const awaitingMatch = propertyMatch.chosen && !propertyMatch.matched;

    const parsedProperty: any = {};

    parsedProperty.images = property?.property_images.map(({ link }) => link) || [];
    parsedProperty.avatar = !isNaN(parseInt(property.created_by.avatar || ''))
      ? avatars[parseInt(property.created_by.avatar || '')]?.image
      : '';
    parsedProperty.areaOfInterest = property.area_of_interest;
    parsedProperty.title = property?.title;
    parsedProperty.description = property?.description;
    parsedProperty.numberOfBedrooms = property?.room_details?.number_of_bedrooms;
    parsedProperty.numberOfBathrooms = property?.room_details?.number_of_bathrooms;
    parsedProperty.propertyOwnerName = `${property.created_by.first_name} ${property.created_by.last_name}`;
    parsedProperty.rentingPrice = `£${property.budget.min_budget} - £${property.budget.max_budget}`;
    parsedProperty.propertyType = property?.property_type || '';
    parsedProperty.propertyArea = property?.floor_size;
    parsedProperty.propertyAreaUnit = property?.floor_size_unit;

    parsedProperty.parkingSpot = property.parking_spot;
    parsedProperty.energyCertificate = property.epc_rating;
    parsedProperty.address = {
      lat: property?.asset_address?.latitude,
      lng: property?.asset_address?.longitude
    };
    parsedProperty.houseType = property?.house_details?.house_type;
    parsedProperty.propertyType = property?.property_type;
    parsedProperty.percentage = propertyMatch?.property.percentage;

    return (
      <Modal className={classNames('view-property-modal', className, { awaitingMatch })} {...rest}>
        <div className='modal-header'>
          <Typography variant='body2' className='modal-title'>
            Match details
          </Typography>
          <RoundAction icon='close' onClick={closeModal} />
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
          {propertyMatch.matched && (
            <div className='match-request accepted'>
              <Icon icon={'like'} size={24} />
              <Typography variant='body5' className='message'>
                You are perfectly matched with this property
              </Typography>
            </div>
          )}
        </div>
        <div className='modal-content'>
          <div className='left-side'>
            <Carousel
              indexStore={[activeImageIndex, setActiveImageIndex]}
              images={parsedProperty.images}></Carousel>
            <div className='details-section'>
              <div className='description-header'>
                <Typography variant='body3' className='title'>
                  {parsedProperty.title}
                </Typography>
                <div className='detail'>
                  <Icon icon='location' />
                  <Typography variant='body4' className='detail-value'>
                    {parsedProperty.areaOfInterest}
                  </Typography>
                </div>
              </div>
              <div className='line'></div>
              <div className='property-details'>
                <div className='detail'>
                  <Icon icon='double-bed' />
                  <Typography variant='body4' className='detail-value'>
                    {parsedProperty.numberOfBedrooms}
                  </Typography>
                </div>
                <Typography variant='body4' className='dot'>
                  •
                </Typography>
                <div className='detail'>
                  <Icon icon='bathtub' />
                  <Typography variant='body4' className='detail-value'>
                    {parsedProperty.nrOfBathrooms}
                  </Typography>
                </div>
                <Typography variant='body4' className='dot'>
                  •
                </Typography>
                <div className='detail'>
                  <Icon icon='building' />
                  <Typography variant='body4' className='detail-value'>
                    {parsedProperty.propertyType}
                  </Typography>
                </div>
                <Typography variant='body4' className='dot'>
                  •
                </Typography>
                <div className='detail'>
                  <Icon icon='ruler' />
                  <Typography variant='body4' className='detail-value'>
                    {parsedProperty.propertyAreaUnit === AreaUnit.SquareFoot
                      ? parsedProperty.propertyArea
                      : (parseInt(parsedProperty.propertyArea || '') * 10.764).toFixed(0)}{' '}
                    {AreaUnit.SquareFoot}/
                    {parsedProperty.propertyAreaUnit === AreaUnit.SquareMeter
                      ? parsedProperty.propertyArea
                      : (parseInt(parsedProperty.propertyArea || '') / 10.764).toFixed(0)}{' '}
                    {AreaUnit.SquareMeter}
                  </Typography>
                </div>
                <Typography variant='body4' className='dot'>
                  •
                </Typography>
                <div className='detail'>
                  <Icon icon='car' />
                  <Typography variant='body4' className='detail-value'>
                    Parking Spot
                  </Typography>
                </div>
                <Typography variant='body4' className='dot'>
                  •
                </Typography>
                <div className='detail'>
                  <Icon icon='temperature' />
                  <Typography variant='body4' className='detail-value'>
                    EPC Rating: {parsedProperty.energyCertificate}
                  </Typography>
                </div>
              </div>
            </div>
            <div className='property-description'>
              <Typography variant='body4' className='label'>
                Property description
              </Typography>
              <Typography variant='body4' className='description'>
                {parsedProperty.description}
              </Typography>
            </div>
            <Map className='view-property-map' address={parsedProperty.address} />
            <div className='facilities-wrapper'>
              <Typography variant='body4' className='label'>
                Facilities
              </Typography>
              <div className='facilities'>
                <ul>
                  <li>
                    <Typography variant='body4' className='description'>
                      {parsedProperty.propertyType}
                    </Typography>
                  </li>
                  {!!property.parking_spot && property.parking_spot > 0 ? (
                    <li>
                      <Typography variant='body4' className='description'>
                        {property.parking_spot === 1
                          ? 'Parking spot: ' + property.parking_spot
                          : 'Parking spots: ' + property.parking_spot}
                        {property.parking_details ? ', ' + property.parking_details : ''}
                      </Typography>
                    </li>
                  ) : (
                    ''
                  )}

                  {property.condition ? (
                    <li>
                      <Typography variant='body4' className='description'>
                        {' '}
                        {'Condition: ' + property.condition}
                      </Typography>
                    </li>
                  ) : (
                    ''
                  )}
                </ul>
              </div>
            </div>
            <NearestThings location={parsedProperty.address} />
          </div>
          <div className='right-side'>
            <div className='header'>
              <div className='header-left'>
                <Avatar image={parsedProperty.avatar} />
                <div className='tenant-name-wrapper'>
                  <Typography variant='body3' className='tenant-name'>
                    {`${parsedProperty.propertyOwnerName}`}
                  </Typography>
                  <img src={verified} alt='Verified indicator' />
                </div>
              </div>
              <div>
                <Typography variant='body6' className='match-rate'>
                  Match rate
                </Typography>
                <Typography variant='body4' className='percentage'>
                  {parsedProperty.percentage}%
                </Typography>
              </div>
            </div>
            <div className='about-section'>
              <Typography variant='body4' className='title'>
                About landlord
              </Typography>
              <Typography variant='body4' className='description'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </div>
            <div className='line'></div>
            <div className='section'>
              <div>
                <Typography variant='body4' className='asking-price'>
                  Asking price (per month):
                </Typography>
                <Typography variant='body2' className='price'>
                  {parsedProperty.rentingPrice}
                </Typography>
              </div>
              <div className='section-details'>
                <div className='detail'>
                  <Icon icon='wallet' size={24} />
                  <Typography variant='body4' className='detail-name'>
                    Deposit:
                  </Typography>
                  <Typography variant='body4' className='detail-value'>
                    £3,500.00 (1 month)
                  </Typography>
                </div>
                <div className='detail'>
                  <Icon icon='wallet' size={24} />
                  <Typography variant='body4' className='detail-name'>
                    Council tax band:
                  </Typography>
                  <Typography variant='body4' className='detail-value'>
                    Ask landlord
                  </Typography>
                </div>
                <div className='detail'>
                  <Icon icon='wallet' size={24} />
                  <Typography variant='body4' className='detail-name'>
                    Minimum rent period:
                  </Typography>
                  <Typography variant='body4' className='detail-value'>
                    1 year
                  </Typography>
                </div>
              </div>
            </div>
            <div className='line'></div>
            {!awaitingMatch && (
              <div className='action-buttons'>
                <Label variant='secondary' size='large' onClick={dislikeProperty}>
                  <Icon icon='dislike' size={24} />
                  {propertyMatch.matched ? 'Unmatch' : 'Dismiss'}
                </Label>
                {propertyMatch.matched ? (
                  <Label variant='special' size='large' className='message-button' onClick={chatWith}>
                    <Icon icon='email' size={24} />
                    Message
                  </Label>
                ) : (
                  <Label
                    variant='special'
                    size='large'
                    className='match-button'
                    onClick={likeProperty}
                    disabled={disableLikeProperty}>
                    <Icon icon='like' size={24} />
                    Match
                  </Label>
                )}
              </div>
            )}
            {awaitingMatch && (
              <Label variant='secondary' className='cancel-request' onClick={dislikeProperty} size='large'>
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
  &.view-property-modal {
    width: 100vw;
    height: 100vh;

    position: relative;
    overflow: hidden;
    overflow-y: auto;
    max-height: 100vh;
    max-width: 100vw;

    border-radius: 0;

    .modal-container {
      padding: 0 !important;
      display: grid;
      grid-template-rows: min-content min-content auto;

      .modal-header {
        display: flex;
        width: 100%;
        padding: 24px 36px;
        box-sizing: border-box;
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
        background-color: #fff;

        .line {
          background-color: #e7e7e7;
          height: 1px;
        }

        .left-side {
          display: grid;
          gap: 40px;

          .details-section {
            display: grid;
            box-sizing: border-box;
            gap: 24px;

            .description-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 24px;

              .title {
                color: #0d2a38;
                font-weight: 900;
              }
            }
            .detail {
              color: #184d6d;
              display: flex;
              gap: 4px;

              .detail-value {
                font-size: 18px;
                font-weight: 900;
              }
            }

            .property-details {
              display: flex;
              align-items: center;
              gap: 8px;

              .dot {
                color: #a7a7a7;
                font-size: 16px;
                font-weight: 700;
                opacity: 0.4;
              }
            }
          }

          .property-description {
            display: grid;
            gap: 16px;

            .label {
              color: #0d2a38;
              font-size: 18px;
              font-weight: 900;
            }

            .description {
              font-weight: 500;
            }
          }

          .view-property-map {
            height: 480px;
            border-radius: 16px;
            overflow: hidden;
          }

          .facilities-wrapper {
            display: grid;
            gap: 16px;

            .label {
              color: #0d2a38;
              font-size: 18px;
              font-weight: 900;
            }

            .description {
              font-weight: 500;
            }

            .facilities {
              width: 100%;
              display: grid;
              grid-template-columns: 1fr 1fr;
              justify-content: space-between;
              gap: 8px;
            }
          }
        }
        .right-side {
          display: grid;
          height: min-content;
          padding: 24px;
          align-content: flex-start;
          row-gap: 24px;
          background-color: #f3f4f5;
          border-radius: 16px;

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

          .section {
            display: grid;
            gap: 16px;

            .asking-price {
              color: #0d2a38;
              font-weight: 700;
            }

            .price {
              color: #184d6d;
              font-weight: 900;
              line-height: 48px;
              font-family: Roobert, serif;
            }

            .section-details {
              display: grid;
              gap: 8px;

              .detail {
                display: flex;
                align-items: center;
                gap: 8px;
              }

              .detail-name {
                color: #0d2a38;
                font-weight: 500;
              }

              .detail-value {
                color: #0d2a38;
                font-weight: 700;
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
