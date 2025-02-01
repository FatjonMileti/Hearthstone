import { styled } from '@mui/system';
import { Typography } from '../../components/Typography';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

interface YourPropertyProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  editProperty?: () => void;
  image: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  status: string;
}

export const YourProperty = styled(
  ({ className, title, image, bedrooms, bathrooms, price, status, editProperty }: YourPropertyProps) => {
    return (
      <div className={classNames(className, 'your-property')}>
        <div className='property-header'>
          <Typography variant='body6' className='status'>
            {status !== 'Live' ? status : 'Published'}
          </Typography>
        </div>
        {!image && (
          <div className='no-images'>
            <Icon icon='image' size={128} />
          </div>
        )}
        <div className='property-footer'>
          <div className='property-title-and-details'>
            <Typography className='property-title' variant='body4'>
              {title}
            </Typography>
            <div className='details'>
              <div className='detail'>
                <Typography variant='body5'>{price} PCM</Typography>
              </div>
              <Typography variant='body4' className='dot'>
                •
              </Typography>
              <div className='detail'>
                <Icon icon='double-bed' size={20} />
                <Typography variant='body5'>{bedrooms}</Typography>
              </div>
              <Typography variant='body4' className='dot'>
                •
              </Typography>
              <div className='detail'>
                <Icon icon='bathtub' size={20} />
                <Typography variant='body5'>{bathrooms}</Typography>
              </div>
            </div>
          </div>
          <Button size='small' variant='secondary' inverted className='details-button' onClick={editProperty}>
            Edit property
          </Button>
        </div>
      </div>
    );
  }
)`
  &.your-property {
    width: 440px;
    height: 312px;

    flex-shrink: 0;

    background-image: url('${(props) => props.image}');
    background-position-y: center;
    border-radius: 12px;

    display: grid;
    align-content: space-between;

    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 0px 7.72px 23.16px 0px rgba(0, 0, 0, 0.25);
    position: relative;

    .property-header {
      display: flex;
      padding: 16px;
      align-items: flex-start;
      gap: 8px;
      border-radius: 12px 12px 0 0;
      background: linear-gradient(180deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0) 100%);

      .status {
        padding: 12px;
        background-color: #408140;
        border-radius: 20px;
        color: white;
        font-weight: 700;
      }
    }

    .no-images {
      display: grid;
      justify-content: center;
      color: #a7a7a7;
      background-color: #faf5f5;
      position: absolute;
      inset: 0;
      justify-items: center;
      align-content: center;
      z-index: -1;
      border-top-right-radius: 12px;
      border-top-left-radius: 12px;
    }

    .property-footer {
      background: linear-gradient(180deg, rgba(38, 38, 38, 0) 0%, rgba(38, 38, 38, 0.8) 43.75%);
      width: 100%;
      border-radius: 0 0 12px 12px;
      padding: 16px;
      box-sizing: border-box;
      gap: 24px;
      display: flex;
      justify-content: space-between;

      .property-title-and-details {
        display: grid;
        gap: 4px;

        .property-title {
          color: #fff;
          font-weight: 700;
        }

        .details {
          color: white;
          font-weight: 700;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;

          .detail {
            display: flex;
            column-gap: 4px;
            align-items: center;
          }

          .dot {
            color: #a7a7a7;
            font-weight: 700;
            opacity: 0.4;
          }
        }
      }
      .details-button {
        padding: 16px 20px;
        font-size: 14px;
        line-height: 20px;
        flex-shrink: 0;
        height: 52px;
      }
    }
  }
`;
