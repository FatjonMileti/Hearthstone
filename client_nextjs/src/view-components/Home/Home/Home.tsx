import React from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';

import { Header } from './Header.tsx';
import { LoginModal } from '../Login/LoginModal.tsx';
import { CreateAccountModal } from '../CreateAccount/CreateAccountmodal.tsx';
import { ForgotPasswordModal } from '../ForgotPassword/ForgotPasswordModal.tsx';
import { ResetPasswordModal } from '../ResetPassword/ResetPasswordModal.tsx';
import { SectionOne } from './Home.SectionOne.tsx';
import { SectionTwo } from './Home.SectionTwo.tsx';
import { FaqSection } from './Home.FaqSection.tsx';
import { Footer } from './Footer.tsx';
import { DailyNewss } from '../PagesComponents/DailyNews/DailyNews.tsx';

import { StartMatchingWithoutAccount } from '../Suggestions/StartMatchingWithoutAccount/StartMatchingWithoutAccount.tsx';
import HomeCirclesSection from './Home.CirclesSection.tsx';
import { ValpalSection } from '../PagesComponents/ValpalSection/Home.ValpalSection.tsx';
import { useCriteriaWithoutAccountStore } from '../../globalState/useCriteriaWithoutAccount.ts';
import { ColoredCards } from './Home.ColoredCards.tsx';

export const Home = styled(({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const [showStartMatching, setShowStartMatching] = React.useState(false);

  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = React.useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = React.useState(false);

  const section2Ref = React.useRef<HTMLDivElement>(null);

  const onSigInClick = () => {
    setShowCreateAccountModal(false);
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const onCreateAccountClick = () => {
    setShowLoginModal(false);
    setShowCreateAccountModal(true);
  };

  const onForgotPasswordClick = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  return (
    <>
      <LoginModal
        open={showLoginModal}
        onBackdropClick={() => setShowLoginModal(false)}
        onCreateAccountClick={onCreateAccountClick}
        onForgotPasswordClick={onForgotPasswordClick}
      />
      <CreateAccountModal
        open={showCreateAccountModal}
        onBackdropClick={() => setShowCreateAccountModal(false)}
        onSigInClick={onSigInClick}
      />
      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onBackdropClick={() => setShowForgotPasswordModal(false)}
        onSigInClick={onSigInClick}
      />
      <ResetPasswordModal />
      <div className={classNames('home-page', className)}>
        <div className='header-and-content-wrapper'>
          <Header onSigInClick={onSigInClick} onRegisterClick={onCreateAccountClick} />

          <div className='container-home'>
            {showStartMatching && (
              <StartMatchingWithoutAccount
                closeStartMatching={() => {
                  useCriteriaWithoutAccountStore.persist.clearStorage();
                  setShowStartMatching(false);
                }}
                onSigInClick={onSigInClick}
                onCreateAccountClick={onCreateAccountClick}
              />
            )}

            {!showStartMatching && (
              <>
                <SectionOne
                  section2Ref={section2Ref}
                  onStartMatchingClick={() => setShowStartMatching(true)}
                />

                <SectionTwo ref={section2Ref} />
                {/*<HomeCirclesSection />*/}
                <ColoredCards onCreateAccountClick={onCreateAccountClick} />
                <FaqSection />
                <ValpalSection />

                {/*<DailyNews />*/}
                <DailyNewss />
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
})`
  &.home-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto min-content;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;

      .container-home {
        display: grid;

        box-sizing: border-box;
      }
    }
  }
`;
