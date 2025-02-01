import { styled } from '@mui/system';
import React from 'react';
import classNames from 'classnames';

import { Modal, ModalProps } from '../../../components/Modal';
import { Typography } from '../../../components';
import { CloseButton } from '../../../components';

import { WhatAreYouLookingFor } from '../../InitialSetup/InitialSetupModal/InitialSetup.WhatAreYouLokingFor';
import { CreteAccountOrSignIn } from './CreteAccountOrSignIn';
import { SetCriteria } from './StartMatchingWithoutAccount.SetCriteria';

import { LookingForType } from '../../SetCriteria/criteria.types';
import { LookingFor } from '../../SetCriteria/criteria.contants';
import { useCriteriaWithoutAccountStore } from '../../../globalState/useCriteriaWithoutAccount';

const animationProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 1
  }
};

interface StartMatchingWithoutAccountModalProps extends ModalProps {
  closeStartMatching: () => any;
  visibilityStore: any[];
  onSigInClick: () => void;
  onCreateAccountClick: () => void;
  afterSetCriteria: () => any;
}
export const StartMatchingWithoutAccountModal = styled(
  ({
    visibilityStore,
    className,
    onSigInClick,
    onCreateAccountClick,
    closeStartMatching,
    afterSetCriteria
  }: StartMatchingWithoutAccountModalProps) => {
    const criteriaWithoutAccountStore = useCriteriaWithoutAccountStore();

    const [visibility] = visibilityStore;

    const [step, setStep] = React.useState(0);

    const onLookingForChange = (lookingFor: LookingForType) => {
      criteriaWithoutAccountStore.setCriteria({
        looking_for: lookingFor
      });
    };

    const onNext = () => {
      afterSetCriteria();
    };

    return (
      <>
        <Modal
          className={classNames('start-matching-without-account-modal', className)}
          open={visibility}
          onBackdropClick={closeStartMatching}>
          <div className='modal-header'>
            <Typography variant='body2'>Match preferences</Typography>

            <CloseButton size='large' onClick={closeStartMatching} />
          </div>
          <div className='modal-body'>
            {
              [
                <WhatAreYouLookingFor
                  key='whatAreYouLookingFor'
                  {...animationProps}
                  lookingFor={criteriaWithoutAccountStore.criteria.looking_for}
                  onLookingForChange={onLookingForChange}
                  onNext={() => {
                    setStep((step) => step + 1);
                  }}
                />,
                <>
                  {criteriaWithoutAccountStore.criteria.looking_for === LookingFor.OwnAPlace && (
                    <CreteAccountOrSignIn
                      onSignInClick={() => {
                        onSigInClick();
                      }}
                      onCreateAccountClick={() => {
                        onCreateAccountClick();
                      }}
                      onBack={() => setStep((step) => step - 1)}
                    />
                  )}

                  {criteriaWithoutAccountStore.criteria.looking_for === LookingFor.LookingForAPlace && (
                    <SetCriteria onNext={onNext} onBack={() => setStep((step) => step - 1)} />
                  )}
                </>
              ][step]
            }
          </div>
        </Modal>
      </>
    );
  }
)`
  &.start-matching-without-account-modal {
    width: 100vw;
    height: 100vh;

    position: relative;
    overflow: hidden;
    overflow-y: auto;
    max-height: 100vh;
    max-width: 100vw;

    border-radius: 0;

    .modal-container {
      padding: 0 !important;
      display: grid;
      grid-template-rows: max-content auto;
      background: #fff;

      .modal-header {
        padding: 23px 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        border-bottom: 2px solid #f3f4f5;
      }

      .modal-body {
        display: grid;
        overflow-y: auto;
      }
    }
  }
`;
