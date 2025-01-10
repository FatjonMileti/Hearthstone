import { styled } from '@mui/system';
import React from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps } from '@mui/material';
import { Icon } from './Icon';

const Checked = () => null;

export const Checkbox = styled(
  React.forwardRef<HTMLButtonElement, CheckboxProps>((props, ref) => (
    <MuiCheckbox
      {...props}
      ref={ref}
      checkedIcon={<Icon icon='checked' color='white' size={13} />}
      icon={<Checked />}
    />
  ))
)`
  &.MuiButtonBase-root {
    padding: 0;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #184d6d;

    &.Mui-checked {
      background-color: #0d2a38;
    }
  }
`;
