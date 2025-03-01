import { styled } from '@mui/system';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import classNames from 'classnames';
import { HTMLMotionProps, motion } from 'framer-motion';

import { Switch } from '../../../components/Switch';
import { Typography } from '../../../components/Typography';

import { OtherSpecificPropertyFeature } from './criteria.types';
import { CriteriaFormType } from './criteria.types';
import { Furnished } from '../../Properties/NewProperty/property.constants';

interface SetCriteriaHouseDetailsProps extends HTMLMotionProps<'div'> {
  form: UseFormReturn<CriteriaFormType>;
}

export const SetCriteriaHouseDetails = styled(
  ({ className, form, ...rest }: SetCriteriaHouseDetailsProps) => {
    React.useEffect(() => {
      form.watch();
    }, []);

    return (
      <motion.div className={classNames('set-criteria-house-details', className)} {...rest}>
        <Typography variant='body2'> Specific property features</Typography>
        <div className='sections'>
          <div className='section specific-property-features-section'>
            {/*<Typography className='section-title' variant='body4'>*/}
            {/*  Specific property features*/}
            {/*</Typography>*/}
            <div className='section-content'>
              {
                <>
                  {Object.values({ ...Furnished, ...OtherSpecificPropertyFeature }).map(
                    (specificPropertyFeature, specificPropertyFeatureIndex: number) =>
                      ((id: string) => (
                        <div className='switch-wrapper' key={specificPropertyFeatureIndex}>
                          <Switch
                            id={id}
                            size='medium'
                            {...form.register(`specificPropertyFeatures.${specificPropertyFeature}`)}
                            checked={!!form.getValues('specificPropertyFeatures')[specificPropertyFeature]}
                          />
                          <label htmlFor={id}>{specificPropertyFeature}</label>
                        </div>
                      ))(React.useId())
                  )}
                </>
              }
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
)`
  &.set-criteria-house-details {
    display: grid;
    row-gap: 48px;
    align-content: center;
    justify-items: center;

    .sections {
      display: grid;
      row-gap: 48px;
      align-items: center;
    }

    .section {
      display: grid;
      row-gap: 16px;

      .section-title {
        color: #646464;
      }

      &.specific-property-features-section {
        .section-content {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          column-gap: 24px;
          row-gap: 24px;

          .switch-wrapper {
            display: flex;
            column-gap: 8px;
            align-items: center;
            label {
              color: #0d2a38;
              font-weight: 400;
              font-size: 14px;
              line-height: 20px;
              font-family: 'Roobert', serif;
            }
          }
        }
      }
    }
  }
`;
