import React from 'react';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

import HearthstoneLogoColored from '../../assets/svg/HearthstoneLogo.svg';
import { Label } from '../../components';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onSigInClick?: () => void;
  onRegisterClick?: () => void;
}

export const Header = styled(
  ({ className, onSigInClick = () => {}, onRegisterClick = () => {} }: HeaderProps) => {
    const navigate = useNavigate();
    return (
      <div className={`header ${className}`}>
        <img className='logo' src={HearthstoneLogoColored} alt='Hearthstone logo' onClick={() => navigate('/')} />

        <div className='menu-desktop'></div>

        <div className='right'>
          <Label variant='secondary' className='join-button' size='medium' onClick={onSigInClick}>
            Sign In
          </Label>
          <Label variant='primary' className='join-button' size='medium' onClick={onRegisterClick}>
            Register
          </Label>
        </div>
      </div>
    );
  }
)`
  &.header {
    width: 100%;
    height: 96px;
    align-items: center;

    padding: 0px 36px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: min-content max-content min-content;
    justify-content: space-between;

    ${(props) => props.theme.breakpoints.down('laptop')} {
      height: 80px;
      padding: 16px 36px;
    }

    .logo {
      height: 42px;
      width: auto;
      cursor: pointer;
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

    .right {
      display: flex;
      gap: 16px;

      .join-button {
      }
    }
  }
`;
