import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import valpal from './valpal.png';
import backgroundImage from './valpal-background.jpeg';
import backgroundColor from './valpal-background-color.jpeg';
import { Typography } from '../../../components/Typography.tsx';
import { Icon } from '../../../components/Icon.tsx';
import { Label } from '../../../components/Label.tsx';

export const ValpalSection = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames('valpal-section', className)}>
      <div className='wrapper'>
        <div className='content'>
          <img src={valpal} alt='valpal-logo' className='valpal-logo' />
          <div className='description-wrapper'>
            <Typography variant='body3' className='title'>
              Get the best price for your property
            </Typography>
            <Typography variant='body4' className='description'>
              Add your property and use ValPal to get a proper valuation of your property. This will increase
              your chances of finding a perfect tenant match.
            </Typography>
          </div>
        </div>
        <div className='buttons'>
          <Label variant='primary' size='large'>
            <Icon icon='plus' size={24} /> Add property
          </Label>
          <Label variant='secondary' size='large'>
            Get free valuation
          </Label>
        </div>
      </div>
    </div>
  );
})`
  &.valpal-section {
    display: grid;
    padding: 48px 36px 48px 36px;

    .wrapper {
      position: relative;
      box-sizing: border-box;
      display: grid;
      padding: 48px;
      gap: 40px;
      border-radius: 16px;
      justify-content: center;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url(${backgroundColor});
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        border-radius: 16px;
        mix-blend-mode: color-burn;
        z-index: -2;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url(${backgroundImage});
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        border-radius: 16px;
        opacity: 0.4;
        mix-blend-mode: color-burn;
        top: -334px;
        z-index: -1;
      }

      .content {
        display: grid;
        max-width: 440px;
        gap: 16px;
        height: 100%;
        justify-items: center;

        .valpal-logo {
          width: 128px;
          height: 48px;
        }
        .description-wrapper {
          display: grid;
          gap: 8px;

          .title {
            font-weight: 700;
              text-align: center;
          }
          .description {
            font-weight: 500;
            text-align: center;
          }
        }
      }
      .buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }
    }
  }
`;
