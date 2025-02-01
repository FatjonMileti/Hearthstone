import { Typography } from '../../components';
import { Label } from '../../components';
import { Notification } from './notificationInterfaces';
import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';

export interface NotificationProps extends Notification, Omit<HTMLAttributes<HTMLDivElement>, 'title'> {}

export const NotificationItem = styled(
  ({ className, title, description, created_at, action }: NotificationProps) => (
    <div className={`notification-item ${className}`}>
      <div>
        <div className='title-date-wrapper'>
          <Typography className='notification-title' variant='body5'>
            {title}
          </Typography>
          <Typography variant='body5' className='notification-date'>
            {created_at}
          </Typography>
        </div>
        <Typography className='notification-description' variant='body6'>
          {description}
        </Typography>
      </div>
      {action && (
        <Label variant='secondary' size='small'>
          {action}
        </Label>
      )}
    </div>
  )
)`
  &.notification-item {
    display: grid;
    padding: 16px 24px;
    gap: 8px;

    border-radius: 4px;

    .title-date-wrapper {
      display: flex;
      justify-content: space-between;
      gap: 8px;

      .notification-title {
        color: #0d2a38;
        font-weight: 700;
        line-height: 24px;
      }
      .notification-date {
        color: #a7a7a7;
        font-weight: 500;
        line-height: 24px;
      }
    }

    .notification-description {
      color: #0d2a38;
      font-weight: 500;
      line-height: 20px;
    }
  }
`;
