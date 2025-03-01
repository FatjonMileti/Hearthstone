import { styled } from '@mui/system';
import React from 'react';
import classNames from 'classnames';
import { AnimatePresence } from 'framer-motion';
import { UseFormReturn } from 'react-hook-form';

import { Modal, ModalProps } from '../../components/Modal.tsx';
import { Typography } from '../../components/Typography.tsx';
import { Label } from '../../components/Label.tsx';
import { Icon } from '../../components/Icon.tsx';

import { SetCriteriaLocation } from './SetCriteria/SetCriteria.Location.tsx';
import { SetCriteriaHouseType } from './SetCriteria/SetCriteria.HouseType.tsx';
import { SetCriteriaBudget } from './SetCriteria/SetCriteria.Budged.tsx';
import { SetCriteriaHouseDetails } from './SetCriteria/SetCriteria.HouseDetails.tsx';

import { CriteriaFormType } from './criteria.types.ts';
import { RoundAction } from '../../components/RoundAction.tsx';
import { useCriteriaWithoutAccountStore } from '../../globalState/useCriteriaWithoutAccount.ts';

const tabLabels = ['Location', 'House type', 'Budget'];

const animationProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 1
  }
};

interface SetCriteriaModalProps extends ModalProps {
  onBack: () => void;
  form: UseFormReturn<CriteriaFormType>;
  onStartMatchingClick: () => any;
  showTabs?: boolean;
}
export const SetCriteriaModal = styled(
  ({ className, onBack, form, onStartMatchingClick, showTabs = false, ...rest }: SetCriteriaModalProps) => {
    const criteriaWithoutAccountStore = useCriteriaWithoutAccountStore();
    const [step, setStep] = React.useState(0);
    React.useEffect(() => {
      if (Object.keys(criteriaWithoutAccountStore.criteria).length > 1) {
        setStep(2);
      } else {
        setStep(0);
      }
    }, [rest.open]);

    return (
      <Modal className={classNames('set-criteria-modal', className)} {...rest}>
        <div
          className={classNames('modal-header', {
            'with-tabs': showTabs
          })}>
          <div className='title-and-button-wrapper'>
            <Typography variant='body2'>Match preferences</Typography>

            <RoundAction
              icon='close'
              onClick={async () => {
                onBack();
              }}
            />
          </div>

          {showTabs && (
            <div className='criteria-tabs-bar'>
              {tabLabels.map((tabLabel, tabLabelIndex) => (
                <Label
                  className='criteria-tab-label'
                  active={tabLabelIndex === step}
                  variant='tertiary'
                  key={tabLabelIndex}
                  onClick={() => setStep(tabLabelIndex)}>
                  {tabLabel}
                </Label>
              ))}
            </div>
          )}
        </div>

        <div className='modal-body'>
          <div className='step-content'>
            <AnimatePresence>
              {
                [
                  <SetCriteriaLocation key='SetCriteriaLocation' form={form} {...animationProps} />,
                  <SetCriteriaHouseType key='SetCriteriaHouseType' form={form} {...animationProps} />,
                  // <SetCriteriaHouseDetails key='SetCriteriaHouseDetails' form={form} {...animationProps} />,
                  <SetCriteriaBudget key='SetCriteriaBudget' form={form} {...animationProps} />,
                ][step]
              }
            </AnimatePresence>
          </div>
          <div className='section-footer'>
            <Label
              size='large'
              variant='secondary'
              className='next-button'
              onClick={() => {
                if (step > 0) {
                  setStep((step) => step - 1);
                } else {
                  onBack();
                }
              }}>
              <Icon icon='arrow-left' /> Back
            </Label>

            { step === 2 && (
              <Label
              variant='special'
              size="large"
              className={classNames('start-matching-button', { hide: step !== 2 })}
              onClick={onStartMatchingClick}>
              Find matches
            </Label>
            )}

            <Label
              variant='special'
              size='large'
              className={classNames('next-button', { hide: step === 2 })}
              onClick={() => setStep((step) => step + 1)}>
              Next <Icon icon='arrow-right' />
            </Label>
          </div>
        </div>
      </Modal>
    );
  }
)`
  &.set-criteria-modal {
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
        display: grid;
        gap: 16px;
        border-bottom: 2px solid #f3f4f5;
        padding: 24px 36px;

        &.with-tabs {
          box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);
          padding: 24px 36px 0 36px;
        }

        .title-and-button-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .criteria-tabs-bar {
          display: flex;
          align-items: flex-start;
          column-gap: 32px;

          .label {
            padding: 16px 0;
            margin-bottom: -2px;
            height: auto !important;

            color: #646464;

            :hover {
              color: #0d2a38;
              border-color: #0d2a38;
            }
            &.active {
              color: #0d2a38;
              border-color: #0d2a38;
            }
          }
        }
      }

      .modal-body {
        overflow-y: auto;
        display: grid;
        justify-items: center;
        grid-template-rows: auto min-content;

        .step-content {
          display: grid;
          justify-items: center;
          padding: 48px 36px;
          width: 100%;
          box-sizing: border-box;
        }

        .section-footer {
          width: 100%;

          display: grid;
          grid-template-columns: min-content min-content min-content;

          align-items: center;
          justify-content: space-between;
          padding: 24px 36px;
          box-sizing: border-box;

          .start-matching-button {
            transition: opacity 0.2s ease-in-out;
            visibility: visible;
            opacity: 1;
            &.hide {
              visibility: hidden;
              opacity: 0;
            }
          }

          .next-button {
            transition: opacity 0.2s ease-in-out;
            visibility: visible;
            opacity: 1;
            &.hide {
              visibility: hidden;
              opacity: 0;
            }
          }
        }
      }
    }
  }
`;
