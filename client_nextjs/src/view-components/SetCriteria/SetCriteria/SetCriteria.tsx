// @ts-nocheck
import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

import axios from '../../../utils/axios';
import request from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';

import { ApiCriteriaDocumentType, CriteriaFormType, HouseType, PropertyFeatureType } from '../criteria.types';

import { SetCriteriaHouseDetails } from './SetCriteria.HouseDetails';
import { SetCriteriaLocation } from './SetCriteria.Location';
import { SetCriteriaHouseType } from './SetCriteria.HouseType';
import { SetCriteriaBudget } from './SetCriteria.Budged';

import { Typography } from '../../../components';
import { Button } from '../../../components';
import { Label } from '../../../components';
import { ShowGlobalLoading } from '../../../components';

import { Parking } from '../../Properties/NewProperty/property.constants';
import { useProfileStore } from '../../../globalState/profile';

import { OutsideSpaceType } from '../../Properties/NewProperty/property.types';
import { CloseButton } from '../../../components';
import { useCriteriaForm } from '../useCriteriaForm';

const tabLabels = ['Location', 'House type', 'Budget', 'House details'];

interface SetCriteriaProps extends HTMLAttributes<HTMLDivElement> {
  afterRefineSearch?: () => void;
  onClose?: () => void;
}
export const SetCriteria = styled(
  ({ className, afterRefineSearch = () => {}, onClose }: SetCriteriaProps) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const [loading, setLoading] = React.useState<boolean>(false);

    const { auth } = useUserStore();

    const profileStore = useProfileStore();

    React.useEffect(() => {
      loadCriteria().catch((err) => {
        throw err;
      });
    }, []);

    const loadCriteria = async () => {
      try {
        setLoading(true);
        const { data } = await request(auth.access_token).get<ApiCriteriaDocumentType>('/api/criteria');
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        mainForm.setValue('transactionType', data.transaction_type_string);

        mainForm.setValue('areaOfInterest', data.area_of_interest);

        if (data?.asset_address?.latitude && data?.asset_address?.longitude) {
          mainForm.setValue('location', {
            latitude: data.asset_address.latitude,
            longitude: data.asset_address.longitude
          });
        }

        mainForm.setValue('radius', data.radius);

        mainForm.setValue('whenDoYouWantToMove', data.moving_time || undefined);

        data.property_type.map((type: keyof CriteriaFormType['propertyType']) => {
          mainForm.setValue(`propertyType.${type}`, true);
        });

        mainForm.setValue(
          'houseDetails.houseType',
          Object.fromEntries(
            (data?.house_details?.house_type || []).map((key: HouseType) => [key, true])
          ) as {
            [key in HouseType]: boolean;
          }
        );
        mainForm.setValue('houseDetails.homeStyle', data.house_details.home_style);

        mainForm.setValue('houseDetails.condition', data.house_details?.condition);

        mainForm.setValue('houseDetails.parking', data.house_details?.parking);

        mainForm.setValue('houseDetails.preferredSize', data.house_details.preferred_size);
        mainForm.setValue('houseDetails.garden', data.house_details.garden);
        if (data.house_details?.storeys) {
          mainForm.setValue('houseDetails.storeys', data.house_details.storeys);
        }
        mainForm.setValue('houseDetails.nrOfBedrooms', data.house_details.number_of_bedrooms);
        mainForm.setValue('houseDetails.nrOfBathrooms', data.house_details.number_of_bathrooms);

        // house_details: {
        //   house_type: Object.entries(mainForm.getValues('houseDetails.houseType') || {})
        //       .filter(([key, value]) => value)
        //       .map(([key]) => key)
        // },

        mainForm.setValue('flatDetails.propertyPurpose', data?.flat_details?.property_purpose);
        mainForm.setValue('flatDetails.preferredFloor', data.flat_details.preferred_floor);
        mainForm.setValue('flatDetails.condition', data.flat_details.condition);

        (data.flat_details.outside_space || []).forEach((os) => {
          mainForm.setValue(`flatDetails.outsideSpace.${os}`, true);
        });

        if (data.flat_details.preferred_size?.size && data.flat_details.preferred_size?.unit) {
          mainForm.setValue('flatDetails.preferredSize', data.flat_details.preferred_size);
        }

        if (data.flat_details?.number_of_bedrooms?.max) {
          mainForm.setValue('flatDetails.nrOfBedrooms', data.flat_details.number_of_bedrooms);
        }

        if (data.flat_details?.number_of_bathrooms?.max) {
          mainForm.setValue('flatDetails.nrOfBathrooms', data.flat_details.number_of_bathrooms);
        }

        mainForm.setValue('flatDetails.lift', data?.flat_details?.lift);
        mainForm.setValue('flatDetails.security', data?.flat_details?.security);
        mainForm.setValue('flatDetails.parkingSpace', data?.flat_details?.parking_space);
        mainForm.setValue('flatDetails.gymSpa', data?.flat_details?.gym_spa);

        (
          Object.keys(mainForm.getValues('propertyClass')) as [keyof CriteriaFormType['propertyClass']]
        ).forEach((key) => {
          mainForm.setValue(`propertyClass.${key}`, data.property_preferences.includes(key));
        });

        (
          Object.keys(mainForm.getValues('propertyFeatures')) as [keyof CriteriaFormType['propertyFeatures']]
        ).forEach((key) => {
          mainForm.setValue(`propertyFeatures.${key}`, data.property_features.includes(key));
        });

        if (data.floor_size?.includes('-')) {
          mainForm.setValue('area', [
            parseInt(data.floor_size.split('-')[0]),
            parseInt(data.floor_size.split('-')[1])
          ]);
        }

        if (data?.floor_size_unit) {
          mainForm.setValue('areaUnit', data?.floor_size_unit);
        }

        if (data.room_details?.number_of_bedrooms) {
          mainForm.setValue('nrOfBedrooms', [
            parseInt(data.room_details?.number_of_bedrooms?.split('-')[0] || '0'),
            parseInt(data.room_details?.number_of_bedrooms?.split('-')[1] || '0')
          ]);
        }

        if (data.room_details?.number_of_bathrooms) {
          mainForm.setValue('nrOfBathrooms', [
            parseInt(data.room_details?.number_of_bathrooms?.split('-')[0] || '0'),
            parseInt(data.room_details?.number_of_bathrooms?.split('-')[1] || '0')
          ]);
        }

        mainForm.setValue(
          'specificPropertyFeatures',
          data.specific_property_features.reduce((acc: { [key: string]: boolean }, spf: string) => {
            acc[spf] = true;
            return acc;
          }, {}) as CriteriaFormType['specificPropertyFeatures']
        );

        mainForm.setValue('parkingType.On street', data.parking_details?.includes(Parking.OnStreet));
        mainForm.setValue('parkingType.Off street', data.parking_details?.includes(Parking.OffStreet));
        mainForm.setValue('parkingType.Garage', data.parking_details?.includes(Parking.Garage));

        mainForm.setValue('idealBudget', [data.budget?.min, data.budget?.max]);

        if (data.budget_for) {
          mainForm.setValue('budgetFor', data.budget_for);
        }

        mainForm.setValue('depositAmount', data.deposit_amount);

        mainForm.setValue('creditScore', data.credit_score_requirements);
        mainForm.setValue(
          'contractDetails',
          data.contract_details.reduce((acc: { [key: string]: boolean }, cd: string) => {
            acc[cd] = true;
            return acc;
          }, {}) as CriteriaFormType['contractDetails']
        );

        if (data?.distance_from_underground) {
          mainForm.setValue('distanceFromUnderground', data.distance_from_underground);
        }

        if (data?.distance_from_schools) {
          mainForm.setValue('distanceFromSchools', data.distance_from_schools);
        }

        if (data?.distance_from_high_street) {
          mainForm.setValue('distanceFromHighStreet', data.distance_from_high_street);
        }

        if (data?.distance_from_gym) {
          mainForm.setValue('distanceFromGym', data.distance_from_gym);
        }
      } catch (err) {
        console.log(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async () => {
      try {
        setLoading(true);
        const payload: Partial<ApiCriteriaDocumentType> = {
          transaction_type_string: mainForm.getValues('transactionType'),
          area_of_interest: mainForm.getValues('areaOfInterest'),
          asset_address: mainForm.getValues('location'),
          radius: mainForm.getValues('radius'),
          moving_time: mainForm.getValues('whenDoYouWantToMove') || undefined,

          property_type: Object.entries(mainForm.getValues('propertyType'))
            .filter(([, value]) => value)
            .map(([key]) => key) as ApiCriteriaDocumentType['property_type'],
          house_details: {
            house_type: Object.entries(mainForm.getValues('houseDetails.houseType') || {})
              .filter(([, value]) => !!value)
              .map(([key]) => key) as HouseType[],
            home_style: mainForm.getValues('houseDetails.homeStyle') || undefined,
            preferred_size: mainForm.getValues('houseDetails.preferredSize'),
            condition: mainForm.getValues('houseDetails.condition') || undefined,
            parking: mainForm.getValues('houseDetails.parking') || undefined,
            garden: mainForm.getValues('houseDetails.garden'),
            storeys: mainForm.getValues('houseDetails.storeys'),
            number_of_bedrooms: mainForm.getValues('houseDetails.nrOfBedrooms'),
            number_of_bathrooms: mainForm.getValues('houseDetails.nrOfBathrooms')
          },
          flat_details: {
            property_purpose: mainForm.getValues('flatDetails.propertyPurpose') || undefined,
            preferred_floor: mainForm.getValues('flatDetails.preferredFloor') || undefined,
            condition: mainForm.getValues('flatDetails.condition') || undefined,

            outside_space: Object.entries(mainForm.getValues('flatDetails.outsideSpace'))
              .filter(([, value]) => value)
              .map(([key]) => key) as OutsideSpaceType[],
            preferred_size: mainForm.getValues('flatDetails.preferredSize'),
            number_of_bedrooms: mainForm.getValues('flatDetails.nrOfBedrooms'),
            number_of_bathrooms: mainForm.getValues('flatDetails.nrOfBathrooms'),

            lift: mainForm.getValues('flatDetails.lift'),
            security: mainForm.getValues('flatDetails.security'),
            gym_spa: mainForm.getValues('flatDetails.gymSpa'),
            parking_space: mainForm.getValues('flatDetails.parkingSpace')
          },
          property_preferences: [
            mainForm.getValues('propertyClass.New home') ? ['New home'] : [],
            mainForm.getValues('propertyClass.Retirement home') ? ['Retirement home'] : [],
            mainForm.getValues('propertyClass.Shared ownership') ? ['Shared ownership'] : [],
            mainForm.getValues('propertyClass.Shared ownership') ? ['Auction'] : []
          ].flat(),

          property_features: [
            mainForm.getValues('propertyFeatures.Parks nearby') ? ['Parks nearby'] : [],
            mainForm.getValues('propertyFeatures.Public transport nearby') ? ['Public transport nearby'] : [],
            mainForm.getValues('propertyFeatures.Shopping centers nearby') ? ['Shopping centers nearby'] : []
          ].flat() as PropertyFeatureType[],

          floor_size: `${mainForm.getValues('area')[0]}-${mainForm.getValues('area')[1]}`,
          floor_size_unit: mainForm.getValues('areaUnit'),
          room_details: {
            number_of_bedrooms: `${mainForm.getValues('nrOfBedrooms')[0]}-${
              mainForm.getValues('nrOfBedrooms')[1]
            }`,
            number_of_bathrooms: mainForm.getValues('nrOfBathrooms').join('-')
          },
          specific_property_features: Object.entries(mainForm.getValues('specificPropertyFeatures'))
            .filter(([, value]) => value)
            .map(([key]) => key),

          // parking_details: [
          //   mainForm.getValues('parkingType')[Parking.Garage] ? [Parking.Garage] : [],
          //   mainForm.getValues('parkingType')[Parking.OffStreet] ? [Parking.OffStreet] : [],
          //   mainForm.getValues('parkingType')[Parking.OnStreet] ? [Parking.OnStreet] : []
          // ].flat(),

          distance_from_underground: mainForm.getValues('distanceFromUnderground'),
          distance_from_schools: mainForm.getValues('distanceFromSchools'),
          distance_from_high_street: mainForm.getValues('distanceFromHighStreet'),
          distance_from_gym: mainForm.getValues('distanceFromGym'),
          budget: {
            min: mainForm.getValues('idealBudget')[0],
            max: mainForm.getValues('idealBudget')[1]
          },
          budget_for: mainForm.getValues('budgetFor'),
          deposit_amount: mainForm.getValues('depositAmount'),
          credit_score_requirements: mainForm.getValues('creditScore'),
          contract_details: Object.entries(mainForm.getValues('contractDetails'))
            .filter(([, value]) => value)
            .map(([key]) => key)
        };

        await axios(auth.access_token).patch(`/api/criteria`, payload);

        // await new Promise((resolve) => setTimeout(resolve, 1000));

        afterRefineSearch();
        profileStore.fetchProfile(auth.access_token);
      } catch (err) {
        console.log(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const mainForm = useCriteriaForm();

    return (
      <>
        {loading && <ShowGlobalLoading />}

        <div className={classNames(className, 'criteria-container')}>
          <div className='criteria-header'>
            <Typography variant='body2'>Refine your search</Typography>
            <div className='action-buttons'>
              <Button
                size='small'
                onClick={async () => {
                  await handleSubmit();
                  onClose && onClose();
                }}
                disabled={loading}>
                Save changes
              </Button>
              {onClose && <CloseButton onClick={onClose} />}
            </div>
          </div>
          <div className='criteria-tabs-bar'>
            {tabLabels.map((tabLabel, tabLabelIndex) => (
              <Label
                className='criteria-tab-label'
                active={tabLabelIndex === selectedTab}
                variant='tertiary'
                key={tabLabelIndex}
                onClick={() => setSelectedTab(tabLabelIndex)}>
                {tabLabel}
              </Label>
            ))}
          </div>
          <div className='criteria-body'>
            {
              [
                <SetCriteriaLocation form={mainForm} />,
                <SetCriteriaHouseType form={mainForm} />,
                <SetCriteriaBudget form={mainForm} />,
                // <SetCriteriaHouseDetails form={mainForm} />
              ][selectedTab]
            }
          </div>
        </div>
      </>
    );
  }
)`
  &.criteria-container {
    display: grid;
    grid-template-rows: min-content min-content auto;

    .criteria-header {
      padding: 20px 0;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      background: white;

      .action-buttons {
        display: flex;
        column-gap: 16px;
      }
    }

    .criteria-tabs-bar {
      padding: 0;
      display: flex;
      //justify-content: space-between;
      column-gap: 12px;
      background: white;
      box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);

      .criteria-tab-label {
        padding: 16px 12px !important;
        height: auto !important;
        color: #646464;
      }
    }

    .criteria-body {
      padding: 36px 0;
    }
  }
`;
