import { styled } from '@mui/system';
import { Label } from '../../../components/Label';
import { Icon } from '../../../components/Icon';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Typography } from '../../../components/Typography';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import { useSuggestedTenants } from '../../Suggestions/SugestionsTenants/useSuggestedTenants';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';

interface TenantsReviewHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const TenantsReviewHeader = styled(({ className }: TenantsReviewHeaderProps) => {
  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });
  const navigate = useNavigate();

  return (
    <div className={classNames(className, 'review-header')}>
      <div className='review-header-left-content'>
        <div className='properties-thumbnail-wrapper'>
          {suggestedTenants.isFetching && (
            <>
              <Skeleton variant='circular' width={36} height={36} className='property-image' />
              <Skeleton variant='circular' width={36} height={36} className='property-image' />
            </>
          )}
          {suggestedTenants?.data.slice(0, 2).map((st, stIndex) => {
            return (
              <div
                key={stIndex}
                className='property-image'
                style={{ backgroundImage: `url(${getAvatarFormIndex(st.criteria.avatar)})` }}></div>
            );
          })}
          {!suggestedTenants.isFetching && suggestedTenants?.data?.length > 2 && (
            <div className='property-image last'>
              <Typography variant='body5'>+{suggestedTenants?.data?.length - 2}</Typography>
            </div>
          )}
        </div>
        {suggestedTenants.isFetching ? (
          <Skeleton height={16} width={173} animation='wave' variant='rectangular' />
        ) : (
          <Typography variant='body6'>
            We’ve found {suggestedTenants?.data?.length} tenants matches
          </Typography>
        )}
      </div>
      <Label onClick={() => navigate('/')}>
        <Icon icon='eye-line' />
        Review
      </Label>
    </div>
  );
})`
  &.review-header {
    background: #fff;
    /* Card Shadow */
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 32px;
    padding: 8px 12px;

    display: flex;
    justify-content: space-between;
    column-gap: 16px;

    font-weight: 500;

    .review-header-left-content {
      display: flex;
      align-items: center;
      column-gap: 8px;

      .properties-thumbnail-wrapper {
        display: flex;

        .property-image {
          width: 36px;
          height: 36px;
          background-size: cover;
          border-radius: 50%;
          background-position: center;

          :not(:first-of-type) {
            margin-left: -8px;
          }

          &.last {
            background-color: #c0daff;
            color: #184d6d;
            display: grid;
            align-items: center;
            justify-content: center;
            font-weight: 500;
          }
        }
      }
    }
  }
`;
