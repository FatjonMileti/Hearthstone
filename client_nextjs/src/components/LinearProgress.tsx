import { LinearProgress as MuiLinearProgress, linearProgressClasses } from '@mui/material';
import { styled } from '@mui/system';

export const LinearProgress = styled(MuiLinearProgress)`
  height: 8px;
  border-radius: 5px;
  &.${linearProgressClasses.colorPrimary} {
    background-color: #e7e7e7;
  }
  & .${linearProgressClasses.bar} {
    border-radius: 5px;
    background-color: #e5155a;
  }
`;
