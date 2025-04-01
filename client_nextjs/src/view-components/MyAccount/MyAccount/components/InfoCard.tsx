import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Icon } from '../../../../components/index';
import { Typography } from '../../../../components/index';
import { IconProps } from '../../../../components/Icon';

interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: IconProps['icon'];
}

export const InfoCard = styled(({ className, icon, title, description }: InfoCardProps) => {
  return (
    <div className={`info-card ${className}`}>
      <Icon icon={icon} size={48}></Icon>
      <div className='content'>
        <Typography variant='body5' className='title'>
          {title}
        </Typography>
        <Typography variant='body5' className='description'>
          {description}
        </Typography>
      </div>
    </div>
  );
})`
  &.info-card {
    display: grid;
    padding: 24px;
    gap: 8px;
    max-width: 324px;
    height: min-content;
    border-radius: 16px;
    box-sizing: border-box;
    background-color: #f3f4f5;

    .content {
      display: grid;
      gap: 4px;

      .title {
        color: #0d2a38;
        font-weight: 700;
        line-height: 24px;
      }

      .description {
        color: #646464;
        font-weight: 500;
        line-height: 20px;
      }
    }
  }
`;
