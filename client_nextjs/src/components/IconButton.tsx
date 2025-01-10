import React from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  inverted?: boolean;
  noBackground?: boolean;
}

export const IconButton = styled(
  ({
    className,
    children,
    size = 'medium',
    type = 'button',
    inverted = false,
    noBackground = false,
    ...rest
  }: IconButtonProps) => {
    return (
      <button
        type={type}
        className={classNames('icon-button', className, `size-${size}`, {
          inverted,
          'no-background': noBackground
        })}
        {...rest}>
        {children}
      </button>
    );
  }
)`
  &.icon-button {
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f5;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    height: fit-content;

    &.no-background {
      background: none;
    }

    color: #0d2a38;

    > * {
      color: inherit;
    }

    &.inverted {
      background-color: #184d6d;
      &:hover {
        color: #0d2a38;
        background-color: #ffffff;
      }

      color: #ffffff;
    }

    &:hover {
      background-color: #c0daff;
    }

    &.no-background {
      background: none;
      &:hover {
        background-color: #e7e7e7;
      }
    }

    &.size-small {
      padding: 6px;
    }

    &.size-medium {
      padding: 12px;
    }

    &.size-large {
      padding: 18px;
    }
  }
`;
