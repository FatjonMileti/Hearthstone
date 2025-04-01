// @ts-nocheck
import { styled } from '@mui/system';
import React from 'react';

import { HTMLMotionProps } from 'framer-motion';

import { SetCriteriaModal } from '../../SetCriteria/SetCriteriaModal';
import { useCriteriaForm } from '../../SetCriteria/useCriteriaForm';
import {
  ApiCriteriaDocumentType,
  CriteriaFormType,
  HouseType,
  PropertyFeatureType
} from '../../SetCriteria/criteria.types';
import { OutsideSpaceType } from '../../Properties/NewProperty/property.types';
import axios from '../../../utils/axios';
import { useProfileStore } from '../../../globalState/profile';
import { useUserStore } from '../../../globalState/user';
import { Parking } from '../../Properties/NewProperty/property.constants';
import { useCriteriaWithoutAccountStore } from '../../../globalState/useCriteriaWithoutAccount';

export interface SetCriteriaProps extends HTMLMotionProps<'div'> {
  onNext: () => void;
  onBack: () => void;
}

export const SetCriteria = styled(({ onNext, onBack }: SetCriteriaProps) => {
  const criteriaWithoutAccountStore = useCriteriaWithoutAccountStore();

  const criteriaForm = useCriteriaForm();
  const profileStore = useProfileStore();
  const userStore = useUserStore();

  React.useEffect(() => {
    if (Object.keys(criteriaWithoutAccountStore.criteria).length > 1) {
      loadCriteria(criteriaWithoutAccountStore.criteria);
    }
  }, []);

  const loadCriteria = (data: any) => {
    criteriaForm.setValue('transactionType', data.transaction_type_string);

    criteriaForm.setValue('areaOfInterest', data.area_of_interest);

    if (data?.asset_address?.latitude && data?.asset_address?.longitude) {
      criteriaForm.setValue('location', {
        latitude: data.asset_address.latitude,
        longitude: data.asset_address.longitude
      });
    }

    criteriaForm.setValue('radius', data.radius);

    criteriaForm.setValue('whenDoYouWantToMove', data.moving_time || undefined);

    data.property_type.map((type: keyof CriteriaFormType['propertyType']) => {
      criteriaForm.setValue(`propertyType.${type}`, true);
    });

    criteriaForm.setValue(
      'houseDetails.houseType',
      Object.fromEntries((data?.house_details?.house_type || []).map((key: HouseType) => [key, true])) as {
        [key in HouseType]: boolean;
      }
    );
    criteriaForm.setValue('houseDetails.homeStyle', data.house_details.home_style);

    criteriaForm.setValue('houseDetails.condition', data.house_details?.condition);

    criteriaForm.setValue('houseDetails.parking', data.house_details?.parking);

    criteriaForm.setValue('houseDetails.preferredSize', data.house_details.preferred_size);
    criteriaForm.setValue('houseDetails.garden', data.house_details.garden);
    if (data.house_details?.storeys) {
      criteriaForm.setValue('houseDetails.storeys', data.house_details.storeys);
    }
    criteriaForm.setValue('houseDetails.nrOfBedrooms', data.house_details.number_of_bedrooms);
    criteriaForm.setValue('houseDetails.nrOfBathrooms', data.house_details.number_of_bathrooms);

    criteriaForm.setValue('flatDetails.propertyPurpose', data?.flat_details?.property_purpose);
    criteriaForm.setValue('flatDetails.preferredFloor', data.flat_details.preferred_floor);
    criteriaForm.setValue('flatDetails.condition', data.flat_details.condition);

    (data.flat_details.outside_space || []).forEach((os: OutsideSpaceType) => {
      criteriaForm.setValue(`flatDetails.outsideSpace.${os}`, true);
    });

    if (data.flat_details.preferred_size?.size && data.flat_details.preferred_size?.unit) {
      criteriaForm.setValue('flatDetails.preferredSize', data.flat_details.preferred_size);
    }

    if (data.flat_details?.number_of_bedrooms?.max) {
      criteriaForm.setValue('flatDetails.nrOfBedrooms', data.flat_details.number_of_bedrooms);
    }

    if (data.flat_details?.number_of_bathrooms?.max) {
      criteriaForm.setValue('flatDetails.nrOfBathrooms', data.flat_details.number_of_bathrooms);
    }

    criteriaForm.setValue('flatDetails.lift', data?.flat_details?.lift);
    criteriaForm.setValue('flatDetails.security', data?.flat_details?.security);
    criteriaForm.setValue('flatDetails.parkingSpace', data?.flat_details?.parking_space);
    criteriaForm.setValue('flatDetails.gymSpa', data?.flat_details?.gym_spa);

    (
      Object.keys(criteriaForm.getValues('propertyClass')) as [keyof CriteriaFormType['propertyClass']]
    ).forEach((key) => {
      criteriaForm.setValue(`propertyClass.${key}`, data.property_preferences.includes(key));
    });

    (
      Object.keys(criteriaForm.getValues('propertyFeatures')) as [keyof CriteriaFormType['propertyFeatures']]
    ).forEach((key) => {
      criteriaForm.setValue(`propertyFeatures.${key}`, data.property_features.includes(key));
    });

    if (data.floor_size?.includes('-')) {
      criteriaForm.setValue('area', [
        parseInt(data.floor_size.split('-')[0]),
        parseInt(data.floor_size.split('-')[1])
      ]);
    }

    if (data?.floor_size_unit) {
      criteriaForm.setValue('areaUnit', data?.floor_size_unit);
    }

    if (data.room_details?.number_of_bedrooms) {
      criteriaForm.setValue('nrOfBedrooms', [
        parseInt(data.room_details?.number_of_bedrooms?.split('-')[0] || '0'),
        parseInt(data.room_details?.number_of_bedrooms?.split('-')[1] || '0')
      ]);
    }

    if (data.room_details?.number_of_bathrooms) {
      criteriaForm.setValue('nrOfBathrooms', [
        parseInt(data.room_details?.number_of_bathrooms?.split('-')[0] || '0'),
        parseInt(data.room_details?.number_of_bathrooms?.split('-')[1] || '0')
      ]);
    }

    criteriaForm.setValue(
      'specificPropertyFeatures',
      data.specific_property_features.reduce((acc: { [key: string]: boolean }, spf: string) => {
        acc[spf] = true;
        return acc;
      }, {}) as CriteriaFormType['specificPropertyFeatures']
    );

    criteriaForm.setValue('parkingType.On street', data.parking_details?.includes(Parking.OnStreet));
    criteriaForm.setValue('parkingType.Off street', data.parking_details?.includes(Parking.OffStreet));
    criteriaForm.setValue('parkingType.Garage', data.parking_details?.includes(Parking.Garage));

    criteriaForm.setValue('idealBudget', [data.budget?.min, data.budget?.max]);

    if (data.budget_for) {
      criteriaForm.setValue('budgetFor', data.budget_for);
    }

    criteriaForm.setValue('depositAmount', data.deposit_amount);

    criteriaForm.setValue('creditScore', data.credit_score_requirements);
    criteriaForm.setValue(
      'contractDetails',
      data.contract_details.reduce((acc: { [key: string]: boolean }, cd: string) => {
        acc[cd] = true;
        return acc;
      }, {}) as CriteriaFormType['contractDetails']
    );

    if (data?.distance_from_underground) {
      criteriaForm.setValue('distanceFromUnderground', data.distance_from_underground);
    }

    if (data?.distance_from_schools) {
      criteriaForm.setValue('distanceFromSchools', data.distance_from_schools);
    }

    if (data?.distance_from_high_street) {
      criteriaForm.setValue('distanceFromHighStreet', data.distance_from_high_street);
    }

    if (data?.distance_from_gym) {
      criteriaForm.setValue('distanceFromGym', data.distance_from_gym);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: Partial<ApiCriteriaDocumentType> = {
        transaction_type_string: criteriaForm.getValues('transactionType'),
        area_of_interest: criteriaForm.getValues('areaOfInterest'),
        asset_address: criteriaForm.getValues('location'),
        radius: criteriaForm.getValues('radius'),
        moving_time: criteriaForm.getValues('whenDoYouWantToMove') || undefined,

        property_type: Object.entries(criteriaForm.getValues('propertyType'))
          .filter(([, value]) => value)
          .map(([key]) => key) as ApiCriteriaDocumentType['property_type'],
        house_details: {
          house_type: Object.entries(criteriaForm.getValues('houseDetails.houseType') || {})
            .filter(([, value]) => !!value)
            .map(([key]) => key) as HouseType[],
          home_style: criteriaForm.getValues('houseDetails.homeStyle') || undefined,
          preferred_size: criteriaForm.getValues('houseDetails.preferredSize'),
          condition: criteriaForm.getValues('houseDetails.condition') || undefined,
          parking: criteriaForm.getValues('houseDetails.parking') || undefined,
          garden: criteriaForm.getValues('houseDetails.garden'),
          storeys: criteriaForm.getValues('houseDetails.storeys'),
          number_of_bedrooms: criteriaForm.getValues('houseDetails.nrOfBedrooms'),
          number_of_bathrooms: criteriaForm.getValues('houseDetails.nrOfBathrooms')
        },
        flat_details: {
          property_purpose: criteriaForm.getValues('flatDetails.propertyPurpose') || undefined,
          preferred_floor: criteriaForm.getValues('flatDetails.preferredFloor') || undefined,
          condition: criteriaForm.getValues('flatDetails.condition') || undefined,

          outside_space: Object.entries(criteriaForm.getValues('flatDetails.outsideSpace'))
            .filter(([, value]) => value)
            .map(([key]) => key) as OutsideSpaceType[],
          preferred_size: criteriaForm.getValues('flatDetails.preferredSize'),
          number_of_bedrooms: criteriaForm.getValues('flatDetails.nrOfBedrooms'),
          number_of_bathrooms: criteriaForm.getValues('flatDetails.nrOfBathrooms'),

          lift: criteriaForm.getValues('flatDetails.lift'),
          security: criteriaForm.getValues('flatDetails.security'),
          gym_spa: criteriaForm.getValues('flatDetails.gymSpa'),
          parking_space: criteriaForm.getValues('flatDetails.parkingSpace')
        },
        property_preferences: [
          criteriaForm.getValues('propertyClass.New home') ? ['New home'] : [],
          criteriaForm.getValues('propertyClass.Retirement home') ? ['Retirement home'] : [],
          criteriaForm.getValues('propertyClass.Shared ownership') ? ['Shared ownership'] : [],
          criteriaForm.getValues('propertyClass.Shared ownership') ? ['Auction'] : []
        ].flat(),

        property_features: [
          criteriaForm.getValues('propertyFeatures.Parks nearby') ? ['Parks nearby'] : [],
          criteriaForm.getValues('propertyFeatures.Public transport nearby')
            ? ['Public transport nearby']
            : [],
          criteriaForm.getValues('propertyFeatures.Shopping centers nearby')
            ? ['Shopping centers nearby']
            : []
        ].flat() as PropertyFeatureType[],

        floor_size: `${criteriaForm.getValues('area')[0]}-${criteriaForm.getValues('area')[1]}`,
        floor_size_unit: criteriaForm.getValues('areaUnit'),
        room_details: {
          number_of_bedrooms: `${criteriaForm.getValues('nrOfBedrooms')[0]}-${
            criteriaForm.getValues('nrOfBedrooms')[1]
          }`,
          number_of_bathrooms: criteriaForm.getValues('nrOfBathrooms').join('-')
        },
        specific_property_features: Object.entries(criteriaForm.getValues('specificPropertyFeatures'))
          .filter(([, value]) => value)
          .map(([key]) => key),

        distance_from_underground: criteriaForm.getValues('distanceFromUnderground'),
        distance_from_schools: criteriaForm.getValues('distanceFromSchools'),
        distance_from_high_street: criteriaForm.getValues('distanceFromHighStreet'),
        distance_from_gym: criteriaForm.getValues('distanceFromGym'),
        budget: {
          min: criteriaForm.getValues('idealBudget')[0],
          max: criteriaForm.getValues('idealBudget')[1]
        },
        budget_for: criteriaForm.getValues('budgetFor'),
        deposit_amount: criteriaForm.getValues('depositAmount'),
        credit_score_requirements: criteriaForm.getValues('creditScore'),
        contract_details: Object.entries(criteriaForm.getValues('contractDetails'))
          .filter(([, value]) => value)
          .map(([key]) => key)
      };

      await axios(userStore.auth.access_token).patch(`/api/criteria`, payload);

      await onNext();
      profileStore.fetchProfile(userStore.auth.access_token);
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  return (
    <SetCriteriaModal
      showTabs={true}
      open={true}
      onBack={onBack}
      onBackdropClick={onBack}
      form={criteriaForm}
      onStartMatchingClick={handleSubmit}
    />
  );
})``;
