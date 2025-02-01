import React from 'react';
import { styled } from '@mui/system';
import HearthstoneLogoColored from '../../assets/svg/LogoHearthstoneColored.svg';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header = styled(({ className }: HeaderProps) => {
  return (
    <div className={`header ${className}`}>
      <img className='logo' src={HearthstoneLogoColored} alt='Hearthstone logo' />
    </div>
  );
})`
  &.header {
    height: 112px;
    align-items: center;

    padding: 20px 36px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: min-content min-content;
    justify-content: space-between;

    ${(props) => props.theme.breakpoints.down('laptop')} {
      height: 80px;
      padding: 16px 36px;
    }
  }
`;
