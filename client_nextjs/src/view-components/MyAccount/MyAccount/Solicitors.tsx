import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../components/Typography';

export const Solicitors = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`solicitors ${className}`}>
      <Typography variant='body3'>Solicitors</Typography>
    </div>
  );
})`
  &.solicitors {
    display: grid;
    row-gap: 24px;
    .body-content {
      display: grid;
      row-gap: 32px;
      .term {
        display: grid;
        row-gap: 16px;
        .title {
          font-weight: 700;
        }
      }
    }
  }
`;
