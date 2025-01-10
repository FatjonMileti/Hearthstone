import React from 'react';
import { styled } from '@mui/system';

import LogoHearthstoneColored from '../assets/svg/LogoHearthstoneColored.svg';

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Logo = styled(({ className }: LogoProps) => {
  return <img alt='Logo' className={`logo ${className}`} src={LogoHearthstoneColored} />;
})`
  &.logo {
    height: 64px;
    width: auto;
    ${(props) => props.theme.breakpoints.down('laptop')} {
      height: 48px;
    }
  }
`;
