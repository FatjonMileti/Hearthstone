import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Icon } from './Icon';

export interface NotificationsIconProps extends HTMLAttributes<HTMLDivElement> {
  actioned?: boolean;
  counter?: number;
}
export const NotificationsIcon = styled(
  ({ className, actioned = false, counter, ...rest }: NotificationsIconProps) => {
    return (
      <div
        className={classNames('notifications-icon', className, {
          actioned,
          counter
        })}
        {...rest}>
        <Icon icon='bell'/>
        {counter && <div className='counter'>{counter}</div>}
      </div>
    );
  }
)`
  &.notifications-icon {
    position: relative;
    height: 48px;
    width: 48px;
    border-radius: 50%;
    display: grid;
    align-items: center;
    justify-content: center;
    outline: 1px solid #184d6d;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .icon {
      width: 24px;
      height: 24px;
      color: #184d6d;
    }

    .counter {
      width: 20px;
      height: 20px;
      display: grid;
      align-items: center;
      justify-content: center;
      background-color: #e5155a;
      border-radius: 50%;
      position: absolute;
      top: 0;
      right: 0;

      font-family: Roobert, serif;
      font-size: 10px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      color: #ffffff;
    }

    &:hover {
      outline-color: #184d6d;
    }

    &.actioned {
      border-color: #184d6d;
      background-color: white;

      .icon {
        color: #184d6d;
      }

      &:hover {
        background-color: #eee0d3;
        border-color:  #184d6d;
        .icon {
          color: #184d6d;
        }
      }
    }
  }
`;
