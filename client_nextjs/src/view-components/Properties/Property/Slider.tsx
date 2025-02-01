import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import { Icon } from '../../../components';

interface SliderProps extends HTMLAttributes<HTMLDivElement> {
  images?: {
    link: string;
  }[];
}
export const Slider = styled(({ className, images = [] }: SliderProps) => {
  const [activeSlide, setActiveSlide] = React.useState<number>(0);

  const next = () => setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % images?.length));
  const previous = () => setActiveSlide((activeSlide) => Math.abs((activeSlide - 1) % images?.length));

  return (
    <div className={`slider ${className}`}>
      <div className='slide-list'>
        {images.map((image, imageIndex) => {
          return (
            <Slide
              key={imageIndex}
              image={image?.link}
              className='image-holder'
              animate={{ x: `${-100 * activeSlide}%` }}
              transition={{ ease: 'easeOut', duration: 0.5 }}
            />
          );
        })}
      </div>

      {images?.length === 0 && (
        <div className='no-images'>
          <Icon icon='image' size={128} />
        </div>
      )}

      {images?.length > 1 && (
        <div className='slider-footer'>
          <div className='arrow' onClick={previous}>
            <Icon icon='arrow-left' size={32} />
          </div>

          <div className='dots'>
            {images.map((_, imageIndex) => (
              <motion.div
                key={imageIndex}
                className={`dot ${activeSlide === imageIndex ? 'active' : ''}`}
                // animate={{ backgroundColor: i === index ? '32px' : '12px' }}

                onClick={() => setActiveSlide(imageIndex)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          <div className='arrow' onClick={next}>
            <Icon icon='arrow-right' size={32} />
          </div>
        </div>
      )}
    </div>
  );
})`
  &.slider {
    position: relative;
    width: 100%;
    height: 100%;
    aspect-ratio: 1.36/1;
    border-radius: 0 16px 16px 0;

    .no-images {
      position: absolute;
      inset: 0;
      display: grid;
      align-items: center;
      justify-content: center;
      background-color: #8080800a;
      border-radius: 12px;

      .icon {
        color: #a7a7a7;
      }
    }

    .slide-list {
      display: flex;
      overflow-x: hidden;
      width: 100%;
      height: 100%;
      //aspect-ratio: 1.36/1;
      border-radius: 12px;

      .image-holder {
        height: 100%;
        aspect-ratio: 1.36/1;
      }
    }

    .slider-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      column-gap: 16px;
      align-items: center;

      background: linear-gradient(180deg, rgba(38, 38, 38, 0) 0%, rgba(38, 38, 38, 0.7) 43.75%);

      border-radius: 0 0 12px 12px;

      .arrow {
        color: white;
        cursor: pointer;
        padding: 16px;
        user-select: none;
        display: flex;
      }

      .dots {
        display: flex;
        column-gap: 4px;
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          background: var(--neutral-dark-grey, #646464);
          cursor: pointer;

          background-color: #646464;
          &.active {
            background-color: white;
          }
        }
      }
    }
  }
`;

interface SlideProps extends HTMLMotionProps<'div'> {
  image: string;
}
export const Slide = styled(({ className, ...rest }: SlideProps) => {
  return <motion.div className={`slide ${className}`} {...rest} />;
})`
  &.slide {
    background-image: url('${(props) => props.image}');
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: center;
  }
`;
