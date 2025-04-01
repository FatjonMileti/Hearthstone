// @ts-nocheck
import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import { Typography } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { IconButton } from '../../../components/IconButton';
import { Icon } from '../../../components/Icon';
import { ShowGlobalLoading } from '../../../components/ShowGlobalLoading';
import { Textarea } from '../../../components/Textarea';
import { Select } from '../../../components/Select/Select';
import { TextField } from '../../../components/TextField';
import valpal from './valpal.png';
import { Switch } from '../../../components/Switch';

import { Map } from '../../../components/Map';
import { NearestThings } from '../../Matches/MatchesProperties/ViewProperty.NearestThings';
import { AreaOfInterest } from '../../PagesComponents/AreaOfInterest';

import { useUserStore } from '../../../globalState/user';
import axios from '../../../utils/axios';

import { ImageUpload } from './NewProperty.ImageUpload';

import { ApiPropertyDocumentType, PropertyFormType } from './property.types';
import {
  AreaUnit,
  House,
  BuildPurpose,
  Floor,
  Furnished,
  OutsideSpace,
  Parking,
  PropertyType,
  Condition
} from './property.constants';
import { Transaction } from '../../SetCriteria/criteria.contants';
import { OtherSpecificPropertyFeature } from '../../SetCriteria/criteria.types';
import { Label } from '../../../components/Label';
import classNames from 'classnames';

export interface PropertyFormProps extends HTMLAttributes<HTMLDivElement> {
  afterStartMatching: () => void;
  onBack: () => void;
  form: UseFormReturn<PropertyFormType>;
  saveAsDraft: (payload: Partial<ApiPropertyDocumentType>) => Promise<any>;
  startMatching: (payload: Partial<ApiPropertyDocumentType>) => Promise<any>;
  afterSaveAsDraft: () => any;
}

export interface NewPropertyStateType {
  newImages: File[];
  generatedImages: any[];
  savingProperty: boolean;
  deletePropertyConfirmationModal: boolean;
}

export const PropertyForm = styled(
  ({
    form,
    className,
    afterStartMatching,
    onBack,
    saveAsDraft,
    startMatching,
    afterSaveAsDraft
  }: PropertyFormProps) => {
    const { auth } = useUserStore();

    const [state, setState] = React.useState<NewPropertyStateType>({
      newImages: [],
      generatedImages: [],
      savingProperty: false,
      deletePropertyConfirmationModal: false
    });

    React.useEffect(() => {
      if (form) form.watch();
    }, []);

    const setNewImages = (newImages: File[]) => setState((state) => ({ ...state, newImages }));

    const setGeneratedImages = (generatedImages: any[]) =>
      setState((state) => ({ ...state, generatedImages }));

    const { register, formState } = form;
    const uploadImages = async (images: File[]): Promise<any> => {
      try {
        const data = new FormData();

        images.forEach((image) => {
          data.append('files', image);
        });

        const response = await axios(auth.access_token).post('/api/asset/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        return response.data;
      } catch (err) {
        throw err;
      }
    };

    const generatePayload = () => {
      let payload: Partial<ApiPropertyDocumentType> = {};

      payload['transaction_type_string'] = Transaction.Rent;
      payload['area_of_interest'] = form.getValues('areaOfInterest');
      payload['title'] = form.getValues('title');

      payload['property_images'] = form.getValues('propertyImages');

      payload['asset_address'] = form.getValues('location');
      payload['property_type'] = form.getValues('propertyType');

      payload['budget'] = {
        min_budget: form.getValues('minBudget'),
        max_budget: form.getValues('maxBudget')
      };

      if (payload.property_type === PropertyType.Flats) {
        payload['flat_details'] = {
          property_purpose: form.getValues('flatDetails.propertyPurpose') || undefined,
          floor: form.getValues('flatDetails.floor') || undefined,
          lift: form.getValues('flatDetails.lift'),
          security: form.getValues('flatDetails.security'),
          gym_spa: form.getValues('flatDetails.gymSpa'),
          outside_space: [
            form.getValues('flatDetails.outsideSpace')[OutsideSpace.Balcony] ? [OutsideSpace.Balcony] : [],
            form.getValues('flatDetails.outsideSpace')[OutsideSpace.Terrace] ? [OutsideSpace.Terrace] : [],
            form.getValues('flatDetails.outsideSpace')[OutsideSpace.Garden] ? [OutsideSpace.Garden] : []
          ].flat()
        };
      }

      if (payload.property_type === PropertyType.House) {
        payload['house_details'] = {
          house_type: form.getValues('houseDetails.houseType') || undefined
        };
      }

      payload['floor_size'] = form.getValues('area');

      payload['floor_size_unit'] = form.getValues('areaUnit');

      payload['description'] = form.getValues('description');

      payload['parking_spot'] = form.getValues('parkingSpot')
        ? parseInt(form.getValues('parkingSpot'))
        : undefined;

      payload['parking_details'] = form.getValues('parkingType') || undefined;

      payload['epc_rating'] = form.getValues('epcRating');
      payload['condition'] = form.getValues('condition');

      payload['specific_property_features'] = [
        form.getValues('specificPropertyFeatures.Allows smoking')
          ? [OtherSpecificPropertyFeature.AllowsSmoking]
          : [],
        form.getValues('specificPropertyFeatures.Allows pets')
          ? [OtherSpecificPropertyFeature.AllowsPets]
          : [],
        form.getValues('specificPropertyFeatures.Close to public transport')
          ? [OtherSpecificPropertyFeature.CloseToPublicTransport]
          : [],
        form.getValues('specificPropertyFeatures.Double glazing')
          ? [OtherSpecificPropertyFeature.DoubleGlazing]
          : [],
        form.getValues('furniture') ? [form.getValues('furniture')] : []
      ].flat() as ApiPropertyDocumentType['specific_property_features'];

      payload['room_details'] = {
        number_of_bathrooms: form.getValues('bathrooms'),
        number_of_bedrooms: form.getValues('bedrooms')
      };

      return payload;
    };

    const processNewImages = async () => {
      try {
        if (state.newImages.length > 0) {
          const newImagesLinks = await uploadImages(state.newImages);
          setNewImages([]);
          form.setValue('propertyImages', [...form.getValues('propertyImages'), ...newImagesLinks]);
        }

        if (state.generatedImages.length > 0) {
          setGeneratedImages([]);
          form.setValue('propertyImages', [...form.getValues('propertyImages'), ...state.generatedImages]);
        }
      } catch (err) {
        throw err;
      }
    };

    const onSaveAsDraftClick = async () => {
      setState((state) => ({ ...state, savingProperty: true }));
      try {
        await processNewImages();
        const payload = generatePayload();
        await saveAsDraft(payload);
        afterSaveAsDraft();
      } catch (err) {
        throw err;
      } finally {
        setState((state) => ({ ...state, savingProperty: false }));
      }
    };

    const onStartMatchingClick = async () => {
      setState((state) => ({ ...state, savingProperty: true }));
      try {
        await processNewImages();

        const payload: any = {
          ...generatePayload(),
          status_string: 'Live'
        };

        await startMatching(payload);
        afterStartMatching();
      } catch (err) {
        throw err;
      } finally {
        setState((state) => ({ ...state, savingProperty: false }));
      }
    };

    const propertyScore = (
      (100 / 7) *
      [
        !!form.getValues('title'),
        !!state.newImages.length || form.getValues('propertyImages').length || state.generatedImages.length,
        !!form.getValues('areaOfInterest'),
        !!form.getValues('minBudget') && !!form.getValues('maxBudget'),
        !!form.getValues('propertyType') &&
          !!form.getValues('bedrooms') &&
          !!form.getValues('bathrooms') &&
          !!form.getValues('area') &&
          !!form.getValues('parkingSpot') &&
          !!form.getValues('epcRating'),
        !!form.getValues('description'),
        true
      ].filter((d) => d).length
    ).toFixed(0);

    return (
      <div className={classNames('property-form', className)}>
        {state.savingProperty && <ShowGlobalLoading />}
        <div className='container'>
          <div className='left'>
            <TextField
              placeholder='Enter the title'
              label='Title'
              required
              {...register('title')}
              error={!!form.formState.errors.title}
              helperText={form.formState.errors.title?.message?.toString()}
              type='string'
            />
            <div className='property-preferences-section'>
              <AreaOfInterest
                placeholder='Enter location'
                label={
                  <>
                    <Icon icon='location' />
                    Location
                  </>
                }
                required
                areaOfInterest={form.getValues('areaOfInterest')}
                onAreaChange={({ formattedAddress, location }) => {
                  form.setValue('areaOfInterest', formattedAddress);
                  form.setValue('location', location);
                }}
                error={!!form.formState.errors.areaOfInterest}
                helperText={form.formState.errors.areaOfInterest?.message?.toString()}
                type='string'
              />
              <div className='property-wrapper'>
                <div className='label'>
                  <div className='price-per-month'>
                    <Icon icon='banknote' size={24} />
                    <Typography variant='body5'>
                      Price per month<span className='required-asterisk'> *</span>
                    </Typography>
                  </div>

                  <div className='tooltip'>
                    <span className='valpal-icon'>
                      <img alt='valpal' src={valpal} />
                    </span>
                    <div className='tooltiptext'>
                      <p>Min Valuation: £ 2,034</p>
                      <p>Avg Valuation: £ 2,260</p>
                      <p>Max Valuation: £ 2,486</p>
                    </div>
                  </div>
                </div>
                <div className='min-max'>
                  <TextField
                    startAdornment={<div style={{ color: '#A7A7A7', margin: '0 0 0 12px' }}>£</div>}
                    placeholder='Min'
                    {...register('minBudget')}
                    error={!!form.formState.errors['minBudget']}
                    helperText={form.formState.errors['minBudget']?.message?.toString()}
                    type='number'
                  />
                  <TextField
                    startAdornment={<div style={{ color: '#A7A7A7', margin: '0 0 0 12px' }}>£</div>}
                    placeholder='Max'
                    {...register('maxBudget')}
                    error={!!form.formState.errors['maxBudget']}
                    helperText={form.formState.errors['maxBudget']?.message?.toString()}
                    type='number'
                  />
                </div>
              </div>
              <TextField
                placeholder='No. of bedrooms'
                {...register('bedrooms')}
                required
                label={
                  <>
                    <Icon icon='double-bed' /> Bedrooms
                  </>
                }
                error={!!form.formState.errors.bedrooms}
                helperText={form.formState.errors.bedrooms?.message?.toString()}
                type='number'
              />
              <TextField
                placeholder='No. of bathrooms'
                {...register('bathrooms')}
                required
                label={
                  <>
                    <Icon icon='bathtub' /> Bathrooms
                  </>
                }
                error={!!form.formState.errors.bathrooms}
                helperText={form.formState.errors.bathrooms?.message?.toString()}
                type='number'
              />
              <Select
                label={
                  <>
                    <Icon icon='building' />
                    Property type
                  </>
                }
                required
                {...register('propertyType')}
                placeholder='Select property type'
                error={!!form.formState.errors['propertyType']}
                helperText={form.formState.errors['propertyType']?.message?.toString()}>
                <option></option>
                {Object.values(PropertyType).map((type, typeIndex) => (
                  <option value={type} key={typeIndex}>
                    {type}
                  </option>
                ))}
              </Select>

              <div className='area-wrapper'>
                <TextField
                  placeholder='Enter the area'
                  {...register('area')}
                  required
                  label={
                    <>
                      <Icon className='area-icon' icon='ruler' /> Area
                    </>
                  }
                  error={!!form.formState.errors.area}
                  helperText={form.formState.errors.area?.message?.toString()}
                  type='number'
                />
                <Select {...register('areaUnit')}>
                  {Object.values(AreaUnit).map((unit, unitIndex: number) => (
                    <option value={unit} key={unitIndex}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>

              <Select
                required
                label={
                  <>
                    <Icon icon='car' />
                    Parking spot
                  </>
                }
                {...register('parkingSpot')}
                error={!!form.formState.errors['parkingSpot']}
                helperText={form.formState.errors['parkingSpot']?.message?.toString()}>
                <option></option>
                <option value='0'>0</option>
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
                <option value='4'>4</option>
                <option value='5'>5</option>
              </Select>

              {!!form.getValues('parkingSpot') && form.getValues('parkingSpot') !== '0' && (
                <Select
                  label={
                    <>
                      <Icon icon='car' />
                      Parking type
                    </>
                  }
                  {...register('parkingType')}
                  error={!!form.formState.errors['parkingType']}
                  helperText={form.formState.errors['parkingType']?.message?.toString()}>
                  <option></option>
                  {Object.values(Parking).map((parking, parkingIndex) => (
                    <option value={parking} key={parkingIndex}>
                      {parking}
                    </option>
                  ))}
                </Select>
              )}
              <Select
                label={
                  <>
                    <Icon icon='temperature' />
                    EPC Rating
                  </>
                }
                {...register('epcRating')}
                required
                error={!!form.formState.errors['epcRating']}
                helperText={form.formState.errors['epcRating']?.message?.toString()}>
                <option></option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='C'>C</option>
                <option value='D'>D</option>
                <option value='E'>E</option>
                <option value='F'>F</option>
                <option value='G'>G</option>
              </Select>

              <Select label='Condition' {...form.register('condition')}>
                <option></option>
                {Object.values(Condition).map((style, styleIndex) => (
                  <option value={style} key={styleIndex}>
                    {style}
                  </option>
                ))}
              </Select>

              {form.getValues('propertyType') === PropertyType.House && (
                <Select
                  label={
                    <>
                      <Icon icon='building' />
                      House type
                    </>
                  }
                  {...register('houseDetails.houseType')}
                  placeholder='Select building type'
                  error={!!form.formState.errors['houseDetails']?.['houseType']}
                  helperText={form.formState.errors['houseDetails']?.['houseType']?.message?.toString()}>
                  <option></option>
                  {Object.values(House).map((type, typeIndex) => (
                    <option value={type} key={typeIndex}>
                      {type}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className='specific-property-features-section'>
              <Typography variant='body4' className='label'>
                Specific property features
              </Typography>
              <div className='section-content'>
                <Select
                  label='Furniture'
                  {...form.register('furniture')}
                  error={!!form.formState.errors['furniture']}
                  helperText={form.formState.errors['furniture']?.message?.toString()}>
                  <option></option>
                  {Object.values(Furnished).map((furnished, i) => (
                    <option value={furnished} key={i}>
                      {furnished}
                    </option>
                  ))}
                </Select>

                {Object.values(OtherSpecificPropertyFeature).map((ospf, ospfIndex: number) =>
                  ((id: string) => (
                    <div className='switch-wrapper' key={ospfIndex}>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register(`specificPropertyFeatures.${ospf}`)}
                        checked={!!form.getValues('specificPropertyFeatures')[ospf]}
                      />
                      <label htmlFor={id}>{ospf}</label>
                    </div>
                  ))(uuid())
                )}
              </div>
            </div>
            {form.getValues('propertyType') === PropertyType.Flats && (
              <div className='flat-details-section'>
                <Typography variant='body4' className='label'>
                  Flat details
                </Typography>
                <div className='section-content'>
                  <Select label='Build Purpose' {...form.register('flatDetails.propertyPurpose')}>
                    <option></option>
                    {Object.values(BuildPurpose).map((purpose, i) => (
                      <option value={purpose} key={i}>
                        {purpose}
                      </option>
                    ))}
                  </Select>

                  <Select label='Floor' {...form.register('flatDetails.floor')}>
                    <option></option>
                    {Object.values(Floor).map((floor, floorIndex) => (
                      <option value={floor} key={floorIndex}>
                        {floor}
                      </option>
                    ))}
                  </Select>

                  {((id: string) => (
                    <div className='switch-wrapper'>
                      <Switch
                        id={id}
                        size='medium'
                        {...form.register('flatDetails.lift')}
                        checked={!!form.getValues('flatDetails.lift')}
                      />
                      <label htmlFor={id}>lift</label>
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
                      <label htmlFor={id}>security</label>
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
                      <label htmlFor={id}>Gym/Spa</label>
                    </div>
                  ))(uuid())}

                  {Object.values(OutsideSpace).map((space, spaceIndex: number) =>
                    ((id: string) => (
                      <div className='switch-wrapper' key={spaceIndex}>
                        <Switch
                          id={id}
                          size='medium'
                          {...form.register(`flatDetails.outsideSpace.${space}`)}
                          checked={!!form.getValues('flatDetails')?.['outsideSpace']?.[space]}
                        />
                        <label htmlFor={id}>{space}</label>
                      </div>
                    ))(uuid())
                  )}
                </div>
              </div>
            )}
            <Textarea
              placeholder='Enter description'
              label='Description'
              {...register('description')}
              required
              rows={4}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message?.toString()}
            />
            <div className='upload-wrapper'>
              <div className='label'>
                <Typography variant='body5'>
                  Media <span className='required-asterisk'> *</span>
                </Typography>
              </div>
              <ImageUpload
                className='upload'
                onNewImages={(files) => {
                  setNewImages([...state.newImages, ...files]);
                }}
                onGenerateImages={(files) => {
                  setGeneratedImages([...state.generatedImages, ...files]);
                }}
              />
              <Controller
                render={({ field: { value = [], onChange } }) => (
                  <>
                    <div className='images-list'>
                      {value.map((image: any, imageIndex: number) => (
                        <div key={imageIndex} className='image-wrapper'>
                          <IconButton
                            size='large'
                            className='remove-button'
                            onClick={async () => {
                              onChange({
                                target: { value: value.filter((_: any, i: number) => i !== imageIndex) }
                              });
                            }}>
                            <Icon icon='minus' size={16} />
                          </IconButton>
                          <img alt='property image' src={`${image?.link}`} />
                        </div>
                      ))}

                      {state.newImages.length > 0 &&
                        state.newImages.map((image: any, imageIndex: number) => (
                          <div key={imageIndex} className='image-wrapper'>
                            <IconButton
                              size='large'
                              className='remove-button'
                              onClick={() => {
                                setNewImages(state.newImages.filter((_: any, i: number) => i !== imageIndex));
                              }}>
                              <Icon icon='minus' size={16} />
                            </IconButton>
                            <img alt='property image' src={URL.createObjectURL(image)} />
                          </div>
                        ))}
                      {state.generatedImages.length > 0 &&
                        state.generatedImages.map((image: any, imageIndex: number) => (
                          <div key={imageIndex} className='image-wrapper'>
                            <IconButton
                              size='large'
                              className='remove-button'
                              onClick={() => {
                                setGeneratedImages(
                                  state.generatedImages.filter((_: any, i: number) => i !== imageIndex)
                                );
                              }}>
                              <Icon icon='minus' size={16} />
                            </IconButton>
                            <img alt='property image' src={image.link} />
                          </div>
                        ))}
                    </div>
                  </>
                )}
                control={form.control}
                name='propertyImages'
              />
            </div>
            <Map
              address={{
                lat: form.getValues('location').latitude || 0,
                lng: form.getValues('location').longitude || 0
              }}
            />
            <NearestThings
              location={{
                lat: form.getValues('location').latitude || 0,
                lng: form.getValues('location').longitude || 0
              }}
            />
            <div className='facilities-wrapper'>
              <Typography variant='body4' className='label'>
                Facilities
              </Typography>
              <div className='facilities'>
                <ul>
                  {!!form.getValues('propertyType') ? (
                    <li>
                      <Typography variant='body4'>{form.getValues('propertyType')}</Typography>
                    </li>
                  ) : (
                    ''
                  )}

                  {!!form.getValues('parkingSpot') && Number(form.getValues('parkingSpot')) > 0 ? (
                    <li>
                      <Typography variant='body4'>
                        {Number(form.getValues('parkingSpot')) === 1
                          ? 'Parking spot: ' + form.getValues('parkingSpot')
                          : 'Parking spots: ' + form.getValues('parkingSpot')}
                        {!!form.getValues('parkingType') ? ', ' + form.getValues('parkingType') : ''}
                      </Typography>
                    </li>
                  ) : (
                    ''
                  )}
                  {!!form.getValues('condition') ? (
                    <li>
                      <Typography variant='body4'> {'Condition: ' + form.getValues('condition')} </Typography>
                    </li>
                  ) : (
                    ''
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className='right'>
            <div className='top'>
              <div className='property-score'>
                <Typography variant='body5'>Property score</Typography>
                <Typography className='red'>{propertyScore}%</Typography>
              </div>
              <Typography variant='body3'>Improve your property’s score by adding more details</Typography>
            </div>
            <div className='sections-progress-list'>
              {[
                {
                  name: 'Add a title to your listing',
                  checked: !!form.getValues('title')
                },
                {
                  name: 'Upload photos of your property',
                  checked: !!state.newImages.length || form.getValues('propertyImages').length
                },
                {
                  name: 'Enter the location of your property',
                  checked: !!form.getValues('areaOfInterest')
                },
                {
                  name: ' Enter budget details',
                  checked: !!form.getValues('minBudget') && !!form.getValues('maxBudget')
                },
                {
                  name: ' Enter property details',
                  checked: !!form.getValues('description')
                }
              ].map((progressItem, progressItemIndex) => (
                <div
                  className={`progress-item ${progressItem.checked ? 'active' : ''}`}
                  key={progressItemIndex}>
                  <div className='progress-item-indicator'>
                    <Icon icon='checked' size={16} />
                  </div>
                  <Typography variant='body4' className='progress-item-text'>
                    {progressItem.name}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='footer'>
          <Button
            startIcon={<Icon icon='arrow-left-1' size={16} />}
            className='back-button'
            variant='secondary'
            size='large'
            onClick={onBack}>
            Back
          </Button>
          <Label
            variant='primary'
            disabled={!form.formState.isValid}
            size='large'
            special
            className='start-matching-button'
            onClick={async () => {
              await onStartMatchingClick();
            }}>
            Start matching
          </Label>
          <Button
            size='large'
            disabled={Object.values(formState.errors).length > 0}
            onClick={async () => {
              await onSaveAsDraftClick();
            }}>
            Save as draft
          </Button>
        </div>
      </div>
    );
  }
)`
  &.property-form {
    .container {
      padding: 32px 36px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      justify-content: space-between;
      align-items: start;
      box-sizing: border-box;
      column-gap: 24px;

      .left {
        width: 100%;
        display: grid;
        align-items: start;
        gap: 24px;
        box-sizing: border-box;

        .text-field {
          width: 100%;
        }

        .upload-wrapper {
          display: grid;
          gap: 4px;

          .label {
            .typography {
              font-weight: 600;
              font-size: 12px;
              line-height: 16px;
              color: #0d2a38;

              .required-asterisk {
                color: #b4263b;
                font-weight: 600;
                font-size: 12px;
                line-height: 16px;
              }
            }
          }
          .upload {
          }
          .images-list {
            display: flex;
            column-gap: 2px;
            flex-wrap: wrap;
            .image-wrapper {
              border-radius: 4px;
              height: 64px;
              width: 96px;
              position: relative;

              .remove-button {
                position: absolute;
                color: white;
                background-color: #e5155a;
                padding: 0;
                right: 2px;
                top: 2px;
              }

              img {
                height: 100%;
                width: 100%;
                border-radius: 4px;
              }
            }
          }
        }

        .property-preferences-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          column-gap: 16px;
          row-gap: 24px;
          align-items: flex-end;

          .variant-outlined {
            label {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .area-icon {
              transform: rotate(-90deg);
            }
          }

          .property-wrapper {
            display: grid;
            row-gap: 4px;

            .label {
              display: grid;
              grid-template-columns: 1fr 1fr;
              .price-per-month {
                display: flex;
                gap: 4px;
                align-items: center;

                .typography {
                  font-weight: 600;
                  font-size: 12px;
                  line-height: 16px;
                  color: #0d2a38;

                  .required-asterisk {
                    color: #b4263b;
                    font-weight: 600;
                    font-size: 12px;
                    line-height: 16px;
                  }
                }
              }

              .tooltip {
                position: relative;
                display: flex;
                align-items: center;

                .valpal-icon {
                  display: flex;
                  align-items: center;
                  img {
                    height: 12px;
                  }
                }
                .tooltiptext {
                  visibility: hidden;
                  width: 200px;
                  background-color: black;
                  color: #fff;
                  text-align: center;
                  border-radius: 6px;
                  padding: 5px 0;
                  position: absolute;
                  z-index: 1;
                  bottom: 100%;
                  left: 50%;
                  margin-left: -60px;
                }

                :hover .tooltiptext {
                  visibility: visible;
                }
              }
            }
            .min-max {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
            }
          }

          .area-wrapper {
            display: grid;
            grid-template-columns: auto 70px;
            column-gap: 4px;
            align-items: flex-end;
          }
        }
        .specific-property-features-section {
          display: grid;
          row-gap: 8px;
          .section-content {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            align-items: center;
            column-gap: 16px;
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
        .flat-details-section {
          display: grid;
          row-gap: 8px;
          .section-content {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            align-items: center;
            column-gap: 16px;
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
        .facilities-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          align-self: stretch;

          .label {
            font-size: 18px;
            color: #0d2a38;
            font-weight: 700;
          }

          .facilities {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            align-self: stretch;

            .typography {
              flex: 1 0 0;
              font-style: normal;
              font-weight: 400;
            }
          }
        }
      }
      .right {
        display: grid;
        width: 100%;
        padding: 32px;
        border-radius: 12px;
        background: #f7f1e7;
        gap: 24px;
        box-sizing: border-box;

        .top {
          display: grid;
          gap: 16px;

          .property-score {
            display: grid;
            gap: 4px;

            .body5 {
              color: #a7a7a7;
              font-weight: 500;
              line-height: 16px;
            }

            .red {
              font-family: Roobert, serif;
              font-size: 48px;
              color: #e5155a;
              font-weight: 700;
              line-height: 64px;
            }
          }

          .body3 {
            font-family: At Gambit, serif;
          }
        }
        .sections-progress-list {
          display: grid;
          row-gap: 16px;
          .progress-item {
            display: flex;
            column-gap: 8px;

            .progress-item-indicator {
              border-radius: 50%;
              background-color: #cfd5d5;
              color: #cfd5d5;
              width: 24px;
              height: 24px;
              box-sizing: border-box;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .progress-item-text {
              color: #0d2a38;
            }

            &.active {
              .progress-item-indicator {
                background-color: #184d6d;
              }
            }
          }
        }
      }
    }
    .footer {
      display: flex;
      padding: 24px 36px;
      justify-content: space-between;
      align-items: center;

      .back-button {
      }

      .start-matching-button {
      }
    }
  }
`;
