import { styled } from '@mui/system';
import { HTMLMotionProps, motion } from 'framer-motion';
import classNames from 'classnames';
import { Avatar } from './Avatar';
import { Typography } from './Typography';
import { Label } from './Label';
import { Icon } from './Icon';

export interface TenantCardProps extends HTMLMotionProps<'div'> {
  name: string;
  inView: boolean;
  avatar: string;
  percentage?: string;
  onViewProfileClick?: () => void;
  chatWith?: () => void;
  size?: 'medium' | 'large';
  matched?: boolean;
  awaitingMatch?: boolean;
}

export const TenantCard = styled(
  ({
    className,
    size = 'medium',
    name,
    inView,
    avatar,
    percentage,
    matched = false,
    awaitingMatch = false,
    onViewProfileClick = () => {},
    chatWith = () => {},
    ...rest
  }: TenantCardProps) => {
    const active = inView;
    return (
      <motion.div
        className={classNames('tenant-card', className, `size-${size}`, { active, inView, matched })}
        {...rest}>
        <Avatar image={avatar} className={`${active ? 'active' : ''}`} />

        <div className='action-buttons'>
          <div className='tenant-details'>
            {!matched && !awaitingMatch && (
              <Typography variant='body4' className='tenant-match-percentage'>
                {percentage ?? '34'}% Match rate
              </Typography>
            )}

            <Typography variant='body2' className='tenant-name'>
              {name}
            </Typography>

            {awaitingMatch && (
              <div className='awaiting-match'>
                <Icon icon='watch' />
                <Typography className='awaiting-match-text' variant='body3'>
                  Awaiting match
                </Typography>
              </div>
            )}
            {matched && (
              <div className='matched-indicator'>
                <Icon icon='like' />
                <Typography variant='body5'>Matched</Typography>
              </div>
            )}
          </div>
          {!matched && (
            <Label
              size='large'
              variant='secondary'
              className='view-profile-button'
              onClick={onViewProfileClick}>
              View profile
            </Label>
          )}

          {matched && (
            <Label size='medium' className='message-button' onClick={chatWith}>
              <Icon icon='email' />
              Message
            </Label>
          )}
        </div>
      </motion.div>
    );
  }
)`
  &.tenant-card {
    padding: 24px;
    display: grid;
    row-gap: 24px;
    height: auto;
    min-height: 452px;
    flex-shrink: 0;
    align-content: space-between;
    opacity: 0.5;
    width: 440px;
    box-sizing: border-box;
    justify-items: center;

    &.size-medium {
      width: 324px;
      .avatar {
        width: 276px;
        height: 276px;
      }
    }

    &.inView {
      z-index: 1;
      opacity: 1;
      background-color: white;
      border-radius: 16px;

      /* Card Shadow */
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
    }

    &.matched {
      border: 2px solid #e5155a;

      /* Match Shadow */
      box-shadow: 0 16px 32px 0 rgba(229, 21, 90, 0.25);
    }

    .avatar {
      position: relative;
      width: 280px;
      height: 280px;
      overflow: hidden;
      flex-shrink: 0;
      cursor: pointer;
      box-sizing: border-box;

      &.active {
        box-shadow: 0 7.7px 23.2px 0 rgba(0, 0, 0, 0.25);
      }
    }

    &.inView {
      .action-buttons {
        opacity: 1;
      }
    }
    .action-buttons {
      width: 100%;
      display: flex;
      justify-content: space-between;
      column-gap: 16px;
      align-items: center;
      opacity: 0;

      .tenant-details {
        display: grid;
        row-gap: 4px;

        align-items: center;

        .tenant-name {
          font-weight: 700;
          line-break: anywhere;
        }

        .awaiting-match {
          display: flex;
          column-gap: 4px;
            align-items: center;
          color: #a7a7a7;
          .awaiting-match-text {
            font-weight: 700;
          }
        }

        .tenant-match-percentage {
          color: #c4b1a3;
          font-weight: 700;
        }

        .matched-indicator {
          display: flex;
          column-gap: 4px;
          align-items: center;
          font-weight: 700;
          color: #e5155a;

          .icon {
            width: 16px !important;
            height: 16px !important;
          }
        }
      }

      .view-profile-button {
        flex-shrink: 0;
        padding: 16px 20px;
        height: 56px;
      }

      .message-button {
        flex-shrink: 0;
        padding: 16px 20px;
        height: 56px;
        .icon {
          width: 20px !important;
          height: 20px !important;
        }
      }
        
        .label {
            flex: 1;
        }
    }
  }
`;
