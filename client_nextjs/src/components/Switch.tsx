import { styled } from '@mui/system';
import React from 'react';
import MuiSwitch, { SwitchProps } from '@mui/material/Switch';

export const Switch = styled(
  // eslint-disable-next-line react/display-name
  React.forwardRef<HTMLButtonElement, SwitchProps>(({ size, ...props }, ref) => (
    <MuiSwitch size={size} {...props} ref={ref} disableRipple />
  ))
)`
  width: 64px;
  height: 40px;
  padding: 0;
  display: flex;

  & .MuiSwitch-switchBase {
    padding: 4px;
    background-color: unset;
    transition: all 0.2s ease-in-out;

    &.Mui-checked {
      transform: translateX(24px);
      background-color: unset;

      & + .MuiSwitch-track {
        opacity: 1;
        background-color: #c0daff;
      }

      & .MuiSwitch-thumb {
        background-color: #184d6d;
      }
    }
  }

  & .MuiSwitch-thumb {
    width: 32px;
    height: 32px;
    border-radius: 25px;
    background-color: #a7a7a7;
  }

  & .MuiSwitch-track {
    opacity: 1;
    border-radius: 25px;
    background-color: #f3f4f5;
    box-sizing: border-box;
  }
`;
