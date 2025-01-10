import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

export interface LabelProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'special';
  special?: boolean;
  inverted?: boolean;
  disabled?: boolean;
}

export const Label = styled(
  ({
    className,
    active,
    size = 'medium',
    children,
    variant = 'primary',
    special = false,
    inverted = false,
    disabled = false,
    ...otherProps
  }: LabelProps) => {
    return (
      <div
        tabIndex={0}
        role='button'
        className={classNames(className, 'label', `size-${size}`, `variant-${variant}`, {
          active,
          inverted,
          disabled,
          special
        })}
        {...otherProps}>
        {children}
      </div>
    );
  }
)`
  &.label {
    padding: 12px 8px;
    box-sizing: border-box;
    border-radius: 250px;
    font-size: 16px;
    line-height: 24px;
    font-weight: 700;
    font-family: Roobert, serif;
    cursor: pointer;
    color: #184d6d;

    display: flex;
    align-items: center;
    column-gap: 8px;

    //width: min-content;
    width: max-content;

    justify-content: center;

    transition: all 0.2s ease-in-out;

    &.variant-primary {
      border: none;
      background: #184d6d;
      color: white;

      &:hover {
        border: none;
        color: white;
        background-color: #0d2a38;
      }

      &.disabled {
        background: #a7a7a7;
        color: white;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.inverted {
        background: #fff;
        color: #0d2a38;

        :hover {
          background: #fffbf3;
          color: #0d2a38;
        }

        &.disabled {
          background: #a7a7a7;
          color: white;
          cursor: not-allowed;
        }
      }

      &.size-small {
        padding: 8px 16px;
        font-size: 14px;
      }

      &.size-medium {
        padding: 12px 24px;
        font-size: 16px;
        line-height: 24px;
      }

      &.size-large {
        padding: 16px 32px;
        font-size: 16px;
        line-height: 24px;
        font-weight: 700;
      }
    }

    &.variant-secondary {
      outline: 1px solid #184d6d;
      height: fit-content;

      &:hover {
        color: #0d2a38;
        outline: 2px solid #0d2a38;
      }

      &.inverted {
        outline: 1px solid white;
        color: white;
        &:hover {
          color: #fffbf3;
          outline: 2px solid #fffbf3;
        }
      }

      &.disabled {
        outline-color: #a7a7a7;
        color: #a7a7a7;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.size-small {
        padding: 8px 16px;
        font-size: 14px;
      }

      &.size-medium {
        padding: 12px 24px;
        font-size: 16px;
        line-height: 24px;
      }

      &.size-large {
        padding: 16px 32px;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
      }
    }

    &.variant-special {
      color: white;
      background: #e5155a;
      font-weight: 700;
      line-height: 24px;

      &:hover {
        background: #b4263b;
      }

      &.size-small {
        padding: 8px 16px;
        font-size: 14px;
      }

      &.size-medium {
        padding: 12px 24px;
        font-size: 16px;
      }

      &.size-large {
        padding: 16px 32px;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
      }
    }

    &.variant-tertiary {
      border: none;
      border-radius: 0;
      padding-inline: 0;
      border-bottom: 2px solid transparent;

      &:hover {
        color: #0d2a38;
        border: none;
        border-bottom: 2px solid #0d2a38;
      }

      &.active {
        color: #184d6d;
        background-color: unset;
        border-bottom: 2px solid #184d6d;

        &:hover {
          color: #0d2a38;
          border: none;
          border-bottom: 2px solid #0d2a38;
        }
      }

      &.size-small {
        padding: 0;
        height: 24px;

        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        border-bottom: 2px solid transparent;

        &:hover {
          color: #0d2a38;
          border-bottom: 2px solid #0d2a38;
        }
      }

      &.size-medium {
        height: 40px;
      }
    }

    &.active {
      background-color: #c0daff;
      color: #0d2a38;
    }
  }
`;
