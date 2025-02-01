import React from 'react';
import { styled } from '@mui/system';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { Typography } from '../../../components/Typography';
import { Icon } from '../../../components/Icon';
import { Avatar } from '../../../components/Avatar';

import { avatars } from '../../HomeLoggedIn/avatars';
import { useProfileStore } from '../../../globalState/profile';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardHeader = styled(({ className }: HeaderProps) => {
  const navigate = useNavigate();

  const profileStore = useProfileStore();

  return (
    <div className={`header ${className}`}>
      <div className='left-part' onClick={() => navigate('/')}>
        <Icon icon='lost-fish-yang' size={64} />
      </div>

      <div className='middle-part'>
        <div className='menu'>
          <NavLink to='/dashboard' end>
            {({ isActive }) => (
              <Button active={isActive} inverted>
                Sessions
              </Button>
            )}
          </NavLink>
          <NavLink to='/dashboard/agent-matches' end>
            {({ isActive }) => (
              <Button active={isActive} inverted>
                Matches
              </Button>
            )}
          </NavLink>
          <NavLink to='/dashboard/agent-property' end>
            {({ isActive }) => (
              <Button active={isActive} inverted>
                Properties
              </Button>
            )}
          </NavLink>
          <NavLink to='/dashboard/contracts' end>
            {({ isActive }) => (
              <Button active={isActive} inverted>
                Contract
              </Button>
            )}
          </NavLink>
        </div>
      </div>

      <div className='right-part'>
        <div className='trust-score'>
          <Typography variant='body6' className='trust-score-title'>
            Match score
          </Typography>
          <Typography variant='body5' className='trust-score-percentage'>
            60%
          </Typography>
        </div>

        <NavLink to='/dashboard/my-account'>
          <Avatar image={profileStore.avatar ? avatars[parseInt(profileStore.avatar)]?.image : undefined} />
        </NavLink>
      </div>
    </div>
  );
})`
  &.header {
    align-items: center;

    padding: 20px 36px;

    display: grid;
    grid-template-columns: auto auto auto;
    justify-content: space-between;

    .left-part {
      display: flex;
      column-gap: 24px;
      cursor: pointer;
    }

    .middle-part {
      .menu {
        list-style: none;
        display: flex;
        align-items: center;
        column-gap: 5px;
        margin: 0;

        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        padding: 5px;
        border-radius: 30px;
        background: #ffffff;
      }
    }

    .right-part {
      display: flex;
      align-items: center;
      column-gap: 8px;

      .avatar {
      }

      .trust-score {
        .trust-score-title {
          font-size: 10px;
          line-height: 12px;
          font-weight: 500;
          color: #646464;
        }

        .trust-score-percentage {
          line-height: 14px;
          font-weight: 700;
          color: #e5155a;
        }
      }
    }
  }
`;
