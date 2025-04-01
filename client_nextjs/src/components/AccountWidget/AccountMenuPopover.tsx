import { styled } from '@mui/system';
import { useProfileStore } from '../../globalState/profile';
import { submenus, tenantSubmenu } from '../../view-components/MyAccount/MyAccount';
import { Popover, PopoverProps } from '../Popover';
import { NavLink, useNavigate } from '../../compat/router';
import { AccountItem } from '../AccountItem';
import classNames from 'classnames';
import request from '../../utils/axios';
import { useUserStore } from '../../globalState/user';
import { Typography } from '../Typography';
import { LinearProgress } from '../LinearProgress';

interface AccountMenuPopoverProps extends PopoverProps {}

export const AccountMenuPopover = styled(
  ({ anchorEl, open, onClose, id, className }: AccountMenuPopoverProps) => {
    const profileStore = useProfileStore();
    const menuItems = profileStore.role === 'Tenant' ? tenantSubmenu : submenus;
    const userStore = useUserStore();
    const navigate = useNavigate();

    const logOut = async () => {
      try {
        await request(userStore.auth!.access_token).post('/api/account/logout', {
          refresh_token: userStore.auth!.refresh_token
        });
      } catch (err) {
        console.log(err);
      } finally {
        userStore.set({ auth: null, userDetails: null, ability: null });
        profileStore.reset();
        navigate('/');
      }
    };

    return (
      <Popover
        className={classNames('account-menu-popover', className)}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        classes={{ paper: 'menu-container' }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{ vertical: -30, horizontal: 320 }}>
        <div className='menu-header'>
          <div className='name-and-status-wrapper'>
            <Typography variant='body3' className='name'>
              {`${profileStore.first_name} ${profileStore.last_name}`}
            </Typography>
          </div>

          <div className='completion-wrapper'>
            <div className='trust-score'>
              <Typography variant='body5' className='trust-score-title'>
                Account completion:
              </Typography>
              <Typography
                variant='body4'
                className='trust-score-percentage'
                // onClick={() => setImproveTrustScoreModalVisibility(true)}
              >
                {profileStore.trust_score}%
              </Typography>
            </div>
            <LinearProgress
              className='completion-linear-progress'
              variant='determinate'
              value={profileStore.trust_score}
            />
          </div>
        </div>
        <div className='menu-list'>
          {menuItems.map(({ icon, text, link }, menuItemIndex) => (
            <NavLink end to={`/my-account${link}`} key={menuItemIndex}>
              {({ isActive }) => <AccountItem active={isActive} label={text} icon={icon} />}
            </NavLink>
          ))}
        </div>
        <div className='line' />
        <div className='logout-wrapper'>
          <AccountItem className='sign-out' label='Sign out' icon='sign-out' onClick={logOut} />
        </div>
      </Popover>
    );
  }
)`
  &.account-menu-popover {
    .menu-container {
      border-radius: 16px;
      box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);

      display: flex;
      width: 324px;
      padding: 24px 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;

      .menu-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        align-self: stretch;

        .name-and-status-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
          align-self: stretch;
          .name {
            color: #0d2a38;
            font-weight: 700;
          }
        }

        .completion-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          align-self: stretch;

          .trust-score {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            align-self: stretch;
            .trust-score-title {
              color: #646464;
              font-weight: 500;
              line-height: 24px;
            }

            .trust-score-percentage {
              color: #e5155a;
              font-weight: 700;

              :hover {
                cursor: pointer;
              }
            }
          }

          .completion-linear-progress {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            align-self: stretch;
          }
        }
      }

      .menu-list {
        display: flex;
        flex-direction: column;
        align-self: stretch;
        width: 100%;

        > a {
          text-decoration: none;
        }
      }

      .line {
        height: 1px;
        align-self: stretch;
        background: #e7e7e7;
      }

      .logout-wrapper {
        width: 100%;

        .sign-out {
          color: #b4263b;
        }
      }
    }
  }
`;
