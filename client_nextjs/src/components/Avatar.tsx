import { styled } from '@mui/system';
import { HTMLMotionProps, motion } from 'framer-motion';
import { Icon } from './Icon';
import { ReactNode } from 'react';

export interface AvatarProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  image?: string;
  children?: ReactNode;
}
export const Avatar = styled(({ className, children, image, ...rest }: AvatarProps) => {
  return (
    <motion.div className={`avatar ${className}`} {...rest}>
      {children}
      {!image && <Icon icon='user' className='user-icon' />}
    </motion.div>
  );
})`
  &.avatar {
    height: 45px;
    width: 45px;
    border-radius: 50%;
    aspect-ratio: 1/1;

    background-image: url(${(props) => `"${props.image}"` || 'initial'});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-color: #f7f1e7;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    .user-icon {
      width: 50% !important;
      height: 50% !important;
      color: black;
    }
  }
`;
