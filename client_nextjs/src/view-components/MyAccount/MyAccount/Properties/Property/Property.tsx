import { styled } from '@mui/system';
import { HTMLProps, MouseEventHandler } from 'react';
import classNames from 'classnames';

import { Typography } from '../../../../../components';
import { Button } from '../../../../../components';
import { Icon } from '../../../../../components';

import { getAvatarFormIndex } from '../../../../HomeLoggedIn/avatars';
import { Slider } from '../../../../Properties/Property/Slider';

import { AreaUnitType } from '../../../../Properties/NewProperty/property.types';
import { useSuggestedTenants } from '../../../../Suggestions/SugestionsTenants/useSuggestedTenants';
import { Skeleton } from '@mui/material';
import { useNavigate } from '../../../../../compat/router';

export interface PropertyProps extends HTMLProps<HTMLDivElement> {
  propertyId: string;
  name: string;
  status: string;
  viewDetails: MouseEventHandler;
  images: any[];
  description: string;
  location: string;
  area: number;
  areaUnit: AreaUnitType;
  budget: {
    min_budget: number;
    max_budget: number;
  };
  roomsDetails: {
    number_of_bedrooms: number;
    number_of_bathrooms: number;
  };
  propertyType: string;
  parkingSpot: number;
  epcRating: string;
}

const propertyStatusMap: any = {
  Draft: 'Draft',
  Live: 'Published',
  Completed: 'Rented',
  Let: 'Rented'
};

export const Property = styled(
  ({
    className,
    name,
    status,
    viewDetails,
    images,
    description,
    location,
    area,
    areaUnit,
    budget,
    roomsDetails,
    propertyType,
    parkingSpot,
    epcRating,
    propertyId
  }: PropertyProps) => {
    const potentialMatches = useSuggestedTenants({
      params: {
        disliked: false,
        chosen: false,
        propertyId
      },
      options: {
        refetchOnMount: true
      }
    });

    const navigate = useNavigate();

    return (
      <div className={classNames('property', className)}>
        <Slider images={images} />
        <div className='details'>
          <div className='description-header'>
            <Typography variant='body6' className={classNames(`status`, {published: propertyStatusMap[status] === propertyStatusMap.Live})}>
              {propertyStatusMap[status] || status}
            </Typography>

            <div className='potential-matches'>
              {!(!potentialMatches.isFetching && potentialMatches?.data?.length === 0) && (
                <Typography className='title' variant='body5'>
                  Potential matches
                </Typography>
              )}

              <div className='potential-matches-list'>
                {potentialMatches.isFetching && (
                  <>
                    <Skeleton variant='circular' width={40} height={40} className='tenant-image' />
                    <Skeleton variant='circular' width={40} height={40} className='tenant-image' />
                    <Skeleton variant='circular' width={40} height={40} className='tenant-image' />
                    <Skeleton variant='circular' width={40} height={40} className='tenant-image' />
                  </>
                )}
                {!potentialMatches.isFetching &&
                  potentialMatches?.data.slice(0, 3).map((st, stIndex) => {
                    return (
                      <div
                        onClick={() => navigate('/')}
                        key={stIndex}
                        className='tenant-image '
                        style={{ backgroundImage: `url(${getAvatarFormIndex(st.criteria.avatar)})` }}
                      />
                    );
                  })}
                {!potentialMatches.isFetching && potentialMatches?.data?.length > 3 && (
                  <div className='tenant-image last'>
                    <Typography variant='body6'>+{potentialMatches?.data?.length - 3}</Typography>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='content'>
            <div className='title-property-details'>
              {name && (
                <Typography className='property-title' variant='body4'>
                  {name}
                </Typography>
              )}
              <div className='property-details'>
                {location && (
                  <>
                    <div className='detail'>
                      <Icon icon='location' /> <Typography variant='body5'>{location}</Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}

                {budget && (
                  <>
                    <div className='detail'>
                      <Icon icon='banknote' />{' '}
                      <Typography variant='body5'>
                        £ {budget.min_budget} / {budget.max_budget} PCM
                      </Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}

                {area && (
                  <>
                    <div className='detail'>
                      <Icon icon='ruler' />{' '}
                      <Typography variant='body5'>
                        {area} {areaUnit}{' '}
                      </Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}
                {roomsDetails?.number_of_bedrooms && (
                  <>
                    <div className='detail'>
                      <Icon icon='double-bed' />
                      <Typography variant='body5'>{roomsDetails.number_of_bedrooms}</Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}
                {roomsDetails?.number_of_bathrooms && (
                  <>
                    <div className='detail'>
                      <Icon icon='bathtub' />{' '}
                      <Typography variant='body5'>{roomsDetails.number_of_bathrooms}</Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}
                {propertyType && (
                  <>
                    <div className='detail'>
                      <Icon icon='building' /> <Typography variant='body5'>{propertyType}</Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}
                {parkingSpot && (
                  <>
                    <div className='detail'>
                      <Icon icon='car' /> <Typography variant='body5'>{parkingSpot} Parking Spot</Typography>
                    </div>
                    <Typography variant='body4' className='dot'>
                      •
                    </Typography>
                  </>
                )}
                {epcRating && (
                  <div className='detail'>
                    <Icon icon='temperature' />{' '}
                    <Typography variant='body5'>EPC Rating: {epcRating}*</Typography>
                  </div>
                )}
              </div>
            </div>

            {description && <Typography variant='body4'>{description}</Typography>}
          </div>

          <Button size='large' variant='secondary' onClick={viewDetails}>
            Edit property
          </Button>
        </div>
      </div>
    );
  }
)`
  &.property {
    display: grid;
    grid-template-columns: min-content auto;
    column-gap: 24px;
    position: relative;

    .slider {
      min-width: 440px;
    }

    .details {
      display: grid;
      grid-template-rows: min-content auto min-content;
      align-items: flex-start;
      row-gap: 24px;

      .description-header {
        display: flex;
        justify-content: space-between;
        align-content: center;
        gap: 24px;

        .status {
          padding: 12px;
          background-color: #408140;
          border-radius: 20px;
          color: white;
          font-weight: 700;
        }
          
          .published {
              background: #E5155A;
          }
          
        .potential-matches-list {
          display: flex;

          .tenant-image {
            width: 40px;
            height: 40px;
            background-size: cover;
            border-radius: 50%;
            background-position: center;
            z-index: 1;
            cursor: pointer;

            :not(:first-of-type) {
              margin-left: -8px;
            }

            &.last {
              color: #0d2a38;
              display: grid;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              background-color: #f7f1e7;
              z-index: 0;
            }
          }
        }

        .potential-matches {
          display: flex;
          align-items: center;
          gap: 16px;

          .title {
            color: #646464;
            line-height: 16px;
            font-weight: 500;
          }
        }
      }

      .content {
        display: grid;
        row-gap: 16px;

        .title-property-details {
          display: grid;
          row-gap: 8px;

          .property-title {
            font-size: 20px;
            line-height: 28px;
            font-weight: 700;
          }

          .property-details {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            .dot {
              color: #a7a7a7;
              font-weight: 700;
              opacity: 0.4;
            }

            .detail {
              display: flex;
              column-gap: 4px;
              align-items: center;
              color: #646464;
              .typography {
                font-weight: 700;
              }
            }
          }
        }
      }
    }
  }
`;
