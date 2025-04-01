import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Typography } from './Typography';

interface MenuCounterProps extends HTMLAttributes<HTMLDivElement> {
  counter: number;
}

export const MenuCounter = styled(({ className, counter }: MenuCounterProps) => {
  return (
    <div className={classNames('menu-counter', className)}>
      <Typography className='menu-counter-number' variant='body6'>
        {counter}
      </Typography>
    </div>
  );
})`
  &.menu-counter {
    border-radius: 50%;
    background: #e5155a;
    display: flex;
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    .menu-counter-number {
      color: #fff;
      text-align: center;
      font-weight: 700;
      line-height: 20px;
    }
  }
`;
