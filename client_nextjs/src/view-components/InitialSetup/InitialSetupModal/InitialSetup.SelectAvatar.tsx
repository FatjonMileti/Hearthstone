import { styled } from '@mui/system';

import { ArrowButton } from '../../../components/ArrowButton';
import { Typography } from '../../../components/Typography';
import { Avatar } from '../../../components/Avatar';

import { avatars } from '../../HomeLoggedIn/avatars';
import classNames from 'classnames';
import { Label } from '../../../components/Label';
import { Icon } from '../../../components/Icon';
import { HTMLMotionProps, motion } from 'framer-motion';

export interface SelectAvatarProps extends HTMLMotionProps<'div'> {
  onNext: () => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
}

export const SelectAvatar = styled(
  ({ className, avatar: avatarString, setAvatar: setAvatarString, onNext, ...rest }: SelectAvatarProps) => {
    const avatar = parseInt(avatarString);
    const setAvatar = (avatar: number) => setAvatarString(avatar.toString());

    const handleNextClick = () => {
      setAvatar(avatar === avatars.length - 1 ? 0 : avatar + 1);
    };

    const handlePrevClick = () => {
      setAvatar(avatar === 0 ? avatars.length - 1 : avatar - 1);
    };

    return (
      <motion.div className={classNames('select-avatar', className)} {...rest}>
        <div className='select-avatar-content'>
          <div className='select-avatar-header'>
            <Typography variant='body2' className='title'>
              Welcome to Hearthstone
            </Typography>
            <Typography variant='body4' className='description'>
              Select an avatar to start building your trust score. The higher your trust score is, the more
              accurate matches will be shown to you.
            </Typography>
          </div>

          <div className='avatars-list'>
            {avatars.map(({ image }, avatarIndex) => {
              const active = avatarIndex === avatar;
              return (
                <Avatar
                  image={image}
                  animate={{
                    x: `calc(${-100 * avatar}% - ${avatar * 24}px)`,
                    opacity: avatarIndex === avatar ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setAvatar(avatarIndex)}
                  key={avatarIndex}
                  className={classNames({ active })}
                />
              );
            })}
          </div>
        </div>

        <div className='section-footer'>
          <div />
          <div className='action-buttons'>
            <ArrowButton size='large' direction='left' onClick={handlePrevClick} />

            <ArrowButton size='large' direction='right' onClick={handleNextClick} />
          </div>

          <Label size='large' className='next-button' onClick={onNext}>
            Next <Icon icon='arrow-right' />
          </Label>
        </div>
      </motion.div>
    );
  }
)`
  &.select-avatar {
    box-sizing: border-box;
    display: grid;
    overflow-x: hidden;
    justify-items: center;
    grid-template-rows: auto min-content;
    height: 100%;

    .select-avatar-content {
      display: grid;
      justify-items: center;
      width: 100%;
      padding: 14px 36px;
      align-content: center;

      .select-avatar-header {
        max-width: 670px;
        .title,
        .description {
          text-align: center;
        }

        .description {
          text-align: center;
          margin-top: 16px;
        }
      }

      .avatars-list {
        margin-top: 48px;
        display: flex;
        width: 400px;
        column-gap: 24px;
        padding: 48px;

        .avatar {
          position: relative;
          width: 400px;
          height: 400px;
          overflow: hidden;
          flex-shrink: 0;
          opacity: 0.5;
          cursor: pointer;
          box-sizing: border-box;

          &.active {
            opacity: 1;
            position: relative;
            z-index: 1;

            border: 4px solid #e5155a;
            /* Large card shadow */
            box-shadow: 0 4px 48px 0 rgba(0, 0, 0, 0.04);
          }
        }
      }
    }

    .section-footer {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      justify-content: space-between;
      padding: 24px 36px;
      box-sizing: border-box;

      .action-buttons {
        display: flex;
        column-gap: 24px;
        justify-content: center;
        align-items: center;
      }

      .next-button {
        justify-self: flex-end;
      }
    }
  }
`;
