import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Icon, Label, Typography } from '../../../../components';

interface MakeAnOfferProps extends HTMLAttributes<HTMLDivElement> {
  setOfferModalVisibility: (b: boolean) => void;
}

export const MakeAnOffer = styled(({ className, setOfferModalVisibility }: MakeAnOfferProps) => {
  return (
    <div className={`offer-section-wrapper ${className}`}>
      <div className='offer-section'>
        <div className='section-title'>
          <Icon icon='fast-message' size={24} />
          <Typography variant='body4' className='title'>
            Make an offer
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          You can chat with your match before and after you make an offer. Once accepted, the terms of the
          offer can’t be changed.
        </Typography>
      </div>
      <Label
        variant='special'
        size='large'
        className='offer-button'
        onClick={() => setOfferModalVisibility(true)}>
        Make an offer
      </Label>
    </div>
  );
})`
  &.offer-section-wrapper {
    display: grid;
    gap: 16px;

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

    .offer-button {
      width: 100%;
    }
  }
`;
