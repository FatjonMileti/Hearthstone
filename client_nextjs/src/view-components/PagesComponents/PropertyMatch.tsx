import { styled } from '@mui/system';
import { Typography } from '../../components/Typography';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

interface PropertyMatchProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  viewProperty?: () => void;
  image: string;
  address: string;
  price: string;
}
export const PropertyMatch = styled(
  ({ className, title, address, price, image, viewProperty }: PropertyMatchProps) => {
    return (
      <div className={classNames(className, 'match-property')}>
        {!image && (
          <div className='no-images'>
            <Icon icon='image' size={128} />
          </div>
        )}
        <div className='property-footer'>
          <Typography className='property-title' variant='body4'>
            {title}
          </Typography>
          <div className='details'>
            <div className='match-percentage'>
              <div className='detail'>
                <Icon icon='location' />
                <Typography variant='body5'>{address}</Typography>
              </div>
              <div className='detail'>
                <Icon icon='banknote' />
                <Typography variant='body5'>£{price} PCM</Typography>
              </div>
            </div>
            <Button
              size='small'
              variant='secondary'
              inverted
              className='details-button'
              onClick={viewProperty}>
              View property
            </Button>
          </div>
        </div>
      </div>
    );
  }
)`
  &.match-property {
    background-image: url('${(props) => props.image}');
    border-radius: 12px;
    display: flex;
    aspect-ratio: 1.34 / 1;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 100%;
    position: relative;

    .no-images {
      display: grid;
      justify-content: center;
      color: #a7a7a7;
      background-color: #faf5f5;
      position: absolute;
      inset: 0;
      justify-items: center;
      align-content: center;
      border-top-right-radius: 12px;
      border-top-left-radius: 12px;
      z-index: -1;
    }

    .property-footer {
      background: linear-gradient(180deg, rgba(38, 38, 38, 0) 0%, rgba(38, 38, 38, 0.8) 43.75%);
      align-self: flex-end;
      width: 100%;
      border-radius: 0 0 12px 12px;
      padding: 16px;
      box-sizing: border-box;
      row-gap: 8px;
      display: flex;
      flex-direction: column;

      .property-title {
        color: white;
        font-weight: 700;
      }

      .details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        column-gap: 16px;
        .match-percentage {
          color: white;
          font-weight: 700;
          display: flex;
          column-gap: 24px;
          align-items: center;

          .detail {
            display: flex;
            column-gap: 4px;
            align-items: center;
          }
        }
        .details-button {
          padding: 12px 20px;
          font-size: 14px;
          line-height: 20px;
          flex-shrink: 0;
        }
      }
    }
  }
`;
