import { styled } from '@mui/system';

import { Typography } from '../../../components/Typography';
import { IconButton } from '../../../components/IconButton';
import { Icon } from '../../../components/Icon';

// import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import pierre from '../../MyAccount/images/pierre at desk cream.png';
import imLookingForPlace from './Hearthstone_house_.jpg';
import classNames from 'classnames';
import { LookingFor } from '../../SetCriteria/criteria.contants';
import { Label } from '../../../components/Label';
import { HTMLMotionProps, motion } from 'framer-motion';
import { LookingForType } from '../../SetCriteria/criteria.types';

export interface WhatAreYouLookingForProps extends HTMLMotionProps<'div'> {
  lookingFor?: LookingForType;
  onLookingForChange: (lookingFor: LookingForType) => void;
  onNext: () => void;
}

export const WhatAreYouLookingFor = styled(
  ({ className, lookingFor, onLookingForChange, onNext, ...rest }: WhatAreYouLookingForProps) => {
    return (
      <motion.div className={classNames('looking-for-section', className)} {...rest}>
        <div className='section-content'>
          <Typography variant='body2' className='title'>
            What are you looking for?
          </Typography>

          <div className='circles'>
            <div
              className={classNames('circle-wrapper first', {
                active: lookingFor === LookingFor.LookingForAPlace
              })}
              onClick={() => {
                onLookingForChange(LookingFor.LookingForAPlace);
              }}>
              <div className='button-and-text-wrapper'>
                <Typography className='looking-for-text' variant='body4'>
                  ...a place to rent
                </Typography>
                <IconButton className='plus-button' inverted>
                  <Icon icon='checked' size={24} color='white' />
                </IconButton>
              </div>
              <div className={classNames('circle')}>
                <div className='intersection-first'></div>
              </div>
            </div>

            <div
              className={classNames('circle-wrapper second', {
                active: lookingFor === LookingFor.OwnAPlace
              })}
              onClick={() => {
                onLookingForChange(LookingFor.OwnAPlace);
              }}>
              <div className={classNames('circle ')}>
                <div
                  className='intersection'
                  onClick={() => {
                    lookingFor === 'I own a place'
                      ? onLookingForChange(LookingFor.OwnAPlace)
                      : onLookingForChange(LookingFor.LookingForAPlace);
                  }}></div>
              </div>
              <div className='button-and-text-wrapper'>
                <IconButton className='plus-button' inverted>
                  <Icon icon='checked' size={24} color='white' />
                </IconButton>

                <Typography className='looking-for-text' variant='body4'>
                  ...a tenant
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className='section-footer'>
          <Label
            size='large'
            variant='special'
            className='next-button'
            onClick={onNext}
            disabled={!lookingFor}>
            Next <Icon icon='arrow-right' />
          </Label>
        </div>
      </motion.div>
    );
  }
)`
  &.looking-for-section {
    display: grid;
    box-sizing: border-box;
    grid-template-rows: auto min-content;
    height: 100%;

    .section-content {
      display: grid;
      align-items: center;
      padding: 48px 36px;
      row-gap: 48px;
      justify-content: center;
      justify-items: center;
      align-content: center;

      ${(props) => props.theme.breakpoints.down('laptop')} {
        row-gap: 32px;
        padding: 24px 16px;
      }

      .title {
        ${(props) => props.theme.breakpoints.down('laptop')} {
          font-size: 24px;
          line-height: 32px;
        }
      }

      .circles {
        display: grid;
        grid-template-columns: min-content min-content;

        ${(props) => props.theme.breakpoints.down('laptop')} {
          grid-template-columns: min-content;
        }

        .circle-wrapper {
          display: grid;
          grid-template-columns: auto auto;

          :not(&.active) {
            z-index: 1;
          }

          ${(props) => props.theme.breakpoints.down('laptop')} {
            grid-template-columns: auto;
            justify-items: center;
          }

          :hover {
            .button-and-text-wrapper {
              .plus-button {
                color: white;
                border: 2px solid #184d6d;
              }

              .looking-for-text {
                color: #184d6d;
                border-bottom: 1px solid #184d6d;
                cursor: pointer;
              }
            }
          }

          &.active {
            .circle {
              //outline: 6px solid #e5155a;
            }

            .button-and-text-wrapper {
              .plus-button {
                color: white;
                border: 2px solid #184d6d;
                background-color: #184d6d;
              }

              .looking-for-text {
                color: #184d6d;
                border-bottom: 1px solid transparent;
              }
            }
          }

          .circle {
            display: inline-block;
            border-radius: 50%;
            width: 324px;
            height: 324px;
            cursor: pointer;
            box-sizing: border-box;

            ${(props) => props.theme.breakpoints.down('laptop')} {
              width: 180px;
              height: 180px;
            }
          }

          .button-and-text-wrapper {
            display: grid;
            grid-template-columns: max-content max-content;
            column-gap: 24px;
            align-items: center;
            z-index: 1;

            ${(props) => props.theme.breakpoints.down('laptop')} {
              grid-template-columns: min-content;
              row-gap: 24px;
              justify-items: center;
            }

            .plus-button {
              border: 2px solid #c4b1a3;
              background-color: #fff;
              padding: 10px;
              transition: all 0.2s ease-in-out;

              ${(props) => props.theme.breakpoints.down('laptop')} {
                padding: 6px;
              }
            }

            .looking-for-text {
              color: #184d6d;
              font-size: 18px;
              font-weight: 600;
              width: max-content;
              padding: 4px 0;
              border-bottom: 1px solid transparent;
              transition: all 0.2s ease-in-out;
            }
          }

          &.first {
            .circle {
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
              position: relative;
              background-image: url(${imLookingForPlace});

              .intersection-first {
                background-color: #e1edfb;
                width: 100%;
                height: 100%;
                content: '';
                position: absolute;
                border-radius: 50%;
                clip-path: circle(50% at calc(100% + 37px) 50%);

                ${(props) => props.theme.breakpoints.down('laptop')} {
                  clip-path: circle(50% at 50% 113%);
                }
              }
            }

            .button-and-text-wrapper {
              margin: 0 -24px 0 0;

              ${(props) => props.theme.breakpoints.down('laptop')} {
                margin: 0 0 -24px 0;
              }
            }

            :hover {
              z-index: 1;
            }
          }

          &.second {
            margin: 0 0 0 -125px;

            ${(props) => props.theme.breakpoints.down('laptop')} {
              margin: -67px 0 0 0;
            }

            .circle {
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
              position: relative;
              background-image: url(${pierre});

              ${(props) => props.theme.breakpoints.down('laptop')} {
                //background-size: 134%;
                //background-position-y: 100%;
              }

              .intersection {
                background-color: #e1edfb;
                width: 100%;
                height: 100%;
                content: '';
                position: absolute;
                border-radius: 50%;
                clip-path: circle(50% at -37px 50%);

                ${(props) => props.theme.breakpoints.down('laptop')} {
                  clip-path: circle(50% at 50% -13%);
                }
              }
            }

            .button-and-text-wrapper {
              margin: 0 0 0 -24px;

              ${(props) => props.theme.breakpoints.down('laptop')} {
                margin: -24px 0 0 0;
              }
            }
          }
        }
      }

      .action-buttons {
        margin-top: 72px;
        display: grid;
        justify-content: center;
      }
    }

    .section-footer {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      justify-content: space-between;
      padding: 24px 36px;
      box-sizing: border-box;

      .next-button {
        justify-self: center;
      }
    }
  }
`;
