import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes, useRef } from 'react';

import { RoundAction } from '../../../components/RoundAction.tsx';
import { NewsCard } from './NewsCard.tsx';

import news1 from './images/news1.png';
import news2 from './images/news2.png';
import news3 from './images/news3.png';
import news4 from './images/news4.png';

import { Typography } from '../../../components/Typography.tsx';
import { Icon } from '../../../components/Icon.tsx';

export interface News {
  image: string;
}

const newsList: News[] = [
  {
    image: news1
  },
  {
    image: news2
  },
  {
    image: news3
  },
  {
    image: news4
  },
  {
    image: news1
  },
  {
    image: news2
  },
  {
    image: news3
  },
  {
    image: news4
  }
];

export const DailyNewss = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (ref.current) {
      ref.current.scrollLeft -= ref.current.clientWidth;
    }
  };

  const scrollRight = () => {
    if (ref.current) {
      ref.current.scrollLeft += ref.current.clientWidth;
    }
  };

  return (
    <div className={classNames('daily-news', className)}>
      <div className='section-header'>
        <div className='header-left-content'>
          <Icon icon='newspaper' />
          <Typography className='section-title' variant='body3'>
            Daily news
          </Typography>
        </div>
        <div className='arrow-buttons'>
          <RoundAction icon='chevron-left' onClick={scrollLeft} />
          <RoundAction onClick={scrollRight} />
        </div>
      </div>
      <div className='section-body' ref={ref}>
        {newsList.map((news, newsKey) => (
          <NewsCard key={newsKey} news={news} />
        ))}
      </div>
    </div>
  );
})`
  &.daily-news {
    display: grid;
    row-gap: 24px;
    padding: 24px 36px 48px 36px;
    background: #fff;
    box-sizing: border-box;
    width: 100%;

    .section-header {
      display: flex;
      justify-content: space-between;

      .header-left-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-title {
        font-weight: 700;
        font-family: Roobert, serif;
        color: #0d2a38;
      }

      .arrow-buttons {
        display: flex;
        column-gap: 8px;
      }
    }

    .section-body {
      display: flex;
      column-gap: 24px;

      width: 100%;
      overflow-x: auto;
      scroll-behavior: smooth;

      padding: 24px 36px 48px 36px;
      margin: -24px -36px -48px -36px;

      ::-webkit-scrollbar {
        display: none;
      }
    }
  }
`;
