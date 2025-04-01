import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../components/Typography';
import { FrequentlyAskedQuestion } from './components/HelpAndSuport.FrequentlyAskedQuestion';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';

export const HelpAndSupport = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`help-and-support ${className}`}>
      <div className='left-part'>
        <Typography variant='body2'>FAQ</Typography>
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
        <FrequentlyAskedQuestion
          title='This is a FAQ heading.'
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
           ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
           nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
           in culpa qui officia deserunt mollit anim id est laborum.'
        />
      </div>
      <div className='right-part'>
        <div className='top-section'>
          <Typography variant='body4' className='title'>
            Reach out
          </Typography>
          <Typography variant='body6'>
            In case you need assistance you can reach out to a Hearthstone representative over phone using the
            buttons below
          </Typography>
        </div>
        <div className='bottom-section'>
          <a href='tel:123-456-7890'>
            <Button startIcon={<Icon icon='phone' size={20} />}>Call a representative</Button>
          </a>
          <Typography variant='body6'>
            You might find valuable information in the FAQ section in your account.
          </Typography>
          <Button variant='secondary'>FAQs</Button>
        </div>
      </div>
    </div>
  );
})`
  &.help-and-support {
    display: grid;
    grid-template-columns: auto max-content;
    column-gap: 24px;

    .left-part {
      display: grid;
      gap: 24px;
    }
    .right-part {
      display: grid;
      align-content: flex-start;
      padding: 24px;
      box-sizing: border-box;
      max-width: 324px;
      height: min-content;
      gap: 24px;

      border-radius: 12px;
      background-color: #f3f4f5;

      .top-section {
        display: grid;
        gap: 8px;

        .title {
          font-weight: 700;
        }
      }
      .bottom-section {
        display: grid;
        gap: 16px;

        button {
          width: 100%;
          gap: 8px;
        }
      }
    }
  }
`;
