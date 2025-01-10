import { styled } from '@mui/system';
import { Typography } from './Typography';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

interface MatchScoreProps extends HTMLAttributes<HTMLDivElement> {}
export const MatchScore = styled(({ children, className }: MatchScoreProps) => {
  return (
    <div className={classNames('match-score', className)}>
      <Typography variant='body6' className='text'>
        {children}
      </Typography>
    </div>
  );
})`
  &.match-score {
    display: inline-flex;
    padding: 4px 0;
    justify-content: center;
    align-items: center;
    gap: 10px;

    .text {
      color: #e5155a;
      text-align: center;
      font-family: Roobert, serif;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 14px;
    }

    :hover {
      border-bottom: 1px solid #e5155a;
    }
  }
`;
