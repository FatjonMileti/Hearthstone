import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Typography } from '../../components/index';
import { RoundAction } from '../../components/RoundAction';
import { notifications } from './notificationsData';
import { UnreadNotifications } from './UnreadNotifications';
import { ReadNotifications } from './ReadNotifications';

interface NotificationsProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const Notifications = styled(({ className, onClose }: NotificationsProps) => {
  return (
    <div className={`notifications ${className}`}>
      <div className='notifications-header'>
        <Typography className='title' variant='body2'>
          Notifications
        </Typography>
        <RoundAction icon='close' onClick={onClose} />
      </div>
      <div className='notifications-body'>
        <UnreadNotifications notifications={notifications.filter((notification) => !notification.viewed)} />
        <ReadNotifications notifications={notifications.filter((notification) => notification.viewed)} />
      </div>
    </div>
  );
})`
  &.notifications {
    display: grid;
    overflow-y: auto;

    .notifications-header {
      display: flex;
      padding: 24px;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f3f4f5;

      .title {
        color: #0d2a38;
        font-weight: 600;
        line-height: 48px;
      }
    }

    .notifications-body {
      display: grid;
      padding: 24px;
      gap: 16px;
    }
  }
`;
