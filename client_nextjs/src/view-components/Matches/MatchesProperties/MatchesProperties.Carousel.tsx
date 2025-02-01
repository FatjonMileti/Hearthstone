import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../../../components/Icon.tsx';
import { RoundAction } from '../../../components/RoundAction.tsx';

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  indexStore?: [number, (i: number) => void];
  images: any[];
}

export const Carousel = styled(({ className, indexStore, images }: CarouselProps) => {
  const [index, setIndex] = indexStore || React.useState<number>(0);

  const handlePrevClick = () => {
    setIndex(index === 0 ? images.length - 1 : index - 1);
  };

  const handleNextClick = () => {
    setIndex(index === images.length - 1 ? 0 : index + 1);
  };

  return (
    <div className={`slider ${className}`}>
      <div className='slides-wrapper'>
        {images?.length === 0 && (
          <div className='no-images slide-item'>
            <Icon icon='image' size={128} />
          </div>
        )}
        {images.map((image: any, imageIndex: number) => (
          <motion.img
            src={image}
            className={`slide-item ${index < imageIndex ? 'next-item' : ''} ${
              index > imageIndex ? 'previous-item' : ''
            }`}
            key={imageIndex}
            animate={{ x: `${-100 * index}% ` }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
          />
        ))}
      </div>

      <div className='slider-footer'>
        {images.length >= 2 && <RoundAction icon='chevron-left' onClick={handlePrevClick} inverted />}
        <div className='dots-wrapper'>
          {images.map((image: any, imageIndex: number) => (
            <motion.img
              key={imageIndex}
              src={image}
              className={`thumbnail dot ${imageIndex === index ? 'active' : ''}`}
              onClick={() => setIndex(imageIndex)}
              whileHover={{ scale: 1.5 }}
              whileTap={{ scale: 1 }}
            />
          ))}
        </div>
        {images.length >= 2 && <RoundAction icon='chevron-right' onClick={handleNextClick} inverted />}
      </div>
    </div>
  );
})`
  &.slider {
    position: relative;
    width: 100%;
    user-select: none;

    display: grid;
    justify-items: center;
    border-radius: 16px;
    box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.25);

    .slider-footer {
      display: flex;
      justify-content: space-between;
      column-gap: 24px;
      width: 100%;

      position: absolute;
      bottom: 0;

      padding: 24px;
      box-sizing: border-box;
      align-items: center;
      z-index: 1;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;

      background: linear-gradient(180deg, rgba(13, 42, 56, 0) 0%, #0d2a38 100%);

      .dots-wrapper {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;

        .thumbnail {
          width: 92px;
          height: 61px;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0.7;
          box-sizing: border-box;

          &.active {
            border: 2px solid #184d6d;
            opacity: 1;
          }

          :hover {
            border: 2px solid #184d6d;
            opacity: 1;
            z-index: 1;
          }
        }
      }
    }

    .slides-wrapper {
      display: flex;
      width: 100%;
      overflow: hidden;
      position: relative;
      max-width: 100%;
      max-height: 602px;
      border-radius: 16px;

      :before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      .no-images {
        display: grid;
        align-items: center;
        justify-content: center;
        color: #a7a7a7;
        background-color: #8080800a;
      }

      .slide-item {
        flex-shrink: 0;
        width: 100%;
        aspect-ratio: 3 / 2;
        object-fit: cover;
      }
    }
  }
`;
