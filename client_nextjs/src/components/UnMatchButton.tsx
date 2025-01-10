import { styled } from '@mui/system';
import { IconButton, IconButtonProps } from './IconButton';
import { Icon } from './Icon';
import classNames from 'classnames';

export const UnMatchButton = styled(({ className, ...props }: IconButtonProps) => {
  return (
    <IconButton className={classNames('match-button', className)} {...props}>
      <Icon icon='dislike' />
    </IconButton>
  );
})`
  &.match-button {
    border: 2px solid #e5155a;
    box-sizing: border-box;

    transition: all 0.2s ease-in-out;

    :hover {
      background-color: #b4263b;
      border: 2px solid #b4263b;
      .icon {
        color: white;
      }
    }
    .icon {
      color: #e5155a;
    }

    &.size-large {
      padding: 18px;
      .icon {
        height: 48px !important;
        width: 48px !important;
        flex-shrink: 0;
      }
    }

    &.size-medium {
      padding: 14px;
      .icon {
        height: 24px !important;
        width: 24px !important;
        flex-shrink: 0;
      }
    }
  }
`;
