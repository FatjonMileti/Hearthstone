import { styled } from '@mui/system';
import React from 'react';

import { Typography } from '../../components/Typography';

import HearthstoneFullLogoBlack from '../../assets/svg/LogoLostFishColored.svg';

import { Link } from '../../components/Link';

export const Footer = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`footer-section ${className}`}>
      <img className='logo' src={HearthstoneFullLogoBlack} alt='Hearthstone logo' />

      <div className='links-row'>
        <Link>How Hearthstone works</Link>
        <Link>Terms & Conditions</Link>
        <Link> Privacy Policy</Link>
      </div>
      <Typography variant='body5' className='copyright'>
        2024 © Hearthstone Limited. All rights reserved.
      </Typography>
    </div>
  );
})`
  &.footer-section {
    padding: 48px 36px;
    background: #f3f4f5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .logo {
      height: 34px;
    }

    .links-row {
      display: flex;
      column-gap: 24px;
      align-items: center;
    }

    .copyright {
      line-height: 24px;
    }
  }
`;
