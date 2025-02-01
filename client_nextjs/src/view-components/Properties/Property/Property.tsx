import { styled } from '@mui/system';
import { HTMLProps, MouseEventHandler } from 'react';
import classNames from 'classnames';

import { Typography, Icon, Label } from '../../../components/index.ts';

import axios from '../../../utils/axios.ts';
import { useUserStore } from '../../../globalState/user.tsx';

export interface PropertyProps extends HTMLProps<HTMLDivElement> {
  propertyId: string;
  name: string;
  status: string;
  viewDetails: MouseEventHandler;
  images: any[];
  location: string;
  budget: {
    min_budget: number;
    max_budget: number;
  };
  roomsDetails: {
    number_of_bedrooms: number;
    number_of_bathrooms: number;
  };
  afterPublish: any;
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
    location,
    budget,
    roomsDetails,
    propertyId,
    afterPublish
  }: PropertyProps) => {
    const { auth } = useUserStore();

    const startMatching = async () => {
      try {
        const payload: { status_string: string } = {
          status_string: 'Live'
        };
        await axios(auth.access_token).patch(`/api/asset/${propertyId}`, payload);
      } catch (err) {
        throw err;
      }
    };

    const onPublishPropertyClick = async () => {
      await startMatching();
      afterPublish();
    };

    return (
      <div className={classNames('property', className)}>
        <div className='property-image'>
          <Typography
            variant='body5'
            className={classNames('status', (propertyStatusMap[status] as string).toLowerCase())}>
            {propertyStatusMap[status] || status}
          </Typography>
        </div>
        <div className='content'>
          <div className='details-wrapper'>
            {name && (
              <Typography className='property-title' variant='body4'>
                {name}
              </Typography>
            )}
            <div className='details'>
              {location && (
                <>
                  <div className='detail'>
                    <Icon icon='location' size={20} />
                    <Typography variant='body5' className='detail-value'>
                      {location}
                    </Typography>
                  </div>
                  <Typography variant='body4' className='dot'>
                    •
                  </Typography>
                </>
              )}
              {budget && (
                <>
                  <div className='detail'>
                    <Typography variant='body5' className='detail-value'>
                      £ {budget.min_budget} / {budget.max_budget} PCM
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
                    <Typography variant='body5' className='detail-value'>
                      {roomsDetails.number_of_bedrooms}
                    </Typography>
                  </div>
                  <Typography variant='body4' className='dot'>
                    •
                  </Typography>
                </>
              )}
              {roomsDetails?.number_of_bathrooms && (
                <div className='detail'>
                  <Icon icon='bathtub' />{' '}
                  <Typography variant='body5' className='detail-value'>
                    {roomsDetails.number_of_bathrooms}
                  </Typography>
                </div>
              )}
            </div>
          </div>
          {propertyStatusMap[status] === 'Published' && (
            <div className='footer'>
              <Typography variant='body5' className='published'>
                Published on 16/06/2024
              </Typography>
              <Label variant='secondary' size='medium' onClick={viewDetails}>
                Property details
              </Label>
            </div>
          )}
          {propertyStatusMap[status] === 'Draft' && (
            <div className='action-buttons'>
              <Label variant='secondary' size='medium' onClick={viewDetails}>
                Edit property
              </Label>
              <Label
                variant='special'
                size='medium'
                className='publish-button'
                onClick={onPublishPropertyClick}>
                Publish property
              </Label>
            </div>
          )}
        </div>
      </div>
    );
  }
)`
  &.property {
    display: grid;
    position: relative;
    align-items: flex-start;
    border-radius: 16px;
    box-sizing: border-box;
    box-shadow: 0 4px 32px 0 rgba(13, 42, 56, 0.1);

    .property-image {
      background-image: url(${(props) => props.images?.[0]?.link});
      background-size: cover;
      background-repeat: no-repeat;
      aspect-ratio: 1.48 / 1;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      padding: 24px;

      .status {
        width: min-content;
        padding: 10px;
        border-radius: 8px;
        font-weight: 700;
        line-height: 24px;

        &.published {
          background-color: #E5155A;
            border-radius: 50px;
          color: #fff;
        }

        &.draft {
          background-color: #e7e7e7;
          color: #646464;
        }

        &.rented {
          background-color: #c0daff;
          color: #0d2a38;
        }
      }
    }

    .content {
      display: grid;
      align-items: flex-start;
      padding: 24px;
      row-gap: 24px;

      .details-wrapper {
        display: grid;
        gap: 8px;

        .property-title {
          color: #0d2a38;
          font-size: 20px;
          font-weight: 700;
          line-height: 28px;
        }

        .details {
          display: flex;
          align-items: center;
          gap: 8px;

          .detail {
            display: flex;
            align-items: center;
            gap: 4px;

            .detail-value {
              color: #0d2a38;
              font-weight: 700;
              line-height: 24px;
            }
          }
          .dot {
            color: #c4b1a3;
            font-weight: 700;
          }
        }
      }
      .footer {
        display: grid;
        //grid-template-columns: auto min-content;
        justify-content: space-between;
        align-items: center;
        gap: 16px;

        .published {
          color: #646464;
          font-weight: 500;
          line-height: 24px;
        }
      }

      .action-buttons {
        display: grid;
        grid-template-columns: min-content auto;
        align-items: center;
        gap: 16px;

        .publish-button {
          width: 100%;
        }
      }
    }
  }
`;
