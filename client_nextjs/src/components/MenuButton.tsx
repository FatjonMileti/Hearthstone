import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';

interface MenuButtonProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}
export const MenuButton = styled(({ className, children, active = false }: MenuButtonProps) => {
  return (
    <div className={classNames(className, { active })}>
      {children}
      <div className='active-indicator' />
    </div>
  );
})`
  & {
    color: #0d2a38;
    text-align: center;
    font-family: Roobert, serif;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;

    display: grid;
    justify-items: center;
    row-gap: 4px;
    padding: 8px;

    :hover {
      color: #184d6d;
    }

    &.active {
      color: #184d6d;
      .active-indicator {
        background: #184d6d;
      }
    }

    .active-indicator {
      width: 24px;
      height: 2px;

      border-radius: 2px;
      background: transparent;
    }
  }
`;
