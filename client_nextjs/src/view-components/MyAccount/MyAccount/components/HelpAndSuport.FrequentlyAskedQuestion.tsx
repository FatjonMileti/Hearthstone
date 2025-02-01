import { useState } from 'react';
import { styled } from '@mui/system';

import { Typography } from '../../../components/Typography';
import { Icon } from '../../../components/Icon';
import classNames from 'classnames';

type FrequentlyAskedQuestionProps = {
  title: string;
  description: string;
  className?: string;
};

export const FrequentlyAskedQuestion = styled(
  ({ className, title, description }: FrequentlyAskedQuestionProps) => {
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

    const toggleDescription = () => {
      setIsDescriptionVisible(!isDescriptionVisible);
    };

    return (
      <div className={classNames('frequently-asked-question', className, { active: isDescriptionVisible })}>
        <div className='title-button' onClick={toggleDescription}>
          <Typography variant='body4' className='title'>
            {title}
          </Typography>
          <Icon icon={isDescriptionVisible ? 'chevron-up' : 'chevron-down'} size={24} />
        </div>
        {isDescriptionVisible && <Typography variant='body5'>{description}</Typography>}
      </div>
    );
  }
)`
  &.frequently-asked-question {
    display: grid;
    padding: 16px 0px;
    box-sizing: border-box;
    align-items: flex-start;
    gap: 16px;
    border-bottom: 1px solid #f7f1e7;

    &.active {
      border-bottom: 1px solid #c0daff;
    }

    .title-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .title {
        font-weight: 700;
      }
    }
  }
`;
