import React from 'react';
import { styled } from '@mui/system';
import { NavLink, useNavigate } from '../../../compat/router';
import classNames from 'classnames';

import { useProfileStore } from '../../../globalState/profile';
import { useNotificationsStore } from '../../../globalState/notifications';
import { AccountWidget } from '../../../components/AccountWidget/AccountWidget';
import { NotificationsIcon } from '../../../components/index';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import { Role } from '../../../enums';
import { MenuItem } from './MenuItem';

import HearthstoneLogoColored from '../../../assets/svg/HearthstoneLogo.svg';
import { NotificationsDrawer } from '../../Notifications/NotificationsDrawer';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const HeaderLoggedIn = styled(({ className }: HeaderProps) => {
  const navigate = useNavigate();
  const profileStore = useProfileStore();
  const notificationsStore = useNotificationsStore();

  const [isNotificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  console.log(notificationsStore.unreadMessages);

  return (
    <div className={classNames('header-logged-in', className)}>
      <img className='logo' src={HearthstoneLogoColored} alt='Hearthstone logo' onClick={() => navigate('/')} />
      <div className='middle-part'>
        <div className='navigation'>
          <NavLink to='/'>
            {({ isActive }) => <MenuItem label='Dashboard' icon='layer' active={isActive} />}
          </NavLink>

          <NavLink to='/matches'>
            {({ isActive }) => <MenuItem label='Matches' icon='like' active={isActive} />}
          </NavLink>

          <NavLink to='/messages'>
            {({ isActive }) => (
              <MenuItem
                label='Messages'
                icon={notificationsStore.unreadMessages > 0 ? 'message-filled' : 'email'}
                active={isActive}
                counter={notificationsStore.unreadMessages}
              />
            )}
          </NavLink>

          {profileStore.role === Role.Landlord && (
            <NavLink to='/my-properties'>
              {({ isActive }) => <MenuItem label='Properties' icon='building' active={isActive} />}
            </NavLink>
          )}
        </div>
      </div>

      <div className='right-part'>
        <div className='matches-and-messages-buttons-wrapper'>
          <NotificationsIcon
            counter={notificationsStore.unreadMessages || undefined}
            onClick={() => setNotificationsDrawerOpen(true)}
          />
        </div>
        <NotificationsDrawer open={isNotificationsDrawerOpen} setOpen={setNotificationsDrawerOpen} />

        <div className='avatar-and-match-score-wrapper'>
          <AccountWidget avatar={getAvatarFormIndex(profileStore.avatar)} />
        </div>
      </div>
    </div>
  );
})`
  &.header-logged-in {
    align-items: center;

    padding: 0 36px;
    height: 96px;

    display: grid;
    grid-template-columns: auto auto auto;
    justify-content: space-between;

    border: 1px solid #eee0d3;

    .logo {
      height: 42px;
      width: auto;
      cursor: pointer;
    }

    .middle-part {
      .navigation {
        display: flex;
        //width: 672px;
        height: 96px;
        justify-content: space-between;
        align-items: center;
        column-gap: 32px;

        list-style: none;
        a {
          text-decoration: none;
        }
      }
      .navigation-menu {
        list-style: none;
        a {
          text-decoration: none;
        }

        display: flex;
        column-gap: 32px;
        align-items: center;
        margin: 0;
        padding: 5px;

        .messages-button-content {
          display: flex;
          align-items: center;
          column-gap: 4px;
          .unread-messages-indicator {
            width: 8px;
            height: 8px;
            background-color: #b4263b;
            border-radius: 50%;
          }
        }
      }
    }

    .right-part {
      display: grid;
      grid-template-columns: max-content min-content max-content;
      column-gap: 24px;
      align-items: center;

      .matches-and-messages-buttons-wrapper {
        display: flex;
        column-gap: 16px;
      }

      .avatar-and-match-score-wrapper {
        display: flex;
        align-items: center;
        column-gap: 16px;
      }
    }
  }
`;
