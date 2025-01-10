import { styled } from '@mui/system';
import { IconButton } from './IconButton';
import { HTMLAttributes } from 'react';

import classNames from 'classnames';
import { Icon } from './Icon';
import { IconNames } from '../assets/icon';

interface SocialAccountButton extends HTMLAttributes<HTMLButtonElement> {
  icon: IconNames;
}

export const SocialAccountButton = styled(({ className, icon }: SocialAccountButton) => {
  return (
    <IconButton className={classNames('social-account-button', className)}>
      <Icon icon={icon} />
    </IconButton>
  );
})`
  &.social-account-button {
    width: 48px;
    height: 48px;
    box-sizing: border-box;
    background-color: transparent;
    &:hover {
      background-color: #0d2a38;
      .icon {
        color: white;
      }
    }
    .icon {
      height: 16px !important;
      width: 16px !important;
      color: #0d2a38;
    }
  }
`;
