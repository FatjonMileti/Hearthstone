import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Icon } from '../../../../components/Icon';
import { Typography } from '../../../../components/Typography';
import { Label } from '../../../../components/Label';
import backgroundImage from './gradient .png';

export const ShareAndEarnSection = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const code: string = 'LF18249-UKND128';
  const CopyCode = () => navigator.clipboard.writeText(code);
  return (
    <div className={classNames('share-and-earn', className)}>
      <div className='wrapper'>
        <div className='content'>
          <Icon icon='add-mail' size={48} />
          <div className='description-wrapper'>
            <Typography variant='body3' className='title'>
              Help us grow and get rewarded!
            </Typography>
            <Typography variant='body4' className='description'>
              Spread the word and let your friends use your referral code and both of you will get 35% off of
              your next payment.
            </Typography>
          </div>
        </div>
        <div className='text-and-button-wrapper'>
          <Typography variant='body4' className='code'>
            {code}
          </Typography>
          <Label variant='primary' size='large' onClick={CopyCode}>
            <Icon icon='copy-document' size={24} /> Copy code
          </Label>
        </div>
      </div>
    </div>
  );
})`
  &.share-and-earn {
    display: grid;
    padding: 24px 36px 48px 36px;

    .wrapper {
      position: relative;
      box-sizing: border-box;
      display: grid;
      padding: 48px;
      gap: 40px;
      border-radius: 16px;
      justify-items: center;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(0deg, #b4263b 0%, #e5155a 100%) no-repeat;
        border-radius: 16px;
        z-index: -1;
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
        z-index: -1;
      }

      .content {
        display: grid;
        max-width: 440px;
        gap: 16px;
        justify-items: center;
        color: #fff;

        .description-wrapper {
          display: grid;
          gap: 8px;
          text-align: center;

          .title {
            font-weight: 900;
          }
          .description {
            font-weight: 500;
          }
        }
      }

      .text-and-button-wrapper {
        display: grid;
        grid-template-columns: max-content auto;
        padding: 8px 8px 8px 32px;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        border-radius: 36px;
        box-sizing: border-box;
        background-color: #fff;

        .code {
          color: #0d2a38;
          font-weight: 700;
        }
      }
    }
  }
`;
