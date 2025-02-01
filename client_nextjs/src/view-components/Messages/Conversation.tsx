import { styled } from '@mui/system';
import { Typography } from '../../components';
import { IRoom } from './messages.interface';
import { Avatar } from '../../components';
import { getAvatarFormIndex } from '../HomeLoggedIn/avatars';
import moment from 'moment';
import { useUserStore } from '../../globalState/user';
import classNames from 'classnames';
import { Role } from '../../enums';
import { useProfileStore } from '../../globalState/profile';

interface ConversationProps {
  joinRoom: (roomId: IRoom) => void;
  room: IRoom;
  className?: string;
  active?: boolean;
}

export const Conversation = styled(({ joinRoom, room: room, className, active }: ConversationProps) => {
  const userStore = useUserStore();
  const profileStore = useProfileStore();

  const avatarKey =
    userStore.userDetails?.user_id === room?.author?._id ? room?.participant?.avatar : room?.author?.avatar;

  const avatar = getAvatarFormIndex(avatarKey);

  const fullName =
    userStore.userDetails?.user_id === room?.author?._id
      ? `${room.participant?.first_name} ${room.participant?.last_name}`
      : `${room.author?.first_name} ${room.author?.last_name}`;

  return (
    <div className={`conversation ${className} ${active ? 'active' : ''}`} onClick={() => joinRoom(room)}>
      <div className='avatar-and-unseen-messages-wrapper'>
        {profileStore.role === Role.Tenant && room.property && (
          <div
            className='property-image'
            style={{
              backgroundImage: `url(${room.property.property_images?.[0]?.link})`
            }}>
            <Avatar
              image={avatar}
              className={classNames({
                Hearthstone: avatarKey === 'Hearthstone'
              })}
            />
          </div>
        )}

        {(profileStore.role === Role.Landlord || !room.property) && (
          <Avatar
            image={avatar}
            className={classNames({
              Hearthstone: avatarKey === 'Hearthstone'
            })}
          />
        )}

        {room.unseen_messages !== undefined && room.unseen_messages > 0 && (
          <span className='unseen-messages-nr'>{room.unseen_messages}</span>
        )}
      </div>

      <div className='details'>
        <Typography variant='body4' className='property'>
          {fullName === 'Hearthstone Agent' ? 'Hearthstone' : fullName}
        </Typography>
        <Typography variant='body6' style={{ color: '#A7A7A7' }}>
          {fullName === 'Hearthstone Agent'
            ? 'Always a perfect match'
            : room.last_message?.created_at &&
              moment(room.last_message.created_at).format('dddd, MMMM Do YYYY')}
        </Typography>
      </div>
    </div>
  );
})`
  &.conversation {
    display: flex;
    column-gap: 16px;
    padding: 16px;
    align-items: center;
    box-sizing: border-box;
    border-radius: 4px 0 0 4px;
    cursor: pointer;

    &.active {
      border-radius: 4px 0 0 4px;
      border-left: 4px solid #184d6d;
      background: #f3f4f5;
    }

    .avatar-and-unseen-messages-wrapper {
      display: flex;
      position: relative;

      .avatar {
        width: 48px;
        height: 48px;

        &.Hearthstone {
          background-size: 32px 32px;
          background-color: #b4263b;
        }
      }

      .property-image {
        display: grid;
        justify-content: flex-end;
        height: 48px;
        width: 48px;
        background-size: cover;
        background-position: center;
        border-radius: 50%;

        .avatar {
          width: 20px;
          height: 20px;
        }
      }

      .unseen-messages-nr {
        height: 20px;
        width: 20px;
        color: white;
        background-color: #e5155a;
        border-radius: 50%;
        position: absolute;
        z-index: 1;
        right: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        font-weight: 500;
        font-size: 10px;
        line-height: 16px;
        font-family: 'Roobert';
      }
    }

    .details {
      display: flex;
      flex-direction: column;
      row-gap: 8px;

      .property {
        color: #0d2a38;
        font-weight: 700;
      }
    }
  }
`;
