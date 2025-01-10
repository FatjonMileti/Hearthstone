import { styled } from '@mui/system';
import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'small' | 'medium' | 'large';
}

export const Radio = styled(
  React.forwardRef<HTMLInputElement, RadioProps>(
    ({ checked, value, size = 'large', className, ...props }, ref) => {
      return (
        <div className={`radio ${className} size-${size} ${checked ? 'checked' : ''}`}>
          <input type='radio' checked={checked} value={value} {...props} ref={ref} />
        </div>
      );
    }
  )
)`
  &.radio {
    width: 24px;
    height: 24px;
    border: 2px solid #184d6d;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;

    input {
      margin: 0;
      width: 24px;
      height: 24px;
      opacity: 0;
      position: absolute;
      inset: 0;
      cursor: pointer;
    }

    &.checked {
      :after {
        content: '';
        position: absolute;
        border-radius: 50%;
        inset: 0;
        margin: auto;
        width: 18px;
        height: 18px;
        background-color: #184d6d;
        aspect-ratio: 1 / 1;
      }
    }
  }
`;
