import { useForm } from 'react-hook-form';
import { PropertyFormType } from './property.types';
import { AreaUnit, propertyFormSchema } from './property.constants';
import { yupResolver } from '@hookform/resolvers/yup';

export const usePropertyForm = () => {
  const form = useForm<PropertyFormType>({
    defaultValues: {
      title: '',
      location: {
        latitude: undefined,
        longitude: undefined
      },
      minBudget: undefined,
      maxBudget: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      propertyType: undefined,
      flatDetails: {
        propertyPurpose: undefined,
        floor: undefined,
        lift: false,
        security: false,
        gymSpa: false,
        outsideSpace: {}
      },
      houseDetails: {
        houseType: undefined
      },
      specificPropertyFeatures: {},
      area: undefined,
      areaUnit: AreaUnit.SquareMeter,
      parkingSpot: undefined,
      parkingType: undefined,
      epcRating: '',
      condition: undefined,
      description: '',
      areaOfInterest: '',
      propertyImages: []
    },
    resolver: yupResolver(propertyFormSchema) as any,
    mode: 'all'
  });

  return form;
};
