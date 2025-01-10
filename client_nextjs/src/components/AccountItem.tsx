import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Icon, IconProps } from './Icon.tsx';
import { Typography } from './Typography.tsx';
import { MenuCounter } from './MenuCounter.tsx';

export interface AccountItemProps extends HTMLAttributes<HTMLDivElement> {
  icon: IconProps['icon'];
  label: string;
  active?: boolean;
  counter?: number;
}

export const AccountItem = styled(
  ({ className, icon, label, active = false, counter, ...rest }: AccountItemProps) => {
    return (
      <div className={classNames('account-item', className, { active })} {...rest}>
        <Icon icon={icon} />
        <Typography className='account-item-label' variant='body4'>
          {label}
        </Typography>
        {counter && <MenuCounter counter={counter} />}
      </div>
    );
  }
)`
  &.account-item {
    color: #184d6d;
    display: flex;
    align-items: center;
    column-gap: 8px;

    border-radius: 4px;
    padding: 12px;
    box-sizing: border-box;
    transition: background-color, border-left-color 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      background-color: #f3f4f5;
    }

    &.active {
      background-color: #f3f4f5;
      border-left: 4px solid #0d2a38;
      padding-left: 8px;
    }

    .account-item-label {
      font-weight: 700;
      flex: 1 0 0;
    }
  }
`;
