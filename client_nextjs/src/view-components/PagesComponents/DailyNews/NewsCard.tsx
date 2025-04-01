import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { News } from './DailyNews';
import { Label } from '../../../components/Label';
import { Icon } from '../../../components/Icon';
import { Typography } from '../../../components/Typography';

interface NewsCardProps extends HTMLAttributes<HTMLDivElement> {
  news: News;
}

export const NewsCard = styled(({ className }: NewsCardProps) => {
  return (
    <div className={classNames('news-card', className)}>
      <div className='image-cover'></div>

      <div className='news-card-body'>
        <div className='news-title-description-wrapper'>
          <Typography variant='body2' className='news-title'>
            What to expect from the housing market in the second half of 2024
          </Typography>

          <Typography variant='body4' className='news-description'>
            The mortgage rate lock-in effect, or the golden handcuff effect, kept any homeowners with
            extremely low mortgage rates from listing their...
          </Typography>
        </div>
        <div className='read-more-wrapper'>
          <Typography variant='body5' className='publication-date'>
            Published on 16/06/2024
          </Typography>
          <Label size='medium' variant='secondary'>
            Read more <Icon icon='arrow-right' />
          </Label>
        </div>
      </div>
    </div>
  );
})`
  &.news-card {
    width: 420px;
    border-radius: 16px;
    box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);
    overflow: clip;

    display: grid;
    flex-shrink: 0;

    .image-cover {
      height: 280px;
      background-image: ${(props) => `url(${props.news.image})`};
    }

    .news-card-body {
      display: flex;
      padding: 24px;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      align-self: stretch;
      background: #fff;

      .news-title-description-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        align-self: stretch;

        .news-title {
          font-size: 20px;
          font-weight: 700;
          line-height: 28px;
          font-family: Roobert, serif;

          align-self: stretch;
        }

        .news-description {
          font-family: Roobert, serif;
        }
      }

      .read-more-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;

        .publication-date {
          color: #646464;
        }
      }
    }
  }
`;
