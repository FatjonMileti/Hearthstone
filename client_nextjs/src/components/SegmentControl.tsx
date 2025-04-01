import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Typography } from './Typography';

export interface SegmentControlProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  active?: boolean;
  counter?: number;
}
export const SegmentControl = styled(
  ({ className, label, active, counter, ...rest }: SegmentControlProps) => {
    return (
      <div className={classNames('segment-control', className, { active })} {...rest}>
        <Typography className='label' variant='body5'>
          {label}
        </Typography>
        {counter && <div className='counter'>{counter}</div>}
      </div>
    );
  }
)`
  &.segment-control {
    display: inline-flex;
    padding: 8px 16px;
    justify-content: center;
    align-items: center;
    gap: 8px;

    border-radius: 32px;

    .label {
      font-family: Roobert, serif;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 24px;
      color: #646464;
      transition: color 0.2s ease-in-out;
    }

    .counter {
      display: flex;
      width: 20px;
      height: 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border-radius: 50%;
      background-color: #e5155a;
      color: #ffffff;

      font-family: Roobert, serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
    }

    &:hover {
      cursor: pointer;
      .label {
        color: #0d2a38;
      }
    }

    &.active {
      outline: 1px solid #c0daff;
      .label {
        color: #0d2a38;
      }
    }
  }
`;
