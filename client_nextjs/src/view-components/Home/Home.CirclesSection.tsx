import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Typography } from '../../components/Typography.tsx';

const HomeCirclesSection = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames(className, 'home-circle-section')}>
      <div className='section-wrapper'>
        <div className='circle'>
          <p className='title'>Enter your match preferences</p>
          <Typography className='description' variant='body4'>
            Add your match preferences by selecting what you are looking for from your future house/tenant.
          </Typography>
        </div>
        <div className='circle'>
          <p className='title'>Explore potential matches and match with them</p>
          <Typography className='description' variant='body4'>
            Review your results generated with the help of AI based on your matching score.
          </Typography>
        </div>
        <div className='circle'>
          <p className='title'>Message and engage with your perfect match.</p>
          <Typography className='description' variant='body4'>
            Once the other half accepts your match request, you will be able to engage with them via messages.
          </Typography>
        </div>
        <div className='circle'>
          <p className='title'>Sign the final documents and close the deal</p>
          <Typography className='description' variant='body4'>
            Generate the final documents and get ready to finalise the deal directly from the platform.
          </Typography>
        </div>
      </div>
    </div>
  );
})`
  &.home-circle-section {
    display: grid;
    justify-content: center;

    .section-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      max-width: 1440px;
      padding: 48px calc(36px + 24px);
      box-sizing: border-box;
      justify-content: center;

      .circle {
        aspect-ratio: 1 / 1;
        display: flex;
        width: auto;
        padding: 64px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;

        box-sizing: border-box;
        border-radius: 50%;
        position: relative;
        overflow: clip;
        margin-inline: -24px;

        &:not(:nth-of-type(1)) {
          &:after {
            position: absolute;
            content: '';
            background: white;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            right: calc(100% - 48px);
          }
        }

        &:nth-of-type(1) {
          background: #eee0d3;
        }

        &:nth-of-type(2) {
          background: linear-gradient(180deg, #d9e9ff 0%, #c0daff 100%), #c4b1a3;
        }

        &:nth-of-type(3) {
          background: linear-gradient(180deg, #e5155a 0%, #b4263b 100%), #c4b1a3;
          color: #fff;
        }

        &:nth-of-type(4) {
          background: linear-gradient(180deg, #184d6d 0%, #0d2a38 100%);
          color: #fff;
        }

        .title {
          text-align: center;
          font-family: Roobert, serif;
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          line-height: 28px;
          margin: 0;
        }

        .description {
          text-align: center;
        }
      }
    }
  }
`;

export default HomeCirclesSection;
