import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Icon } from './Icon';

interface MatchesIconProps extends HTMLAttributes<HTMLDivElement> {
  actioned?: boolean;
  counter?: number;
}
export const MatchesIcon = styled(({ className, actioned = false, counter, ...rest }: MatchesIconProps) => {
  return (
    <div
      className={classNames('matches-icon', className, {
        actioned,
        counter
      })}
      {...rest}>
      <Icon icon='like' />
      {counter && <div className='counter'>{counter}</div>}
    </div>
  );
})`
  &.matches-icon {
    position: relative;
    height: 56px;
    width: 56px;
    border-radius: 50%;
    display: grid;
    align-items: center;
    justify-content: center;
    border: 2px solid #eee0d3;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .icon {
      width: 24px !important;
      height: 24px !important;
      color: #c4b1a3;
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
      background-color: #eee0d3;
      .icon {
        color: #184d6d;
      }
    }

    &.actioned {
      border-color: #0d2a38;
      background-color: white;

      .icon {
        color: #0d2a38;
      }

      &:hover {
        background-color: #eee0d3;
        border-color: #eee0d3;
        .icon {
          color: #184d6d;
        }
      }
    }
  }
`;
