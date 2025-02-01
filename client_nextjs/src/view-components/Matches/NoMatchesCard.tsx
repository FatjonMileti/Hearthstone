import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import ForwardButton from './button-forward.png';
import { Label, Typography } from '../../components';

interface NoMatchesCardProps extends HTMLAttributes<HTMLDivElement> {
  onHandleClick: () => void;
}

export const NoMatchesCard = styled(({ className, onHandleClick }: NoMatchesCardProps) => {
  return (
    <div className={`no-matches-card ${className}`}>
      <img src={ForwardButton} alt='Forward' />
      <div className='content'>
        <Typography variant='body3' className='text title'>
          You don’t have any matches yet
        </Typography>
        <Typography variant='body4' className='text description'>
          Start matching and enter details for your search so our algorithms can return the best match for
          your needs. Whether you’re looking for a place to buy or rent or you’re a landlord, we’ll make sure
          to find you the best matches.
        </Typography>
      </div>
      <Label variant='special' size='large' onClick={onHandleClick}>
        Start matching
      </Label>
    </div>
  );
})`
  &.no-matches-card {
    position: relative;
    width: 100%;
    display: grid;
    gap: 24px;
    justify-items: center;
    align-content: flex-start;
    align-self: flex-start;

    .content {
      display: grid;
      gap: 16px;
      max-width: 440px;
      text-align: center;

      .text {
        color: #0d2a38;
      }

      .title {
        font-weight: 900;
      }

      .description {
        font-weight: 500;
      }
    }
  }
`;
