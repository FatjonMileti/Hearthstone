import { styled } from '@mui/system';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import classNames from 'classnames';
import { HTMLMotionProps, motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';

import { Switch } from '../../../components/Switch';
import { Tab, Tabs } from '../../../components/Tab';
import { Typography } from '../../../components/Typography';
import { Select } from '../../../components/Select/Select';
import { Slider } from '../../../components/Slider';

import { HomeStyle, House, PropertyPreference } from '../criteria.contants';
import {
  AreaUnit,
  BuildPurpose,
  Condition,
  Floor,
  Furnished,
  OutsideSpace,
  Parking,
  PropertyType
} from '../../Properties/NewProperty/property.constants';
import { AreaUnitType } from '../../Properties/NewProperty/property.types';
import { PropertyPreferenceType, CriteriaFormType, OtherSpecificPropertyFeature } from './criteria.types';

interface SetCriteriaHouseTypeProps extends HTMLMotionProps<'div'> {
  form: UseFormReturn<CriteriaFormType>;
}

const toSquareMeter = (valueInSquareFt: number): number => {
  return Math.round(valueInSquareFt * 0.092903);
};

const toSquareFoot = (valueInSquareFt: number): number => {
  return Math.round(valueInSquareFt / 0.092903);
};

export const SetCriteriaHouseType = styled(({ className, form, ...rest }: SetCriteriaHouseTypeProps) => {
  React.useEffect(() => {
    form.watch();
  }, []);

  const houseTypeIds = Object.values({ ...House }).map(() => uuid());
  const specificPropertyFeatureIds = Object.values({ ...OtherSpecificPropertyFeature }).map(() => uuid());

  return (
    <motion.div className={classNames('set-criteria-house-type', className)} {...rest}>
      <Typography variant='body2'>What kind of property are you searching for?</Typography>
      <div className='sections'>
        <div className='section property-type-section'>
          <Typography className='section-title' variant='body4'>
            Property Type
          </Typography>
          <div className='section-content'>
            {Object.values(PropertyType).map((propertyType, propertyTypeIndex) =>
              ((id: string) => (
                <div className='switch-wrapper' key={propertyTypeIndex}>
                  <Switch
                    id={id}
                    size='medium'
                    {...form.register(`propertyType.${propertyType}`)}
                    checked={!!form.getValues('propertyType')[propertyType]}
                  />
                  <label htmlFor={id}>{propertyType}</label>
                </div>
              ))(React.useId())
            )}
          </div>
        </div>

        {!!form.getValues('propertyType.House') && (
          <div className='section house-details-section'>
            <Typography className='section-title' variant='body4'>
              House Details
            </Typography>
            <div className='section-content'>
              <Select label='Home style' {...form.register('houseDetails.homeStyle')}>
                <option>No preference</option>
                {Object.values(HomeStyle).map((style, styleIndex) => (
                  <option value={style} key={styleIndex}>
                    {style}
                  </option>
                ))}
              </Select>

              <Select label='Condition' {...form.register('houseDetails.condition')}>
                <option>No preference</option>
                {Object.values(Condition).map((style, styleIndex) => (
                  <option value={style} key={styleIndex}>
                    {style}
                  </option>
                ))}
              </Select>

              <Select label='Parking' {...form.register('houseDetails.parking')}>
                <option>No preference</option>
                {Object.values(Parking).map((pType, pTypeIndex) => (
                  <option value={pType} key={pTypeIndex}>
                    {pType}
                  </option>
                ))}
              </Select>
            </div>

            <div className='rooms-details'>
              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Bedrooms
                </Typography>
                <Slider
                  value={[
                    form.getValues('houseDetails.nrOfBedrooms')?.min,
                    form.getValues('houseDetails.nrOfBedrooms')?.max
                  ]}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(_, value) => {
                    if (Array.isArray(value)) {
                      form.setValue('houseDetails.nrOfBedrooms', {
                        min: value[0],
                        max: value[1]
                      });
                    }
                  }}
                  valueLabelDisplay='on'
                  valueLabelFormat={(value) => value}
                  size='small'
                />
              </div>

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Bathrooms
                </Typography>
                <Slider
                  value={[
                    form.getValues('houseDetails.nrOfBathrooms')?.min,
                    form.getValues('houseDetails.nrOfBathrooms')?.max
                  ]}
                  min={1}
                  max={4}
                  step={1}
                  onChange={(_, value) => {
                    if (Array.isArray(value)) {
                      form.setValue('houseDetails.nrOfBathrooms', {
                        min: value[0],
                        max: value[1]
                      });
                    }
                  }}
                  valueLabelDisplay='on'
                  valueLabelFormat={(value) => value}
                  size='small'
                />
              </div>
            </div>

            <div className='sliders-wrapper'>
              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Preferred size
                </Typography>

                <div className='slider-unit-wrapper'>
                  <Controller
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <Slider
                          value={[field?.value?.min, field?.value?.max]}
                          min={0}
                          max={
                            form.getValues('houseDetails.preferredSize.unit') === AreaUnit.SquareFoot
                              ? 10000
                              : 1000
                          }
                          step={1}
                          onChange={(_, value) => {
                            if (Array.isArray(value)) {
                              form.setValue('houseDetails.preferredSize.size', {
                                min: value[0],
                                max: value[1]
                              });
                            }
                          }}
                          valueLabelDisplay='on'
                          valueLabelFormat={(value) => value?.toLocaleString()}
                          size='small'
                        />
                      );
                    }}
                    name='houseDetails.preferredSize.size'
                  />
                  <Select
                    value={form.getValues('houseDetails.preferredSize.unit')}
                    onChange={(e) => {
                      const unit = e.target.value as AreaUnitType;
                      const size = form.getValues('houseDetails.preferredSize.size');

                      form.setValue('houseDetails.preferredSize.unit', unit);

                      const convertUnit = unit === AreaUnit.SquareFoot ? toSquareFoot : toSquareMeter;

                      form.setValue('houseDetails.preferredSize.size', {
                        min: convertUnit(size.min),
                        max: convertUnit(size.max)
                      });
                    }}>
                    {Object.values(AreaUnit).map((unit, unitIndex: number) => (
                      <option value={unit} key={unitIndex}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Garden
                </Typography>

                <div className='slider-unit-wrapper'>
                  <Controller
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <Slider
                          value={[field?.value?.min, field?.value?.max]}
                          min={0}
                          max={
                            form.getValues('houseDetails.garden.unit') === AreaUnit.SquareFoot ? 1000 : 100
                          }
                          step={1}
                          onChange={(_, value) => {
                            if (Array.isArray(value)) {
                              form.setValue('houseDetails.garden.size', {
                                min: value[0],
                                max: value[1]
                              });
                            }

                            // field.onChange({ target: { value: Array.isArray(value) ? value : [value] } });
                          }}
                          valueLabelDisplay='on'
                          valueLabelFormat={(value) => value?.toLocaleString()}
                          size='small'
                        />
                      );
                    }}
                    name='houseDetails.garden.size'
                  />
                  <Select
                    value={form.getValues('houseDetails.garden.unit')}
                    onChange={(e) => {
                      const unit = e.target.value as AreaUnitType;
                      const size = form.getValues('houseDetails.garden.size');
                      form.setValue('houseDetails.garden.unit', unit);

                      const convertUnit = unit === AreaUnit.SquareFoot ? toSquareFoot : toSquareMeter;

                      form.setValue('houseDetails.garden.size', {
                        min: convertUnit(size.min),
                        max: convertUnit(size.max)
                      });
                    }}>
                    {Object.values(AreaUnit).map((unit, unitIndex: number) => (
                      <option value={unit} key={unitIndex}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Storeys
                </Typography>
                <Slider
                  value={[
                    form.getValues('houseDetails.storeys')?.min,
                    form.getValues('houseDetails.storeys')?.max
                  ]}
                  min={1}
                  max={4}
                  step={1}
                  onChange={(_, value) => {
                    if (Array.isArray(value)) {
                      form.setValue('houseDetails.storeys', {
                        min: value[0],
                        max: value[1]
                      });
                    }
                  }}
                  valueLabelDisplay='on'
                  valueLabelFormat={(value) => value}
                  size='small'
                />
              </div>
            </div>

            <div className='specific-property-features'>
              {Object.values({ ...House }).map((houseType, houseTypeIndex: number) => (
                <div className='switch-wrapper' key={houseTypeIndex}>
                  <Switch
                    id={houseTypeIds[houseTypeIndex]}
                    size='medium'
                    {...form.register(`houseDetails.houseType.${houseType}`)}
                    checked={!!form.getValues('houseDetails.houseType')?.[houseType]}
                  />
                  <label htmlFor={houseTypeIds[houseTypeIndex]}>{houseType}</label>
                </div>
              ))}

              {Object.values({ ...OtherSpecificPropertyFeature }).map(
                (specificPropertyFeature, specificPropertyFeatureIndex: number) => (
                  <div className='switch-wrapper' key={specificPropertyFeatureIndex}>
                    <Switch
                      id={specificPropertyFeatureIds[specificPropertyFeatureIndex]}
                      size='medium'
                      {...form.register(`specificPropertyFeatures.${specificPropertyFeature}`)}
                      checked={!!form.getValues('specificPropertyFeatures')?.[specificPropertyFeature]}
                    />
                    <label htmlFor={specificPropertyFeatureIds[specificPropertyFeatureIndex]}>
                      {specificPropertyFeature}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {!!form.getValues('propertyType.Apartment') && (
          <div className='section flat-details-section'>
            <Typography className='section-title' variant='body4'>
              Flat details
            </Typography>

            <div className='section-content'>
              <Select label='Flat style' {...form.register('flatDetails.propertyPurpose')}>
                <option></option>
                {Object.values(BuildPurpose).map((purpose, i) => (
                  <option value={purpose} key={i}>
                    {purpose}
                  </option>
                ))}
              </Select>

              <Select label='Preferred floor' {...form.register('flatDetails.preferredFloor')}>
                <option></option>
                {Object.values(Floor).map((pf, pfIndex) => (
                  <option value={pf} key={pfIndex}>
                    {pf}
                  </option>
                ))}
              </Select>
              <div></div>

              {/*<Select label="Condition" {...form.register('flatDetails.condition')}>*/}
              {/*  <option></option>*/}
              {/*  {Object.values(Condition).map((style, styleIndex) => (*/}
              {/*    <option value={style} key={styleIndex}>*/}
              {/*      {style}*/}
              {/*    </option>*/}
              {/*  ))}*/}
              {/*</Select>*/}

              {Object.values(OutsideSpace).map((space, spaceTypeIndex) =>
                ((id: string) => (
                  <div className='switch-wrapper' key={spaceTypeIndex}>
                    <Switch
                      id={id}
                      size='medium'
                      {...form.register(`flatDetails.outsideSpace.${space}`)}
                      checked={!!form.getValues('flatDetails.outsideSpace')[space]}
                    />
                    <label htmlFor={id}>{space}</label>
                  </div>
                ))(uuid())
              )}

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Preferred size
                </Typography>
                <div className='slider-unit-wrapper'>
                  <Slider
                    value={[
                      form.getValues('flatDetails.preferredSize.size')?.min,
                      form.getValues('flatDetails.preferredSize.size')?.max
                    ]}
                    min={form.getValues('flatDetails.preferredSize.unit') === AreaUnit.SquareFoot ? 400 : 40}
                    max={
                      form.getValues('flatDetails.preferredSize.unit') === AreaUnit.SquareFoot ? 4000 : 400
                    }
                    step={1}
                    onChange={(_, value) => {
                      console.log('change', value);
                      if (Array.isArray(value)) {
                        form.setValue('flatDetails.preferredSize.size', {
                          min: value[0],
                          max: value[1]
                        });
                      }
                    }}
                    valueLabelDisplay='on'
                    valueLabelFormat={(value) => value?.toLocaleString()}
                    size='small'
                  />

                  <Select
                    value={form.getValues('flatDetails.preferredSize.unit')}
                    onChange={(e) => {
                      const unit = e.target.value as AreaUnitType;
                      const size = form.getValues('flatDetails.preferredSize.size');
                      form.setValue('flatDetails.preferredSize.unit', unit);

                      const convertUnit = unit === AreaUnit.SquareFoot ? toSquareFoot : toSquareMeter;

                      form.setValue('flatDetails.preferredSize.size', {
                        min: convertUnit(size.min),
                        max: convertUnit(size.max)
                      });
                    }}>
                    {Object.values(AreaUnit).map((unit, unitIndex: number) => (
                      <option value={unit} key={unitIndex}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Bedrooms
                </Typography>
                <Slider
                  value={[
                    form.getValues('flatDetails.nrOfBedrooms')?.min,
                    form.getValues('flatDetails.nrOfBedrooms')?.max
                  ]}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(_, value) => {
                    if (Array.isArray(value)) {
                      form.setValue('flatDetails.nrOfBedrooms', {
                        min: value[0],
                        max: value[1]
                      });
                    }
                  }}
                  valueLabelDisplay='on'
                  valueLabelFormat={(value) => value}
                  size='small'
                />
              </div>

              <div className='slider-wrapper'>
                <Typography variant='body6' className='slider-label'>
                  Bathrooms
                </Typography>
                <Slider
                  value={[
                    form.getValues('flatDetails.nrOfBathrooms')?.min,
                    form.getValues('flatDetails.nrOfBathrooms')?.max
                  ]}
                  min={1}
                  max={4}
                  step={1}
                  onChange={(_, value) => {
                    if (Array.isArray(value)) {
                      form.setValue('flatDetails.nrOfBathrooms', {
                        min: value[0],
                        max: value[1]
                      });
                    }
                  }}
                  valueLabelDisplay='on'
                  valueLabelFormat={(value) => value}
                  size='small'
                />
              </div>

              {form.getValues('flatDetails.propertyPurpose') === BuildPurpose.PurposeBuilt && (
                <>
                  {((id: string) => (
                    <div className='switch-wrapper'>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register('flatDetails.lift')}
                        checked={!!form.getValues('flatDetails.lift')}
                      />
                      <label htmlFor={id}>Lift</label>
                    </div>
                  ))(uuid())}
                  {((id: string) => (
                    <div className='switch-wrapper'>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register('flatDetails.security')}
                        checked={!!form.getValues('flatDetails.security')}
                      />
                      <label htmlFor={id}>Security</label>
                    </div>
                  ))(uuid())}
                  {((id: string) => (
                    <div className='switch-wrapper'>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register('flatDetails.parkingSpace')}
                        checked={!!form.getValues('flatDetails.parkingSpace')}
                      />
                      <label htmlFor={id}>Parking space</label>
                    </div>
                  ))(uuid())}
                  {((id: string) => (
                    <div className='switch-wrapper'>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register('flatDetails.gymSpa')}
                        checked={!!form.getValues('flatDetails.gymSpa')}
                      />
                      <label htmlFor={id}>gym/spa</label>
                    </div>
                  ))(uuid())}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
})`
  &.set-criteria-house-type {
    display: grid;
    row-gap: 48px;
    align-content: center;
    justify-items: center;

    .sections {
      width: 100%;
      row-gap: 48px;
      display: grid;
      justify-items: center;
      box-sizing: border-box;
      .section {
        display: grid;
        row-gap: 16px;
        .section-title {
          color: #646464;
        }
      }

      .property-type-section {
        .section-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          justify-content: space-between;
          column-gap: 84px;
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

      .house-details-section {
        display: grid;
        gap: 24px;
        justify-content: center;
        row-gap: 48px;
        width: 100%;
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
          }
        }
      }

      .rooms-details {
        display: flex;
        justify-content: space-around;
        gap: 24px;

        .slider-wrapper {
          min-width: 180px;
        }
      }

      .sliders-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 24px;

        .slider-wrapper {
          min-width: 200px;
          display: grid;
          row-gap: 4px;

          .slider-label {
            font-weight: 600;
          }

          .slider-unit-wrapper {
            display: grid;
            grid-template-columns: auto 70px;
            column-gap: 8px;
            align-items: flex-end;
          }
        }
      }

      .specific-property-features {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        column-gap: 24px;
        row-gap: 24px;
        padding-top: 24px;

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

      .flat-details-section {
        .section-content {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          column-gap: 24px;
          row-gap: 36px;

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

          .tabs-wrapper {
            display: flex;
            flex-direction: column;
            row-gap: 8px;
            align-items: flex-start;

            label {
              color: #000;
              font-weight: 600;
              font-size: 16px;
              line-height: 24px;
              font-family: 'Roobert', serif;
            }

            .tabs {
              column-gap: 0;

              .tab {
                padding: 12px 24px;
                width: 148px;
              }
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
          }
        }
      }

      .property-class-section {
        .section-content {
          display: grid;
          grid-template-columns: max-content max-content;
          row-gap: 24px;
          column-gap: 64px;
          justify-content: space-between;

          .tabs-wrapper {
            display: flex;
            flex-direction: column;
            row-gap: 8px;
            align-items: flex-start;

            label {
              color: #000;
              font-weight: 600;
              font-size: 16px;
              line-height: 24px;
              font-family: 'Roobert', serif;
            }

            .tabs {
              column-gap: 0;

              .tab {
                padding: 12px 24px;
                width: 148px;
              }
            }
          }
        }
      }
    }
  }
`;
