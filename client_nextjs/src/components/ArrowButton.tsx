import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Icon } from './Icon';
import classNames from 'classnames';

export interface ArrowButtonProps extends HTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  direction?: 'left' | 'right';
  inverted?: boolean;
  hero?: boolean;
}
export const ArrowButton = styled(
  ({
    children,
    className,
    size = 'medium',
    direction = 'left',
    inverted = false,
    hero = false,
    ...rest
  }: ArrowButtonProps) => {
    return (
      <button
        type='button'
        className={classNames('arrow-button', className, `size-${size}`, { inverted, hero })}
        {...rest}>
        <Icon icon={`arrow-${direction}`} />
      </button>
    );
  }
)`
  &.arrow-button {
    background-color: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;

    display: grid;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    &:hover {
      background-color: #f3f4f5;
      border: 1px solid #f3f4f5;
    }

    .icon {
      color: #000000;
      width: 30px !important;
      height: 30px !important;
    }

    &.inverted {
      border: 1px solid #fff;
      background-color: transparent;
      &:hover {
        background-color: white;
        border: 1px solid white;
      }
    }

    &.hero {
      border: none;
      background-color: transparent;
      &:hover {
        border: 1px solid #0d2a38;
      }
    }

    &.size-small {
      height: 44px;
      width: 44px;
      .icon {
        width: 22px !important;
        height: 22px !important;
      }
    }

    &.size-medium {
      height: 64px;
      width: 64px;
    }

    &.size-large {
      height: 72px;
      width: 72px;
    }

    &.inverted {
    }
  }
`;
