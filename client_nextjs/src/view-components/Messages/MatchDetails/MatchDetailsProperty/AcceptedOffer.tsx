import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Icon, Label, Typography } from '../../../../components';

interface AcceptedOfferProps extends HTMLAttributes<HTMLDivElement> {}

export const AcceptedOffer = styled(({ className }: AcceptedOfferProps) => {
  return (
    <div className={`offer-section-wrapper ${className}`}>
      <div className='offer-section'>
        <div className='section-title'>
          <Icon icon='tick' size={24} />
          <Typography variant='body4' className='title'>
            Awesome news!
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          Your match accepted your offer. Complete the steps below to close the deal.
        </Typography>
      </div>
    </div>
  );
})`
  &.offer-section-wrapper {
    .offer-section {
      display: grid;
      gap: 16px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .title {
          font-size: 18px;
          font-weight: 900;
          color: #0d2a38;
        }
      }

      .description {
        color: #0d2a38;
        font-weight: 500;
      }
    }
`;
