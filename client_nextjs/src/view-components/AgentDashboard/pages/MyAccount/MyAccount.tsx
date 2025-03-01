import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Icon } from '../../../../components';
import { Typography } from '../../../../components';
import { Dashboard } from './Dashboard';
import { ProfileDetails } from './ProfileDetails';
import { AccountSettings } from './AccountSettings';
import { DashboardHeader } from '../../components/DashboardHeader';
import request from '../../../../utils/axios';
import { useUserStore } from '../../../../globalState/user';
import { useProfileStore } from '../../../../globalState/profile';
import { Avatar } from '../../../../components';
import { avatars } from '../../../HomeLoggedIn/avatars';

const submenus: any[] = [
  { icon: 'dashboard', text: 'Dashboard', link: '' },
  { icon: 'user', text: 'Profile details', link: '/profile-details' },
  { icon: 'settings', text: 'Account settings', link: '/account-settings' }
];

export const MyAccount = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const userStore = useUserStore();
  const profileStore = useProfileStore();

  const navigate = useNavigate();

  const logOut = async () => {
    try {
      await request(userStore.auth!.access_token).post('/api/account/logout', {
        refresh_token: userStore.auth!.refresh_token
      });
    } catch (err) {
    } finally {
      userStore.set({ auth: null, userDetails: null, ability: null });
      navigate('/');
    }
  };

  return (
    <div className={`my-account-page ${className}`}>
      <DashboardHeader />
      <div className='container'>
        <div className='left-menu'>
          <div className='menu-header'>
            <Avatar image={profileStore.avatar ? avatars[parseInt(profileStore.avatar)]?.image : undefined} />

            <div>
              <Typography variant='body3' className='name'>
                {`${profileStore.first_name} ${profileStore.last_name}`}
              </Typography>
              <div className='trust-score'>
                <Typography variant='body4' className='trust-score-title'>
                  Match score:
                </Typography>
                <Typography variant='body4' className='trust-score-percentage'>
                  60%
                </Typography>
              </div>
            </div>
          </div>
          <div className='menu-body'>
            {submenus.map(({ icon, text, link }, menuItemIndex) => (
              <NavLink end to={`/dashboard/my-account${link}`} key={menuItemIndex}>
                {({ isActive }) => (
                  <motion.div whileTap={{ scale: 0.98 }} className={`menu-item ${isActive ? 'active' : ''}`}>
                    <Icon icon={icon} color='black' size={20} />
                    <Typography variant='body4' className='text'>
                      {text}
                    </Typography>
                    <Icon icon='chevron-right' color='black' className='arrow' size={14} />
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>

          <div className='menu-footer'>
            <motion.div whileTap={{ scale: 0.98 }} className='menu-item' onClick={logOut}>
              <Icon icon='sign-out' color='black' size={20} />
              <Typography variant='body4' className='text'>
                Sign out
              </Typography>
            </motion.div>
          </div>
        </div>
        <div className='line'></div>
        <div>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/profile-details' element={<ProfileDetails />} />
            <Route path='/account-settings' element={<AccountSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
})`
  &.my-account-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    background-color: white;

    grid-template-rows: min-content auto;

    .container {
      display: grid;
      column-gap: 69px;
      padding: 36px;

      grid-template-columns: 1fr min-content 2.79fr;

      .left-menu {
        display: grid;
        grid-template-rows: min-content auto min-content;
        row-gap: 32px;

        .menu-header {
          display: flex;
          column-gap: 16px;
          align-items: center;
          .avatar {
            height: 65px;
            width: 65px;
          }

          .name {
            font-weight: 700;
            font-size: 20px;
            color: #0d2a38;
          }

          .trust-score {
            display: flex;
            column-gap: 4px;
            .trust-score-title {
              color: #646464;
            }

            .trust-score-percentage {
              color: #e5155a;
              font-weight: 700;
            }
          }
        }

        .menu-body {
          display: flex;
          flex-direction: column;
          row-gap: 8px;
          > a {
            text-decoration: none;
            color: black;
          }

          .menu-item {
            display: grid;
            grid-template-columns: min-content auto min-content;
            align-items: center;
            padding: 12px 14px;
            .text {
              margin-left: 10px;
            }
            .arrow {
              margin-left: 16px;
            }

            &.active,
            :hover {
              background-color: #f7f1e7;
              border-radius: 8px;
              .text {
                font-weight: 600;
              }
            }
          }
        }

        .menu-footer {
          .menu-item {
            display: grid;
            grid-template-columns: min-content auto;
            align-items: center;
            padding: 12px 14px;
            .text {
              margin-left: 10px;
            }

            :hover {
              background-color: #f7f1e7;
              border-radius: 8px;
              cursor: pointer;
              .text {
                font-weight: 600;
              }
            }
          }
        }

        .log-out-button {
          align-self: flex-end;
        }
      }

      .line {
        width: 2px;
        background-color: #f3f4f5;
      }
    }
  }
`;
