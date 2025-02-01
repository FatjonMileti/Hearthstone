import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Typography } from '../../components/index.ts';

import { Dashboard } from './Dashboard/Dashboard.tsx';
import { ProfileDetails } from './ProfileDetails.tsx';
import { TransactionAgreement } from './TransactionAgreement.tsx';
import { TermsAndConditions } from './TermsAndConditions.tsx';
import { HelpAndSupport } from './HelpAndSupport.tsx';
import { HeaderLoggedIn } from '../PagesComponents/HeaderLoggedIn/HeaderLoggedIn.tsx';
import { Footer } from '../Home/Footer.tsx';

import request from '../../utils/axios.ts';

import { useUserStore } from '../../globalState/user.tsx';
import { useProfileStore } from '../../globalState/profile.tsx';

import { ImproveTrustScoreModal } from '../PagesComponents/ImproveTrustScoreModal.tsx';
import { SetCriteria } from '../SetCriteria/SetCriteria/SetCriteria.tsx';
import { Properties } from './Properties/Properties.tsx';
import { Solicitors } from './Solicitors.tsx';
import { AccountItem } from '../../components/index.ts';
import { IconProps } from '../../components/Icon.tsx';
import { AccountDetails } from './AccountDetails.tsx';
import { PlanAndPayment } from './PlanAndPayment.tsx';
import { SecurityDetails } from './SecurityDetails.tsx';
import { CommunicationSettings } from './CommunicationSettings.tsx';
import { PrivacyAndSharing } from './PrivacyAndSharing.tsx';
import { LinearProgress } from '../../components/LinearProgress.tsx';
import verified from './images/verified.svg';

interface SubMenuItem {
  icon: IconProps['icon'];
  text: string;
  link: string;
}

export const submenus: SubMenuItem[] = [
  { icon: 'account', text: 'My Bio', link: '/my-bio' },
  { icon: 'wallet', text: 'Plan and payment', link: '/plan-and-payment' },
  { icon: 'lock-key', text: 'Security details', link: '/security-details' },
  { icon: 'megaphone', text: 'Communication settings', link: '/communication-settings' },
  { icon: 'security', text: 'Privacy and sharing', link: '/privacy-and-sharing' },

  // { icon: 'layer', text: 'Dashboard', link: '' },
  { icon: 'building', text: 'My Properties', link: '/properties' },
  // { icon: 'settings', text: 'Account settings', link: '/account-settings' },
  { icon: 'file', text: 'Transaction agreement', link: '/transaction-agreement' }
  // { icon: 'file', text: 'Terms & Conditions', link: '/terms-and-conditions' },
  // { icon: 'support', text: 'Help & Support', link: '/help-and-support' },
  // { icon: 'user', text: 'Solicitors', link: '/solicitors' }
];

export const tenantSubmenu: SubMenuItem[] = [
  { icon: 'account', text: 'My Bio', link: '/my-bio' },
  { icon: 'wallet', text: 'Plan and payment', link: '/plan-and-payment' },
  { icon: 'lock-key', text: 'Security details', link: '/security-details' },
  { icon: 'megaphone', text: 'Communication settings', link: '/communication-settings' },
  { icon: 'security', text: 'Privacy and sharing', link: '/privacy-and-sharing' },

  // { icon: 'layer', text: 'Dashboard', link: '' },
  // { icon: 'settings', text: 'Account settings', link: '/account-settings' },
  // { icon: 'research', text: 'Refine your search', link: '/refine-your-search' },
  { icon: 'file', text: 'Transaction agreement', link: '/transaction-agreement' }
  // { icon: 'file', text: 'Terms & Conditions', link: '/terms-and-conditions' },
  // { icon: 'support', text: 'Help & Support', link: '/help-and-support' },
  // { icon: 'user', text: 'Solicitors', link: '/solicitors' }
];

export const MyAccount = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const userStore = useUserStore();
  const profileStore = useProfileStore();
  const navigate = useNavigate();
  const [improveTrustScoreModalVisibility, setImproveTrustScoreModalVisibility] = React.useState(false);

  const logOut = async () => {
    try {
      await request(userStore.auth.access_token).post('/api/account/logout', {
        refresh_token: userStore.auth.refresh_token
      });
    } catch (err) {
      console.log(err);
    } finally {
      userStore.set((user: any) => ({ ...user, auth: null, userDetails: null, ability: null }));
      profileStore.reset();
      navigate('/');
    }
  };

  return (
    <>
      <ImproveTrustScoreModal
        open={improveTrustScoreModalVisibility}
        closeModal={() => setImproveTrustScoreModalVisibility(false)}
      />
      <div className={`my-account-page ${className}`}>
        <div className='header-and-content-wrapper'>
          <HeaderLoggedIn />
          <div className='container-account'>
            <div className='left-menu'>
              <div className='menu-header'>
                <div className='name-and-status-wrapper'>
                  <Typography variant='body3' className='name'>
                    {`${profileStore.first_name} ${profileStore.last_name}`}
                  </Typography>
                  <img className='verified-indicator' src={verified} alt='Verified indicator' />
                </div>

                <div className='completion-wrapper'>
                  <div className='trust-score'>
                    <Typography variant='body5' className='trust-score-title'>
                      Account completion:
                    </Typography>
                    <Typography
                      variant='body4'
                      className='trust-score-percentage'
                      onClick={() => setImproveTrustScoreModalVisibility(true)}>
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

              <div className='menu-body'>
                {(profileStore.role === 'Tenant' ? tenantSubmenu : submenus).map(
                  ({ icon, text, link }, menuItemIndex) => (
                    <NavLink end to={`/my-account${link}`} key={menuItemIndex}>
                      {({ isActive }) => <AccountItem active={isActive} label={text} icon={icon} />}
                    </NavLink>
                  )
                )}
              </div>

              <div className='menu-footer'>
                <AccountItem className='sign-out' label='Sign out' icon='sign-out' onClick={logOut} />
              </div>
            </div>
            {/*<div className='line'></div>*/}
            <div className='right-content'>
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/my-bio' element={<AccountDetails />} />
                <Route path='/plan-and-payment' element={<PlanAndPayment />} />
                <Route path='/security-details' element={<SecurityDetails />} />
                <Route path='/communication-settings' element={<CommunicationSettings />} />
                <Route path='/privacy-and-sharing/' element={<PrivacyAndSharing />} />
                <Route path='/account-settings' element={<ProfileDetails />} />
                {profileStore.role === 'Tenant' && (
                  <Route path='/refine-your-search' element={<SetCriteria />} />
                )}
                <Route path='/transaction-agreement' element={<TransactionAgreement />} />
                <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
                <Route path='/help-and-support' element={<HelpAndSupport />} />
                <Route path='/solicitors' element={<Solicitors />} />
                <Route path='/properties' element={<Properties />} />
              </Routes>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
})`
  &.my-account-page {
    position: relative;
    display: grid;
    grid-template-rows: auto min-content;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;

      .header-logged-in {
        border-bottom-color: #f3f4f5;
      }

      .container-account {
        display: grid;
        //column-gap: 69px;
        //padding: 24px 36px 36px 36px;
        min-height: calc(100vh - 96px);
        box-sizing: border-box;

        grid-template-columns: 1fr 3fr;

        .left-menu {
          display: grid;
          grid-template-rows: min-content auto min-content;
          row-gap: 32px;
          padding: 32px;
          background: white;
          border-right: 1px solid #f3f4f5;

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
                font-weight: 900;
              }

              .verified-indicator {
                width: 16px;
                height: 16px;
                padding: 4px;
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

          .menu-body {
            display: flex;
            flex-direction: column;
            row-gap: 8px;
            > a {
              text-decoration: none;
              color: black;
            }
          }

          .menu-footer {
            .sign-out {
              color: #b4263b;
            }
          }

          .log-out-button {
            align-self: flex-end;
          }
        }

        //.line {
        //  width: 2px;
        //  background-color: #f3f4f5;
        //}

        .right-content {
          padding: 24px 36px 24px 24px;
          z-index: 0;
          position: relative;
        }
      }
    }
  }
`;
