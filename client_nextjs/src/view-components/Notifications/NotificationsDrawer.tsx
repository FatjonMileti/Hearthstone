// @ts-nocheck
import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Drawer } from '../../components/Drawer';
import classNames from 'classnames';
import { Notifications } from './Notifications';

interface NotificationsDrawerProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen: (open: boolean) => void;
}

export const NotificationsDrawer = styled(({ className, ...otherProps }: NotificationsDrawerProps) => {
  const { open, setOpen } = otherProps || React.useState(true);
  return (
    <Drawer open={open} setOpen={setOpen} className={classNames(className, 'notifications-drawer')}>
      <Notifications onClose={() => setOpen(false)} />
    </Drawer>
  );
})`
  &.notifications-drawer {
  }
`;
