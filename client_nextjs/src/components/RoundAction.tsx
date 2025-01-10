import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Icon, IconProps } from './Icon.tsx';

interface RoundActionProps extends HTMLAttributes<HTMLButtonElement> {
  inverted?: boolean;
  icon?: IconProps['icon'];
}

export const RoundAction = styled(
  ({ className, inverted = false, icon = 'chevron-right', ...rest }: RoundActionProps) => {
    return (
      <button className={classNames('round-action', className, { inverted })} {...rest}>
        <Icon icon={icon} />
      </button>
    );
  }
)`
  &.round-action {
    padding: 12px;
    outline: 1px solid #eee0d3;
    border: none;
    border-radius: 50%;
    box-sizing: border-box;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    background: unset;
    &:hover {
      outline-color: #c4b1a3;
    }

    .icon {
      color: #184d6d;
    }

    &.inverted {
      outline-color: #e7e7e7;
      &:hover {
        outline-color: #ffffff;
      }

      .icon {
        color: #ffffff;
      }
    }
  }
`;
