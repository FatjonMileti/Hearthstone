import { Typography } from '../../components';
import { NotificationItem } from './NotificationItem';
import { Notification } from './notificationInterfaces';
import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';

interface UnreadNotificationsProps extends HTMLAttributes<HTMLDivElement> {
  notifications: Notification[];
}

export const UnreadNotifications = styled(({ className, notifications }: UnreadNotificationsProps) => (
  <div className={`unread-section ${className}`}>
    <Typography className='unread' variant='body5'>
      Unread
    </Typography>
    {notifications.map((notification, index) => (
      <NotificationItem {...notification} key={index} />
    ))}
  </div>
))`
  &.unread-section {
    display: grid;
    gap: 8px;

    .unread {
      color: #0d2a38;
      font-weight: 700;
      line-height: 24px;
    }

    .notification-item {
      border-left: 4px solid #e5155a;
      background: #f3f4f5;
    }
  }
`;
