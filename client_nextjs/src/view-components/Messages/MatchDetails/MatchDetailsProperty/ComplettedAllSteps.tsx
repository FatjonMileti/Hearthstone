import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Icon, Label, Typography } from '../../../../components';

interface CompletedAllStepsProps extends HTMLAttributes<HTMLDivElement> {
  seePropertyDetails: () => void;
}

export const CompletedAllSteps = styled(({ className, seePropertyDetails }: CompletedAllStepsProps) => {
  return (
    <div className={`offer-section-wrapper ${className}`}>
      <div className='offer-section'>
        <div className='section-title'>
          <Icon icon='tick' size={24} />
          <Typography variant='body4' className='title'>
            Amazing!
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          You completed all steps and the property details was added to your account. You can find all the
          details under the “Properties” tab.
        </Typography>
      </div>
      <Label size='large' variant='secondary' onClick={() => seePropertyDetails()}>
        See property details
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
