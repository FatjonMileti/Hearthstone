import { styled } from '@mui/system';
import { HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { Typography } from './Typography.tsx';
import { Icon } from './Icon.tsx';

enum State {
  default = 'default',
  filled = 'filled',
  inactive = 'inactive'
}

interface StepProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  state: 'default' | 'filled' | 'inactive';
  lastStep?: boolean;
  cta?: ReactNode;
}

export const Step = styled(({ className, title, description, state, lastStep = false, cta }: StepProps) => {
  return (
    <div className={classNames('step', className, `state-${state}`, { lastStep })}>
      <div className='left-part'>
        {state === State.filled && <Icon className='filled-icon' icon='checked' size={16} />}
        {state === State.default && <Icon className='default-icon' icon='dot' size={12} />}
        {state === State.inactive && <Icon className='default-icon' icon='dot' size={12} />}
        <div className='line' />
      </div>

      <div className='right-part'>
        <div className='title-and-description-wrapper'>
          <Typography variant='body4' className='step-title'>
            {title}
          </Typography>
          <Typography variant='body4' className='step-description'>
            {description}
          </Typography>
        </div>
        {state === 'default' && cta}
      </div>
    </div>
  );
})`
  &.step {
    display: flex;
    column-gap: 8px;
    .step-title {
      font-weight: 700;
      color: #184d6d;
    }

    .step-description {
      font-size: 14px;
      font-weight: 500;
      color: #184d6d;
    }

    &.state-default {
    }

    &.state-filled {
    }

    &.state-inactive {
      * {
        color: #646464;
      }
    }

    .filled-icon {
      color: white;
      background-color: #184d6d;
      border-radius: 50%;
      padding: 4px;
    }

    .default-icon {
      width: 12px;
      height: 12px;
      color: #184d6d;
      border-radius: 50%;
      padding: 6px;
      outline: 1px solid #184d6d;
    }

    .left-part {
      display: grid;
      grid-template-rows: min-content auto;
      justify-items: center;
      .line {
        background-color: #184d6d;
        width: 1px;
        display: flex;
      }
    }

    &.lastStep {
      .left-part {
        .line {
          display: none;
        }
      }
    }

    .right-part {
      padding-bottom: 16px;
      display: grid;
      row-gap: 8px;
    }
  }
`;
