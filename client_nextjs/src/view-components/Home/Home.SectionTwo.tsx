import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Typography } from '../../components/Typography';

import image from './video_screenshot.png';
import multimedia from './start.svg';
import config from '../../config';

export const SectionTwo = styled(
  React.forwardRef<HTMLDivElement>(({ className }: HTMLAttributes<HTMLDivElement>, ref) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement | null>(null);

    const handlePlayVideo = () => {
      setIsPlaying(true);
    };

    const handleStopVideo = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    };

    return (
      <div className={classNames('home-section-two', className)} ref={ref}>
        <div className='section-content'>
          {!isPlaying ? (
            <div className='content' onClick={handlePlayVideo}>
              <div className='multimedia'>
                <div className='icon' style={{ backgroundImage: `url("${multimedia}")` }} />
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={`${config.apiUrl}/api/video`}
              className='video-content'
              autoPlay
              onClick={handleStopVideo}
            />
          )}
        </div>
        <div className='title'>
          <Typography variant='body2' className='perfect-match'>
            We use <span className='perfect-match-red'>Artificial Intelligence </span>
            to reimagine the real estate industry.
          </Typography>
          <Typography variant='body4' className='description'>
            Our revolutionary new platform takes the stress out of finding selling or renting a home powered
            by AI it perfectly matches buyers and tenants with their dream homes.
            <br />
            From start to finish guides everyone through the process with ease delivering a calm and efficient
            experience. Saving your time money and hassle.
          </Typography>
        </div>
      </div>
    );
  })
)`
  &.home-section-two {
    display: grid;
    padding: 48px 36px;
    justify-items: center;
    align-items: center;
    gap: 48px;
    box-sizing: border-box;
    background-color: #fff;
    opacity: 1;
    position: relative;
    z-index: 1;

    .title {
      display: grid;
      justify-items: center;
      gap: 24px;

      .perfect-match {
        font-weight: 600;
        line-height: 48px;

        .perfect-match-red {
          color: #e5155a;
        }
      }

      .description {
        text-align: center;
        font-weight: 500;
      }
    }
    .section-content {
      display: grid;
      align-items: center;
      gap: 48px;
      border-radius: 16px;
      max-width: 1136px;
      width: 100%;
      box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);
      cursor: pointer;

      .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 24px;
        background: url(${image});
        background-size: cover;
        aspect-ratio: 1.77 / 1;
        background-repeat: no-repeat;
        border-radius: 16px;
        gap: 16px;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;

        .multimedia {
          border-radius: 50%;
          border: 2px solid #e7e7e7;
          padding: 10px;
          box-sizing: border-box;
          align-items: center;

          .icon {
            width: 1.5em;
            height: 1.5em;
            //background-image: url(${multimedia});
            background-repeat: no-repeat;
            background-size: cover;
          }
        }

        .video-title {
          color: #fff;
          font-weight: 900;
        }
      }

      .video-content {
        display: flex;
        width: 100%;
        border-radius: 16px;
        gap: 16px;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;
