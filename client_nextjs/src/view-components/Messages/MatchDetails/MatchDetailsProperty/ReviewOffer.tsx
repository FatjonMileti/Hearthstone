import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Icon, Label, Typography } from '../../../../components';

interface ReviewOfferProps extends HTMLAttributes<HTMLDivElement> {
  setReviewOfferModalVisibility: (b: boolean) => void;
}

export const ReviewOffer = styled(({ className, setReviewOfferModalVisibility }: ReviewOfferProps) => {
  return (
    <div className={`offer-section-wrapper ${className}`}>
      <div className='offer-section'>
        <div className='section-title'>
          <Icon icon='fast-message' size={24} />
          <Typography variant='body4' className='title'>
            Your offer was sent
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          Your offer was sent to your match for review. If the match rejects your offer you can make another
          offer and if the match accepts the offer then you will be able to sign the final documents.
        </Typography>
      </div>
      <Label size='large' onClick={() => setReviewOfferModalVisibility(true)}>
        View offer details
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
`;
