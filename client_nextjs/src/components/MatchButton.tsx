import { styled } from '@mui/system';
import { IconButton, IconButtonProps } from './IconButton';
import { Icon } from './Icon';
import classNames from 'classnames';

export const MatchButton = styled(({ className, disabled, ...props }: IconButtonProps) => {
  return (
    <IconButton
      className={classNames('match-button', className, { disabled })}
      disabled={disabled}
      {...props}>
      <Icon icon='like' />
    </IconButton>
  );
})`
  &.match-button {
    background-color: #184d6d;
    transition: all 0.2s ease-in-out;

    :hover {
      background-color: #408140;
    }
    .icon {
      color: white;
    }

    &.size-large {
      padding: 20px;
      .icon {
        height: 48px !important;
        width: 48px !important;
        flex-shrink: 0;
      }
    }

    &.size-medium {
      padding: 16px;
      .icon {
        height: 24px !important;
        width: 24px !important;
        flex-shrink: 0;
      }
    }

    &.disabled {
      cursor: not-allowed;
      background-color: #a7a7a7;
      color: white;
      user-select: none;
    }
  }
`;
