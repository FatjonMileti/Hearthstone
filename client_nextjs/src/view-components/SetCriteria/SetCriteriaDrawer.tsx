// @ts-nocheck
import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Drawer } from '../../components/Drawer';
import { SetCriteria } from './SetCriteria/SetCriteria';

import setCriteriaBackground from '../Home/home-background.png';

interface SetCriteriaProps extends HTMLAttributes<HTMLDivElement> {
  afterRefineSearch?: () => void;
  open?: boolean;
  setOpen: (open: boolean) => void;
}

export const SetCriteriaDrawer = styled(
  ({ className, afterRefineSearch = () => {}, ...otherProps }: SetCriteriaProps) => {
    const { open, setOpen } = otherProps || React.useState(true);

    return (
      <Drawer open={open} setOpen={setOpen} className={classNames(className, 'criteria-drawer')}>
        <SetCriteria onClose={() => setOpen(false)} afterRefineSearch={afterRefineSearch} />
      </Drawer>
    );
  }
)`
  &.criteria-drawer {
    .drawer-body {
      z-index: 1;
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 398px;
        background: url(${setCriteriaBackground}), lightgray 50% / cover no-repeat;
        opacity: 0.05;

        background-size: cover;
        background-position-y: center;
        z-index: -1;
      }

      .criteria-container {
        .criteria-header {
          padding: 20px 36px;
        }
        .criteria-tabs-bar {
          padding: 0 36px;
        }
        .criteria-body {
          padding: 36px;
        }
      }
    }
  }
`;
