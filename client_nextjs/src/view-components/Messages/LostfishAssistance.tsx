import { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { Avatar, Icon, Label, Typography } from '../../components/index';
import { getAvatarFormIndex } from '../HomeLoggedIn/avatars';
import { useUserStore } from '../../globalState/user';
import { IRoom } from './messages.interface';

interface HearthstoneAssistanceProps extends HTMLAttributes<HTMLDivElement> {
  room: IRoom;
}

export const HearthstoneAssistance = styled(({ className, room }: HearthstoneAssistanceProps) => {
  const userStore = useUserStore();
  const avatarKey =
    userStore.userDetails?.user_id === room?.author?._id ? room?.participant?.avatar : room?.author?.avatar;

  const avatar = getAvatarFormIndex(avatarKey);

  return room && !room?.property ? (
    <div className={`Hearthstone-assistance ${className}`}>
      <div className='section'>
        <div className='logo-title-wrapper'>
          <Avatar image={avatar} className='Hearthstone' />
          <Typography variant='body3' className='title'>
            Hearthstone
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          Our goal is to revolutionise the property industry by using technology and data to empower and
          inform customers in the buying, selling, and renting process.
        </Typography>
      </div>
      <div className='line' />
      <div className='section'>
        <div className='icon-title-wrapper'>
          <Icon icon='help' />
          <Typography variant='body4' className='title'>
            Assistance
          </Typography>
        </div>
        <Typography variant='body4' className='description'>
          In case you need assistance you can write a message in our chat or reach out to a Hearthstone
          representative over phone using the contact below
        </Typography>
      </div>
      <div className='buttons'>
        <a href='tel:+123456789' style={{ textDecoration: 'none', color: 'inherit' }}>
          <Label variant='secondary' size='large'>
            <Icon icon='phone' />
            Call a representative
          </Label>
        </a>
        <Label variant='secondary' size='large'>
          Frequently asked questions
        </Label>
      </div>
    </div>
  ) : (
    <div />
  );
})`
  &.Hearthstone-assistance {
    border-radius: 16px;
    display: grid;
    padding: 24px;
    gap: 24px;
    box-sizing: border-box;
    align-content: flex-start;
    height: 100%;
    //background-color: #fff;

    .section {
      display: grid;
      gap: 16px;

      .logo-title-wrapper {
        display: flex;
        gap: 16px;
        align-items: center;

        .Hearthstone {
          background-size: 32px 32px;
          background-color: #b4263b;
        }

        .title {
          color: #0d2a38;
          font-weight: 900;
        }
      }

      .icon-title-wrapper {
        display: flex;
        gap: 8px;

        .title {
          color: #0d2a38;
          font-weight: 900;
          font-size: 18px;
        }
      }

      .description {
        color: #0d2a38;
        font-weight: 500;
      }
    }

    .line {
      background-color: #e7e7e7;
      height: 1px;
    }

    .buttons {
      display: grid;
      gap: 16px;

      .label {
        width: 100%;
      }
    }
  }
`;
