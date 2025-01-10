import React, { MouseEventHandler, ReactElement } from 'react';
import { styled } from '@mui/system';
import { Typography } from './Typography';
import classNames from 'classnames';
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: ReactElement | ReactElement[];
  value?: any;
  onChange?: Function;
  variant?: 'primary' | 'secondary' | 'tertiary';
  rounded?: boolean;
}

export const Tabs = styled(
  ({
    className,
    children,
    value,
    onChange = () => {},
    variant = 'primary',
    rounded = false,
    ...otherProps
  }: TabsProps) => {
    return (
      <div
        className={classNames('tabs', className, `variant-${variant}`, { rounded })}
        {...otherProps}
        style={{ gridTemplateColumns: `repeat(${React.Children.count(children)}, minmax(0, 1fr))` }}>
        {React.Children.map(children, (child: ReactElement, childIndex: number) => {
          if ((child.type as React.ComponentType).displayName === Tab.displayName) {
            return React.cloneElement(child, {
              active: childIndex === value,
              setActive: () => onChange(childIndex),
              variant,
              rounded
            });
          }
          return null;
        })}
      </div>
    );
  }
)`
  &.tabs {
    display: grid;
    border-radius: 10px;
    column-gap: 4px;
    padding: 4px;
    box-sizing: border-box;
    width: fit-content;

    &.rounded {
      border-radius: 32px;
      background-color: white;
      border: 1px solid #e7e7e7;
    }

    &.variant-primary {
      border: 1px solid #0d2a38;
    }

    &.variant-secondary {
      border: 1px solid #e7e7e7;
    }
  }
`;

export interface TabProps extends React.HTMLAttributes<HTMLElement> {
  label?: string;
  active?: boolean;
  setActive?: MouseEventHandler;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  rounded?: boolean;
}

export const Tab = styled(
  ({
    className,
    children,
    label,
    active,
    setActive,
    variant = 'primary',
    disabled = false,
    rounded = false,
    ...otherProps
  }: TabProps) => {
    return (
      <div
        className={classNames('tab', className, `variant-${variant}`, {
          disabled,
          active,
          rounded
        })}
        {...otherProps}
        onClick={disabled ? undefined : setActive}>
        <Typography className='label' variant='body4'>
          {label || null}
        </Typography>
      </div>
    );
  }
)`
  &.tab {
    user-select: none;
    cursor: pointer;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    justify-content: center;
    flex-grow: 1;
    box-sizing: border-box;

    &.rounded {
      border-radius: 32px;
    }

    .label {
      font-weight: 400;
    }

    &.active {
      .label {
        font-weight: 600;
      }
    }

    &.disabled {
      cursor: not-allowed;
    }

    &.variant-primary {
      &.active {
        background-color: #0d2a38;
        .label {
          color: white;
        }
      }
    }

    &.variant-secondary {
      &.active {
        background-color: #c0daff;
        .label {
          font-weight: 600;
        }
      }
    }

    &.variant-tertiary {
      &.active {
        background-color: #eee0d3;
      }

      .label {
        color: #0d2a38;
      }
    }
  }
`;

Tab.displayName = 'Tab';
