import { styled } from '@mui/system';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import classNames from 'classnames';

import { Label } from '../../../components/index.ts';
import { Typography } from '../../../components/index.ts';
import { Icon } from '../../../components/index.ts';
import { Select } from '../../../components/Select/Select.tsx';

import { AreaOfInterest } from '../../PagesComponents/AreaOfInterest.tsx';
import { UseMyLocation } from './UseMyLocation.tsx';
import { DistanceUnit, WhenDoYouWantToMove } from '../criteria.contants.ts';
import { CriteriaFormType, DistanceUnitType } from '../criteria.types.ts';
import { HTMLMotionProps, m, motion } from 'framer-motion';
import { Slider } from '../../../components/Slider.tsx';
import { AreaUnitType } from '../../Properties/NewProperty/property.types.ts';


const toKilometer = (valueInMile: number): number => {
  return valueInMile * 1.60934;
};

const toMile = (valueInKilometer: number): number => {
  return valueInKilometer / 1.60934;
};


interface SetCriteriaLocationProps extends HTMLMotionProps<'div'> {
  form: UseFormReturn<CriteriaFormType>;
}

export const SetCriteriaLocation = styled(({ className, form, ...rest }: SetCriteriaLocationProps) => {
  React.useEffect(() => {
    form.watch();
  }, []);

  return (
    <motion.div className={classNames('set-criteria-location-details', className)} {...rest}>
      <Typography variant='body2'>Location details</Typography>
      <div className='sections'>
        <div className='section property-location-section'>
          <Typography className='section-title' variant='body4'>
            Area preferences
          </Typography>
          <div className='section-content'>
            <AreaOfInterest
              startAdornment={
                <span style={{ padding: '13px 0 13px 13px' }}>
                  <Icon icon='search' size={20} color='#CFD5D5' />
                </span>
              }
              placeholder='E.g. Bristol or BA1 2LR'
              label='Area of interest'
              areaOfInterest={form.getValues('areaOfInterest')}
              onAreaChange={({ formattedAddress, location }) => {
                form.setValue('areaOfInterest', formattedAddress);
                form.setValue('location', location);
              }}
            />
            <Select label='Radius' {...form.register('radius')}>
              <option></option>
              <option value='1'>1 mi</option>
              <option value='5'>5 mi</option>
              <option value='10'>10 mi</option>
              <option value='50'>50 mi</option>
            </Select>
          </div>
            <UseMyLocation
              onLocation={({ formattedAddress, location }) => {
                form.setValue('areaOfInterest', formattedAddress);
                form.setValue('location', location);
              }}
            />

        </div>
        <div className='section moving-preferences-section'>
          <Typography className='section-title' variant='body4'>
            Move in preferences
          </Typography>
          <div className='section-content'>
            {Object.values(WhenDoYouWantToMove).map((when) => {
              const active = form.getValues('whenDoYouWantToMove') === when;
              return (
                <div key={when}>
                  <Label active={active} onClick={() => form.setValue('whenDoYouWantToMove', when)}>
                    {when}
                    {active && (
                      <Icon
                        icon='close'
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setValue('whenDoYouWantToMove', undefined);
                        }}
                      />
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
        <div className='section near-things-section'>
          <Typography className='section-title' variant='body4'>
            Near things
          </Typography>
          <div className="section-content">
            <div className="slider-wrapper">
              <div className="title-wrapper">
                <Icon className="area-icon" icon="metro" />
                <Typography variant="body6" className="slider-label">
                  Distance from underground
                </Typography>
              </div>
              <div className="slider-unit-wrapper">
                <Slider
                  value={[
                    form.getValues('distanceFromUnderground.value')?.min,
                    form.getValues('distanceFromUnderground.value')?.max
                  ]}
                  min={0}
                  max={
                    form.getValues('distanceFromUnderground.unit') === DistanceUnit.Mi ? 20 : 30
                  }
                  step={1}
                  onChange={(_, value) => {
                    console.log('change', value);
                    if (Array.isArray(value)) {
                      form.setValue('distanceFromUnderground', {
                        value: {
                          min: value[0],
                          max: value[1]
                        }
                      });
                    }
                  }}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => value?.toLocaleString()}
                  size="small"
                />

                <Select
                  value={form.getValues('distanceFromUnderground.unit')}
                  onChange={(e) => {
                    const unit = e.target.value as DistanceUnitType;
                    const minSize = form.getValues('distanceFromUnderground.value.min');
                    const maxSize = form.getValues('distanceFromUnderground.value.max');
                    form.setValue('distanceFromUnderground.unit', unit);

                    const convertUnit = unit === DistanceUnit.Km ? toKilometer : toMile;

                    form.setValue('distanceFromUnderground', {
                      value: {
                        min: convertUnit(minSize),
                        max: convertUnit(maxSize)
                      }
                    });
                  }}>
                  {Object.values(DistanceUnit).map((unit: DistanceUnitType, unitIndex: number) => (
                    <option value={unit} key={unitIndex}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="slider-wrapper">
              <div className="title-wrapper">
                <Icon className="area-icon" icon="mortarboard" />
                <Typography variant="body6" className="slider-label">
                  Distance from school
                </Typography>
              </div>
              <div className="slider-unit-wrapper">
                <Slider
                  value={[
                    form.getValues('distanceFromSchools.value')?.min,
                    form.getValues('distanceFromSchools.value')?.max
                  ]}
                  min={0}
                  max={
                    form.getValues('distanceFromSchools.unit') === DistanceUnit.Mi ? 20 : 30
                  }
                  step={1}
                  onChange={(_, value) => {
                    console.log('change', value);
                    if (Array.isArray(value)) {
                      form.setValue('distanceFromSchools', {
                        value: {
                          min: value[0],
                          max: value[1]
                        }
                      });
                    }
                  }}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => value?.toLocaleString()}
                  size="small"
                />

                <Select
                  value={form.getValues('distanceFromSchools.unit')}
                  onChange={(e) => {
                    const unit = e.target.value as AreaUnitType;
                    const minSize = form.getValues('distanceFromSchools.value.min');
                    const maxSize = form.getValues('distanceFromSchools.value.max');
                    form.setValue('distanceFromSchools.unit', unit);

                    const convertUnit = unit === DistanceUnit.Km ? toKilometer : toMile;

                    form.setValue('distanceFromSchools', {
                      value: {
                        min: convertUnit(minSize),
                        max: convertUnit(maxSize)
                      }
                    });
                  }}>
                  {Object.values(DistanceUnit).map((unit: DistanceUnitType, unitIndex: number) => (
                    <option value={unit} key={unitIndex}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="slider-wrapper">
              <div className="title-wrapper">
                <Icon className="area-icon" icon="shopping" />
                <Typography variant="body6" className="slider-label">
                  Distance from high street
                </Typography>
              </div>
              <div className="slider-unit-wrapper">
                <Slider
                  value={[
                    form.getValues('distanceFromHighStreet.value')?.min,
                    form.getValues('distanceFromHighStreet.value')?.max
                  ]}
                  min={0}
                  max={
                    form.getValues('distanceFromHighStreet.unit') === DistanceUnit.Mi ? 20 : 30
                  }
                  step={1}
                  onChange={(_, value) => {
                    console.log('change', value);
                    if (Array.isArray(value)) {
                      form.setValue('distanceFromHighStreet', {
                        value: {
                          min: value[0],
                          max: value[1]
                        }
                      });
                    }
                  }}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => value?.toLocaleString()}
                  size="small"
                />

                <Select
                  value={form.getValues('distanceFromHighStreet.unit')}
                  onChange={(e) => {
                    const unit = e.target.value as AreaUnitType;
                    const minSize = form.getValues('distanceFromHighStreet.value.min');
                    const maxSize = form.getValues('distanceFromHighStreet.value.max');
                    form.setValue('distanceFromHighStreet.unit', unit);

                    const convertUnit = unit === DistanceUnit.Km ? toKilometer : toMile;

                    form.setValue('distanceFromHighStreet', {
                      value: {
                        min: convertUnit(minSize),
                        max: convertUnit(maxSize)
                      }
                    });
                  }}>
                  {Object.values(DistanceUnit).map((unit: DistanceUnitType, unitIndex: number) => (
                    <option value={unit} key={unitIndex}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="slider-wrapper">
              <div className="title-wrapper">
                <Icon className="area-icon" icon="barbell" />
                <Typography variant="body6" className="slider-label">
                  Distance from Gym
                </Typography>
              </div>
              <div className="slider-unit-wrapper">
                <Slider
                  value={[
                    form.getValues('distanceFromGym.value')?.min,
                    form.getValues('distanceFromGym.value')?.max
                  ]}
                  min={0}
                  max={
                    form.getValues('distanceFromGym.unit') === DistanceUnit.Mi ? 20 : 30
                  }
                  step={1}
                  onChange={(_, value) => {
                    console.log('change', value);
                    if (Array.isArray(value)) {
                      form.setValue('distanceFromGym', {
                        value: {
                          min: value[0],
                          max: value[1]
                        }
                      });
                    }
                  }}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => value?.toLocaleString()}
                  size="small"
                />

                <Select
                  value={form.getValues('distanceFromGym.unit')}
                  onChange={(e) => {
                    const unit = e.target.value as AreaUnitType;
                    const minSize = form.getValues('distanceFromGym.value.min');
                    const maxSize = form.getValues('distanceFromGym.value.max');
                    form.setValue('distanceFromGym.unit', unit);

                    const convertUnit = unit === DistanceUnit.Km ? toKilometer : toMile;

                    form.setValue('distanceFromGym', {
                      value: {
                        min: convertUnit(minSize),
                        max: convertUnit(maxSize)
                      }
                    });
                  }}>
                  {Object.values(DistanceUnit).map((unit: DistanceUnitType, unitIndex: number) => (
                    <option value={unit} key={unitIndex}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
})`
    &.set-criteria-location-details {
        display: grid;
        row-gap: 48px;
        justify-items: center;
        align-content: center;

        .sections {
            display: grid;
            row-gap: 80px;

            .section {
                display: grid;
                row-gap: 16px;

                .section-title {
                    color: #646464;
                }
            }
        }

        .property-location-section {
            display: grid;
            row-gap: 36px;

            .section-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                align-items: center;
                column-gap: 24px;
                row-gap: 36px;
            }

            .use-my-location-button {
                justify-self: center;
            }
        }

        .moving-preferences-section {
            .section-content {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .label {
                    padding: 16px 24px;
                    align-items: center;
                    display: flex;
                    column-gap: 8px;
                    user-select: none;
                    border: 1px solid #cfd5d5;
                    background: #fff;
                    color: #0d2a38;
                    font-weight: 600;
                    height: 56px;

                    :hover {
                        border: 1px solid #eee0d3;
                        background-color: #c0daff;
                    }

                    &.active {
                        background-color: #c0daff;
                        border-color: #c0daff;
                    }
                }
            }
        }

        .near-things-section {
            .section-content {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                column-gap: 24px;
                row-gap: 36px;

                .distance-wrapper {
                    display: grid;
                    grid-template-columns: auto 70px;
                    column-gap: 4px;
                    align-items: flex-end;

                    label {
                        display: flex;
                        align-items: center;
                        column-gap: 4px;
                    }
                }

                .slider-wrapper {
                    display: grid;
                    row-gap: 4px;
                    align-content: space-between;

                    .slider-label {
                        font-weight: 600;
                    }

                    .slider-unit-wrapper {
                        display: grid;
                        grid-template-columns: auto 70px;
                        column-gap: 8px;
                        align-items: flex-end;
                    }
                    
                    .title-wrapper {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        
                        .icon {
                            color: #646464;
                        }
                    }
                }
            }
        }
    }
`;
