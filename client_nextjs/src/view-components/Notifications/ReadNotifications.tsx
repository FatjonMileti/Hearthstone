import { Typography } from '../../components';
import { NotificationItem } from './NotificationItem';
import { Notification } from './notificationInterfaces';
import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';

interface ReadNotificationsProps extends HTMLAttributes<HTMLDivElement> {
  notifications: Notification[];
}

export const ReadNotifications = styled(({ className, notifications }: ReadNotificationsProps) => (
  <div className={`read-section ${className}`}>
    <Typography className='read' variant='body5'>
      Read
    </Typography>
    {notifications.map((notification, index) => (
      <NotificationItem {...notification} key={index} />
    ))}
  </div>
))`
  &.read-section {
    display: grid;
    gap: 8px;

    .read {
      color: #0d2a38;
      font-weight: 700;
      line-height: 24px;
    }

    .notification-item {
      border-left: 4px solid #e7e7e7;
    }
  }
`;
