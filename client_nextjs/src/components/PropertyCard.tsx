import { HTMLMotionProps, motion } from 'framer-motion';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Typography } from './Typography';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Label } from './Label';
import { avatars } from '../pages/HomeLoggedIn/avatars';

export interface PropertyCardProps extends HTMLMotionProps<'div'> {
  name: string;
  inView: boolean;
  inDemand?: boolean;
  avatar: string;
  percentage?: string;
  onViewPropertyClick?: () => void;
  chatWith?: () => void;
  size?: 'medium' | 'large';
  matched?: boolean;
  awaitingMatch?: boolean;
  property: any;
  image: string;
}

export const PropertyCard = styled(
  ({
    className,
    size = 'medium',
    name,
    inView,
    inDemand = false,
    avatar,
    percentage,
    matched = false,
    awaitingMatch = false,
    onViewPropertyClick = () => {},
    chatWith = () => {},
    property,
    image,
    ...rest
  }: PropertyCardProps) => {
    const active = inView;

    const deleted = !property;

    let parsedProperty: any = {};

    if (!deleted) {
      parsedProperty.avatar = !isNaN(parseInt(property.created_by.avatar || ''))
        ? avatars[parseInt(property.created_by.avatar || '')]?.image
        : '';

      parsedProperty.title = property.title;

      parsedProperty.image = property?.property_images?.[0]?.link || '';

      parsedProperty.propertyOwnerName = `${property.created_by.first_name} ${property.created_by.last_name}`;

      parsedProperty.areaOfInterest = property.area_of_interest;

      parsedProperty.numberOfBedrooms = property?.room_details?.number_of_bedrooms;

      parsedProperty.numberOfBathrooms = property?.room_details?.number_of_bathrooms;

      parsedProperty.rentingPrice = `£${property.budget.min_budget} - £${property.budget.max_budget}`;

      parsedProperty.percentage = property?.percentage;
    }

    return (
      <motion.div
        className={classNames('property-card', className, `size-${size}`, {
          active,
          inView,
          inDemand,
          matched
        })}
        {...rest}>
        {deleted && (
          <div className='not-available'>
            <Typography>Not available!</Typography>
          </div>
        )}
        {!deleted && (
          <>
            <div className='slide-header'>
              <div className='header-left-content'>
                <Avatar image={parsedProperty.avatar} />
                <div>
                  <Typography variant='body5'>{parsedProperty.propertyOwnerName}</Typography>
                  <Typography variant='body5'>{property.percentage}% Match rate</Typography>
                </div>
              </div>
              {awaitingMatch && (
                <div className='awaiting-match'>
                  <Icon icon='watch' />
                  <Typography className='awaiting-match-text' variant='body6'>
                    Awaiting match
                  </Typography>
                </div>
              )}
              {matched && (
                <div className='matched-indicator'>
                  <Icon icon='like' />
                  <Typography className='matched-indicator-text' variant='body6'>
                    Matched
                  </Typography>
                </div>
              )}
            </div>
            {image === '' && (
              <div className='no-images'>
                <Icon icon='image' size={128} />
              </div>
            )}
            <div className='slide-footer'>
              <div className='left-part'>
                <Typography className='property-name'>{parsedProperty.title}</Typography>
                <div className='property-details'>
                  <div className='detail'>
                    <Icon icon='location' />
                    <Typography variant='body5'>{parsedProperty.areaOfInterest}</Typography>
                  </div>
                  <span className='dot'>•</span>
                  <div className='detail'>
                    <Icon icon='banknote' />
                    <Typography variant='body5'>{parsedProperty.rentingPrice} PCM</Typography>
                  </div>
                  <span className='dot'>•</span>
                  <div className='detail'>
                    <Icon icon='double-bed' />
                    <Typography variant='body5'>{parsedProperty.numberOfBedrooms}</Typography>
                  </div>
                  <span className='dot'>•</span>
                  <div className='detail'>
                    <Icon icon='bathtub' />
                    <Typography variant='body5'>{parsedProperty.numberOfBathrooms}</Typography>
                  </div>
                </div>
              </div>

              <div className='action-buttons'>
                <Label
                  className='view-property-button'
                  size='large'
                  variant='primary'
                  inverted
                  onClick={onViewPropertyClick}>
                  Property details
                </Label>

                {matched && (
                  <Label
                    className='view-property-button'
                    variant='primary'
                    inverted
                    size='medium'
                    onClick={chatWith}>
                    <Icon icon='email' />
                    Message
                  </Label>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  }
)`
  &.property-card {
    width: 760px;
    height: 513px;

    flex-shrink: 0;

    border-radius: 12px;

    background-image: url('${(props) => props.image}');
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: center;

    display: grid;
    align-content: space-between;
    overflow: hidden;
    position: relative;
    opacity: 0.2;

    transition: box-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, width 0.2s ease-in-out,
      height 0.2s ease-in-out;

    &.inView {
      width: 800px;
      height: 540px;

      opacity: 1;
      /* Card Shadow */
      box-shadow: 0 7.72px 23.16px 0 rgba(0, 0, 0, 0.25);
    }

    &.inDemand {
      box-shadow: 0 16px 32px 0 rgba(255, 142, 87, 0.5);
    }

    &.matched {
      border: 2px solid #e5155a;
      /* Match Shadow */
      box-shadow: 0px 16px 32px 0px rgba(229, 21, 90, 0.25);
    }

    .not-available {
      width: 100%;
      height: 100%;
      display: grid;
      align-items: center;
      justify-content: center;
      margin-top: 32px;

      .typography {
        color: gray;
      }
    }

    &.active {
      .slide-header,
      .slide-footer {
        visibility: visible;
      }
    }

    .slide-header {
      visibility: hidden;
      padding: 24px;
      background: linear-gradient(180deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0) 100%);
      display: flex;
      column-gap: 24px;
      align-items: center;
      justify-content: space-between;

      .header-left-content {
        display: flex;
        column-gap: 8px;
        align-items: center;

        .avatar {
          height: 44px;
          width: 44px;
        }

        .typography {
          color: white;
          font-weight: 700;
        }
      }

      .awaiting-match {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #a7a7a7;
        color: white;
        border-radius: 25px;
        transition: width 1s ease;

        .awaiting-match-text {
          font-weight: 700;
          margin-left: 4px;
        }
      }

      .matched-indicator {
        display: flex;
        column-gap: 4px;
        background-color: #e5155a;
        color: white;
        border-radius: 25px;
        align-items: center;
        padding: 12px;

        .icon {
          width: 20px !important;
          height: 20px !important;
        }

        .matched-indicator-text {
          font-weight: 700;
        }
      }
    }

    .no-images {
      display: grid;
      justify-content: center;
      color: #a7a7a7;
      background-color: #faf5f5;
      position: absolute;
      inset: 0;
      justify-items: center;
      align-content: center;
      z-index: -1;
    }

    .slide-footer {
      visibility: hidden;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(180deg, rgba(38, 38, 38, 0) 0%, rgba(38, 38, 38, 0.7) 43.75%);

      column-gap: 24px;

      .left-part {
        display: grid;
        row-gap: 10px;

        .property-name {
          font-family: Roobert, serif;
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: 24px;
          color: white;
        }

        .property-details {
          color: white;
          font-weight: 700;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;

          .dot {
            color: #a7a7a7;
          }

          .detail {
            display: flex;
            column-gap: 4px;
            align-items: center;

            .icon {
              height: 20px !important;
              width: 20px !important;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        column-gap: 16px;
      }
    }
  }
`;
