import { styled } from '@mui/system';
import React, { ReactNode } from 'react';

import { useId } from 'react';
import { Typography } from './Typography';
import { Icon } from './Icon';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'filled' | 'outlined' | 'standard';
  label?: string;
  hint?: ReactNode;
  required?: boolean;
  helperText?: string;
  error?: boolean;
}

export const Textarea = styled(
  // eslint-disable-next-line react/display-name
  React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
      { hint, className, id, label, required = false, helperText, error, variant = 'outlined', ...rest },
      ref
    ) => {
      const elementId = id || useId();
      return (
        <div className={`text-field ${className} ${error ? 'error' : ''} variant-${variant}`}>
          <div>
            {(label || required) && (
              <label htmlFor={elementId}>
                <>{label}</>
                {required && <span className='required-asterisk'> *</span>}
              </label>
            )}

            {hint && <p className='hint'>{hint}</p>}
          </div>

          <div className='input-wrapper'>
            <textarea id={elementId} {...rest} ref={ref} />
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
  &.text-field {
    display: flex;
    flex-direction: column;
    background-color: inherit;
    row-gap: 4px;

    font-family: 'Roobert', serif;

    label {
      font-weight: 700;
      font-size: 12px;
      line-height: 20px;
      color: #646464;

      .required-asterisk {
        color: #b4263b;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
      }
    }

    .hint {
      color: #646464;
      font-family: Roobert, serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;

      margin: 0;
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

      border: 1px solid #e7e7e7;
      border-radius: 8px;
      background-color: inherit;

      &:focus-within {
        border: 1px solid #184d6d;
        background-color: #ffffff;
      }

      textarea {
        width: 100%;
        padding: 12px;
        box-sizing: border-box;

        border: none;
        border-radius: inherit;
        outline: none;
        background-color: inherit;

        font-family: Roobert, serif;
        font-weight: 700;
        font-size: 14px;
        line-height: 24px;
        color: #0d2a38;
        flex-grow: 1;

        &::placeholder {
          font-size: 14px;
          line-height: 24px;
          font-weight: 500;
          color: #a7a7a7;
          font-family: Roobert, serif;
        }
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
