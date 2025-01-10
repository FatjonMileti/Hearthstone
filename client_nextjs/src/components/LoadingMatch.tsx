import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export const LoadingMatch = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <motion.div
      className={className}
      animate={{
        rotate: [0, 90, 180, 270, 360, 450, 540, 630, 720]
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4],
        repeat: Infinity
      }}>
      <motion.div
        className='circle-1 circle'
        animate={{
          top: [0, 0, 27, 52]
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          times: [0, 0.4, 0.45, 0.5],
          repeat: Infinity
        }}>
        <motion.div
          className='inner-circle circle'
          animate={{
            bottom: [-100, -100, -50]
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.45, 0.5],
            repeat: Infinity
          }}
        />
      </motion.div>
      <motion.div
        className='circle-2 circle'
        animate={{
          bottom: [0, 0, 27, 52]
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          times: [0, 0.4, 0.45, 0.5],
          repeat: Infinity
        }}>
        <motion.div
          className='inner-circle circle'
          animate={{
            top: [-100, -100, -50]
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.45, 0.5],
            repeat: Infinity
          }}
        />
      </motion.div>
    </motion.div>
  );
})`
  & {
    width: 254px;
    aspect-ratio: 1/1;
    position: relative;
    border-radius: 50%;
    .circle {
      width: 100px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      position: absolute;
    }

    .circle-1 {
      background-color: rgba(229, 21, 90, 1);
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      overflow: hidden;
      .inner-circle {
        background-color: white;
      }
    }

    .circle-2 {
      background-color: rgba(180, 38, 59, 1);
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      overflow: hidden;
      .inner-circle {
        background-color: white;
      }
    }
  }
`;
