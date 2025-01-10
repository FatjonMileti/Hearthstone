import { styled } from '@mui/system';
import React, { ReactElement, ReactNode } from 'react';

import { useId } from 'react';
import { Typography } from '../Typography';
import { Icon } from '../Icon';

import chevron from './chevron.svg';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    variant?: 'filled' | 'outlined' | 'standard';
    label?: ReactNode;
    required?: boolean;
    endAdornment?: ReactElement;
    startAdornment?: ReactElement;
    helperText?: string;
    error?: boolean;
}

export const Select = styled(
    React.forwardRef<HTMLSelectElement, SelectProps>(
        (
            {
                className,
                id,
                label,
                required = false,
                endAdornment,
                startAdornment,
                helperText,
                error,
                variant = 'outlined',
                children,
                ...rest
            },
            ref
        ) => {
            const elementId = id || useId();
            return (
                <div className={`select ${className} ${error ? 'error' : ''} variant-${variant}`}>
                    {(label || required) && (
                        <label htmlFor={elementId}>
                            <>{label}</>
                            {required && <span className='required-asterisk'> *</span>}
                        </label>
                    )}

                    <div className='input-wrapper'>
                        {startAdornment || null}
                        <select id={elementId} {...rest} ref={ref}>
                            {children}
                        </select>
                        {endAdornment || null}
                    </div>

                    {helperText && (
                        <span className='helper-text'>
              {error && <Icon icon='warning' size={12} color='#b4263b' />}
                            <Typography variant='body4'>{helperText || ''}</Typography>
            </span>
                    )}
                </div>
            );
        }
    )
)`
  &.select {
    display: flex;
    flex-direction: column;
    background-color: inherit;
    row-gap: 4px;

    font-family: 'Roobert', serif;

    label {
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      color: #0d2a38;

      .required-asterisk {
        color: #b4263b;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
      }
    }

    .helper-text {
      color: #b4263b;
      display: flex;
      column-gap: 10px;
      align-items: center;

      .typography {
        font-size: 12px;
        line-height: 16px;
        min-height: 16px;
        font-weight: 600;
      }
    }

    &.error {
      .input-wrapper {
        border: 1px solid #b4263b;
      }
    }

    .input-wrapper {
      display: flex;
      align-items: center;

      border: 1px solid #a7a7a7;
      border-radius: 8px;
      background-color: inherit;

      &:focus-within {
        border: 1px solid #184d6d;
        background-color: #ffffff;
      }

      select {
        width: 100%;
        height: 48px;
        padding: 12px;
        box-sizing: border-box;

        border: none;
        border-radius: inherit;
        outline: none;
        background-color: inherit;

        font-weight: 400;
        font-size: 14px;
        line-height: 24px;

        flex-grow: 1;

        appearance: none;

        background-image: url('${chevron}');
        background-size: 12px;
        background-repeat: no-repeat;
        background-position: calc(100% - 8px) center;
      }
    }

    &.variant-standard {
      .input-wrapper {
        border: none;

        border-bottom: 1px solid #a7a7a7;

        border-radius: 0;
      }
    }
  }
`;