import React from 'react';
import { styled } from '@mui/system';
import { NavLink } from '../../compat/router';

import HearthstoneLogoColored from '../../assets/svg/LogoLostFishColored.svg';
import { MenuButton } from '../../components/MenuButton';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header = styled(({ className }: HeaderProps) => {
  return (
    <div className={`header ${className}`}>
      <img className='logo' src={HearthstoneLogoColored} alt='Hearthstone logo' />

      <div className='menu-desktop'>
        <NavLink to='/'>{({ isActive }) => <MenuButton active={isActive}>Home</MenuButton>}</NavLink>
      </div>
    </div>
  );
})`
  &.header {
    width: 100%;
    height: 112px;
    align-items: center;

    padding: 20px 36px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: min-content max-content min-content;
    justify-content: space-between;

    ${(props) => props.theme.breakpoints.down('laptop')} {
      height: 80px;
      padding: 16px 36px;
    }

    .logo {
      height: 64px;
      width: auto;
    }

    .menu-desktop {
      list-style: none;
      a {
        text-decoration: none;
      }

      display: flex;
      align-items: center;
      column-gap: 32px;
      margin: 0;
      padding: 5px;
    }
  }
`;
