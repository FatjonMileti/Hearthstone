import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { IconProps, Icon } from '../../../components/Icon.tsx';
import { MenuCounter } from '../../../components/index.ts';

interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  active?: boolean;
  icon: IconProps['icon'];
  counter?: number;
}

export const MenuItem = styled(({ className, label, active = false, icon, counter }: MenuItemProps) => {
  return (
    <div className={classNames('menu-item', className, { active })}>
      <Icon icon={icon} />
      <span className='label'>{label}</span>
      {!!counter && <MenuCounter counter={counter} />}
    </div>
  );
})`
  &.menu-item {
    display: flex;
    width: 144px;
    padding: 36px 16px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    box-sizing: border-box;
    transition: border-bottom-width 0.2s ease-in-out;
    color: #646464;

    .label {
      font-family: Roobert, serif;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 24px;
      transition: color 0.2s ease-in-out;
    }

    &:hover {
      cursor: pointer;
      color: #0d2a38;
    }

    &.active {
      border-bottom: 1px solid #0d2a38;
      margin-bottom: -1px;
      color: #0d2a38;
    }
  }
`;
