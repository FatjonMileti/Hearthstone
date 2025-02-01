import { useForm, UseFormReturn } from 'react-hook-form';
import { CriteriaFormType } from './criteria.types';
import { AreaUnit, PropertyType } from '../Properties/NewProperty/property.constants';
import {
  BudgetFor,
  ContractDetail,
  CreditScore,
  criteriaFormSchema,
  DistanceUnit,
  SpecificPropertyFeature,
  Transaction
} from './criteria.contants';
import { yupResolver } from '@hookform/resolvers/yup';

export const useCriteriaForm = (): UseFormReturn<CriteriaFormType> => {
  const criteriaForm = useForm<CriteriaFormType>({
    defaultValues: {
      areaOfInterest: '',
      location: {},
      radius: undefined,
      propertyType: Object.fromEntries(Object.values(PropertyType).map((pt) => [pt, false])),

      flatDetails: {
        propertyPurpose: undefined,
        preferredSize: {
          size: {
            min: 0,
            max: 4000
          },
          unit: AreaUnit.SquareFoot
        },
        condition: undefined,
        outsideSpace: {},
        nrOfBedrooms: {
          min: 1,
          max: 4
        },
        nrOfBathrooms: {
          min: 1,
          max: 3
        }
      },

      houseDetails: {
        houseType: undefined,
        preferredSize: {
          size: {
            min: 0,
            max: 10000
          },
          unit: AreaUnit.SquareFoot
        },
        garden: {
          size: {
            min: 0,
            max: 1000
          },
          unit: AreaUnit.SquareFoot
        },
        storeys: {
          min: 1,
          max: 3
        },
        condition: undefined,
        nrOfBedrooms: {
          min: 1,
          max: 4
        },
        nrOfBathrooms: {
          min: 1,
          max: 3
        }
      },

      propertyClass: {
        'New home': true,
        'Retirement home': true,
        'Shared ownership': true,
        Auction: true
      },
      propertyFeatures: {
        'Parks nearby': true,
        'Public transport nearby': true,
        'Shopping centers nearby': true
      },
      whenDoYouWantToMove: undefined,
      transactionType: Transaction.Rent,
      idealBudget: [1000, 5000],
      budgetFor: BudgetFor.Month,
      depositAmount: undefined,
      contractDetails: Object.fromEntries(Object.values(ContractDetail).map((cd) => [cd, false])),
      creditScore: CreditScore.Good,
      area: [50, 100],
      areaUnit: AreaUnit.SquareMeter,
      nrOfBedrooms: [1, 4],
      nrOfBathrooms: [1, 3],
      specificPropertyFeatures: Object.fromEntries(
        Object.values(SpecificPropertyFeature).map((spf) => [spf, false])
      ),
      distanceFromUnderground: {
        value: {
          min: 0,
          max: 20
        },
        unit: DistanceUnit.Km,
      
      },
      distanceFromSchools: {
        value: {
          min: 0,
          max: 20
        },
        unit: DistanceUnit.Km,
      
      },
      distanceFromHighStreet: {
        value: {
          min: 0,
          max: 20
        },
        unit: DistanceUnit.Km,
      },
      distanceFromGym: {
        value: {
          min: 0,
          max: 20
        },
        unit: DistanceUnit.Km,
      }
    },
    resolver: yupResolver(criteriaFormSchema),
    mode: 'all'
  });

  return criteriaForm;
};
