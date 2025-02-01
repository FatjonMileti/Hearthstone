import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { Typography } from '../../components/Typography';
import { Icon } from '../../components/Icon';
import { Label } from '../../components/Label';
import pierreImg from './pierre.png';
import classNames from 'classnames';

import backgroundImg from './forest.jpeg';
export const SectionOne = styled(
  ({
    className,
    section2Ref,
    onStartMatchingClick
  }: HTMLAttributes<HTMLDivElement> & {
    section2Ref?: React.RefObject<HTMLDivElement>;
    onStartMatchingClick: () => void;
  }) => {
    return (
      <div className={classNames('section-one', className)}>
        <div className='content-wrapper'>
          <img src={pierreImg} alt='pierre' className='pierre-img' />
          <div className='right-content'>
            <div className='welcome'>
              <Typography className='perfect-match'>
                Not agents, <i style={{ fontWeight: '400' }}> algorithms.</i>
              </Typography>
              <Typography variant='body4' className='texts'>
                We use the power of AI to find landlords and tenants exactly what they are looking for.
                <br /> The perfect match for their home or the perfect home for their match.
              </Typography>
            </div>
          </div>
        </div>
        <div className='refine-search'>
          <Label variant='special' size='large' className='action-button' onClick={onStartMatchingClick}>
            Start matching
          </Label>
          <div className='texts'>
            <Typography variant='body4'>Keen to find out how we’re doing it? </Typography>
            <Label
              variant='tertiary'
              size='large'
              className='action-button'
              onClick={() => section2Ref?.current?.scrollIntoView({ behavior: 'smooth' })}>
              Scroll down <Icon icon='arrow-right' size={24} />
            </Label>
          </div>
        </div>
      </div>
    );
  }
)`
  &.section-one {
    position: relative;
    min-height: calc(100vh - 96px);
    display: grid;
    grid-template-rows: 2fr 1fr;
    padding: 48px 36px;
    box-sizing: border-box;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(255, 251, 243, 0.9) 20%, rgba(255, 255, 255, 1) 100%)
        no-repeat;
      z-index: -1;
      top: -96px;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url(${backgroundImg});
      background-repeat: no-repeat;
      background-size: cover;
      justify-content: center;
      opacity: 0.4;
      z-index: -2;
      top: -96px;
    }

    .content-wrapper {
      position: relative;
      display: flex;
      column-gap: 16px;

      .pierre-img {
        display: flex;
        width: 40%;
        object-fit: cover;
        object-position: center;
      }

      .right-content {
        display: grid;
        align-self: center;
        padding-bottom: 60px;

        .welcome {
          display: grid;
          align-items: center;
          gap: 24px;

          .perfect-match {
            font-size: 64px;
            font-weight: 600;
            line-height: 72px;
            color: #184d6d;
          }

          .texts {
            font-weight: 500;
          }
        }
      }
    }
    .refine-search {
      display: grid;
      box-sizing: border-box;
      align-items: center;
      justify-items: center;
      gap: 16px;

      .action-button {
        .icon {
          rotate: 90deg;
        }
      }

      .texts {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }
  }
`;
