import { styled } from '@mui/system';

import MuiSlider, { SliderProps as MuiSliderProps } from '@mui/material/Slider';
import classNames from 'classnames';

export const Slider = styled(({ className, ...otherProps }: MuiSliderProps) => {
  return <MuiSlider className={classNames('slider', className)} {...otherProps} />;
})`
  &.slider {
    &.MuiSlider-root {
      color: #184d6d;

      &.MuiSlider-sizeSmall {
        height: 4px;
        width: calc(100% - 24px);
        margin: 20px 12px 0 12px;
        .MuiSlider-thumb {
          width: 24px;
          height: 24px;

          .MuiSlider-valueLabel {
            top: -4px;
          }
        }
      }

      .MuiSlider-rail {
        background: #e7e7e7;
      }

      .MuiSlider-track {
        background: #184d6d;
      }

      .MuiSlider-thumb {
        box-shadow: none;
        width: 32px;
        height: 32px;

        .MuiSlider-valueLabel {
          &::before {
            display: none;
          }

          background-color: #fff;

          padding: 0;

          color: #184d6d;
          text-align: center;
          font-family: Roobert, serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
          line-height: 16px;
        }
      }
    }
  }
`;
