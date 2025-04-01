import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';

import classNames from 'classnames';
import { NavLink } from '../../compat/router';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';

import { AccountMenuPopover } from './AccountMenuPopover';

export interface AccountWidgetProps extends HTMLAttributes<HTMLDivElement> {
  avatar: string;
}

export const AccountWidget = styled(({ className, avatar }: AccountWidgetProps) => {
  const [anchorEl, setAnchorEl] = React.useState<SVGElement | null>(null);

  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };
  const opened = Boolean(anchorEl);
  const id = opened ? 'simple-popover' : undefined;

  return (
    <div className={classNames('account-widget', className, { opened })}>
      <NavLink to={'/my-account/my-bio'}>
        <Avatar className='profile-button' image={avatar} />
      </NavLink>
      <Icon
        className='account-widget-menu-button'
        icon={opened ? 'close' : 'chevron-down'}
        onClick={handleClick}
        aria-describedby={id}
      />
      <AccountMenuPopover anchorEl={anchorEl} open={opened} onClose={handleClose} id={id} />
    </div>
  );
})`
  &.account-widget {
    display: inline-flex;
    gap: 4px;
    align-items: center;

    outline: 1px solid #eee0d3;
    outline-offset: -1px;
    border-radius: 28px;
    padding-right: 12px;
    box-sizing: border-box;
    transition:
      outline-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;

    &.opened {
      background-color: white;
      box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);
    }

    &:hover {
      outline-color: #c4b1a3;
      .profile-button {
        background-color: #c4b1a3;
        .icon {
          color: #000000;
        }
      }
    }

    .profile-button {
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
      z-index: 1;
      height: 48px;
      width: 48px;
      position: relative;

      background-color: #eee0d3;
      .icon {
        color: #c4b1a3;
        transition: color 0.2s ease-in-out;
      }
    }

    .account-widget-menu-button {
      cursor: pointer;
    }
  }
`;
