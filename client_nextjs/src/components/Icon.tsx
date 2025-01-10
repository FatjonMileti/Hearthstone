import IcoMoon, { IconProps as ReactIconProps } from 'react-icomoon';
import iconSet from '../assets/selection.json';
import { styled } from '@mui/system';

import { IconNames } from '../assets/icon';

export interface IconProps extends Omit<ReactIconProps, 'icon'> {
  icon: IconNames;
}

export const Icon = styled(({ size = 24, className, ...props }: IconProps) => {
  return <IcoMoon className={`icon ${className}`} iconSet={iconSet} size={size} {...props} />;
})`
  &.icon {
    flex-shrink: 0;
  }
`;
