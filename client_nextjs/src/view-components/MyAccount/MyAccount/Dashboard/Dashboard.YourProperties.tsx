import { styled } from '@mui/system';
import { Typography } from '../../../components/Typography';
import { YourProperty } from '../../PagesComponents/YourProperty';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { EditPropertyModal } from '../../Properties/NewProperty/EditPropertyModal';
import { Icon } from '../../../components/Icon';
import { usePropertyDetailsHook } from '../../HomeLoggedIn/hooks/usePropertyDetails.hook';
import { ShowGlobalLoading } from '../../../components/ShowGlobalLoading';

export const DashboardYourProperties = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [showEditProperty, setShowEditProperty] = React.useState<string | undefined>(undefined);

  const propertiesQuery = usePropertyDetailsHook();

  return (
    <>
      <div className={classNames('your-properties', className)}>
        {propertiesQuery.isFetching && <ShowGlobalLoading />}
        <Typography className='title' variant='body4'>
          Your properties
        </Typography>

        {!propertiesQuery.isFetching && propertiesQuery.data?.property && propertiesQuery.data?.details && (
          <div className='property-and-statistics-wrapper'>
            <YourProperty
              title={propertiesQuery?.data?.property?.title}
              price={`£${propertiesQuery?.data?.property.budget.min_budget} - £${propertiesQuery?.data?.property.budget.max_budget}`}
              bathrooms={propertiesQuery?.data?.property?.room_details?.number_of_bathrooms}
              bedrooms={propertiesQuery?.data?.property?.room_details?.number_of_bedrooms}
              status={propertiesQuery?.data?.property?.status_string}
              image={propertiesQuery?.data?.property?.property_images?.[0]?.link}
              editProperty={() => setShowEditProperty(propertiesQuery?.data?.property._id)}
            />

            <div className={classNames('dashboard-property-statistics')}>
              <div className='statistics-card'>
                <div className='card-label'>
                  <Icon icon='eye-line' size={24} />
                  <Typography variant='body6' className='title'>
                    Property views
                  </Typography>
                </div>
                <div className='content'>
                  <Typography variant='body2' className='number'>
                    {propertiesQuery.data?.details?.views}
                  </Typography>
                  <Typography variant='body5' className='progress'>
                    +3.5% since last week
                  </Typography>
                </div>
              </div>
              <div className='statistics-card'>
                <div className='card-label'>
                  <Icon icon='intersect' size={24} />
                  <Typography variant='body6' className='title'>
                    Potential matches
                  </Typography>
                </div>
                <div className='content'>
                  <Typography variant='body2' className='number'>
                    53
                  </Typography>
                  <Typography variant='body5' className='progress'>
                    +12.8% since last week
                  </Typography>
                </div>
              </div>
              <div className='statistics-card'>
                <div className='card-label'>
                  <Icon icon='dashboard' size={24} />
                  <Typography variant='body6' className='title'>
                    Property score
                  </Typography>
                </div>
                <div className='content'>
                  <Typography variant='body2' className='number'>
                    {!propertiesQuery.data?.details?.property_score
                      ? 0
                      : propertiesQuery.data?.details.property_score}
                    /100
                  </Typography>
                  <Typography variant='body5' className='points-available'>
                    +5 points available
                  </Typography>
                </div>
              </div>

              <div className='statistics-card'>
                <div className='card-label'>
                  <Icon icon='pound-coin' size={24} />
                  <Typography variant='body6' className='title'>
                    Price
                  </Typography>
                </div>
                <div className='content'>
                  <div className='price'>
                    <Typography variant='body2' className='number'>
                      {`£${propertiesQuery?.data?.property.budget.min_budget} - £${propertiesQuery?.data?.property.budget.max_budget}`}
                    </Typography>

                    <Typography variant='body6'>/month</Typography>
                  </div>
                  <Typography variant='body5' className='market-average'>
                    Market average
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditProperty && (
        <EditPropertyModal
          propertyId={showEditProperty}
          showStore={[!!showEditProperty, () => setShowEditProperty(undefined)]}
          afterSaveAsDraft={() => {
            setShowEditProperty(undefined);
            propertiesQuery.refetch();
          }}
          afterDelete={() => propertiesQuery.refetch()}
          onBack={() => setShowEditProperty(undefined)}
          afterStartMatching={() => {
            setShowEditProperty(undefined);
            propertiesQuery.refetch();
          }}
        />
      )}
    </>
  );
})`
  &.your-properties {
    display: grid;
    row-gap: 16px;
    grid-template-rows: min-content auto;

    .title {
      font-size: 18px;
      font-weight: 700;
    }

    .property-and-statistics-wrapper {
      display: grid;
      grid-template-columns: max-content auto;
      column-gap: 24px;

      .dashboard-property-statistics {
        display: grid;
        gap: 24px;
        grid-template-columns: 1fr 1fr;

        .statistics-card {
          display: grid;
          padding: 16px;
          border-radius: 12px;
          background: #f3f4f5;
          gap: 24px;
          min-height: 144px;
          box-sizing: border-box;

          .card-label {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #a7a7a7;

            .title {
              font-size: 14px;
              font-weight: 600;
            }
          }
          .content {
            display: grid;
            gap: 4px;
            font-weight: 700;
            align-content: flex-start;

            .number {
              font-family: Roobert, serif;
              font-weight: 700;
            }
            .progress {
              color: #408140;
            }
            .price {
              display: flex;
              align-items: flex-end;
              gap: 4px;
              flex-wrap: wrap;
            }

            .points-available {
              color: #c4b1a3;
            }

            .market-average {
              color: #646464;
            }
          }
        }
      }
    }
  }
`;
