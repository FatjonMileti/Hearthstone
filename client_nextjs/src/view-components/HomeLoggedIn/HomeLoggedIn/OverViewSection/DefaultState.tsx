import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useNavigate } from '../../../../compat/router';

import { Label, Typography } from '../../../../components';
import pierre from './DashboardOverViewForTenant/pierre.png';
import { motion, MotionProps } from 'framer-motion';

interface DefaultStateProps extends HTMLAttributes<HTMLDivElement> {
  motionProps?: MotionProps;
}
export const DefaultState = styled(({ className, motionProps = {} }: DefaultStateProps) => {
  const navigate = useNavigate();

  const onStartMatchingClick = () => {
    navigate('/matches');
  };
  return (
    <motion.div className={classNames('default-state', className)} {...motionProps}>
      <div className='left-content'>
        <div className='texts-wrapper'>
          <Typography variant='body1'>Welcome to Hearthstone</Typography>
          <Typography variant='body4'>
            You’re in the best place to look for tenants or properties that match perfectly with each other.
            Start a matching session and set your preferences and let the AI do the rest. We use algorithms to
            ensure that all users find exactly what they want, skipping unnecessary conversations with agents
            and making most of everyone’s time.
          </Typography>
        </div>
        <Label
          className='start-matching-button'
          variant='special'
          size='large'
          onClick={onStartMatchingClick}>
          Start matching
        </Label>
      </div>
      <div className='right-content'></div>
    </motion.div>
  );
})`
  &.default-state {
    display: flex;
    width: 904px;
    align-items: flex-start;
    gap: 24px;
    flex-shrink: 0;

    border-radius: 16px;
    background: #fff;
    /* Shadow L */
    box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);

    .left-content {
      display: flex;
      padding: 48px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 24px;
      flex: 1 0 0;
      align-self: stretch;

      .start-matching-button {
        width: 100%;
      }

      .texts-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        align-self: stretch;
      }
    }

    .right-content {
      width: 440px;
      height: 440px;
      flex-shrink: 0;
      background-image: url('${pierre}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    }
  }
`;
