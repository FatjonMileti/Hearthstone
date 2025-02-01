import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Label, Typography, Icon } from '../../../components';

import { useCriteriaStore } from '../../../globalState/criteria';

import { useSuggestedProperties } from '../../Suggestions/SuggestionsProperties/useSuggestedProperties';
import { useUserStore } from '../../../globalState/user';
import { useGlobalSetCriteria } from '../../SetCriteria/GlobalSetCriteria';

interface PropertiesMatchingHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const PropertiesMatchingHeader = styled(({ className }: PropertiesMatchingHeaderProps) => {
  const criteriaStore = useCriteriaStore();
  const userStore = useUserStore();
  const suggestedProperties = useSuggestedProperties({ params: { disliked: false, chosen: false } });

  const globalSetCriteria = useGlobalSetCriteria();

  return (
    <>
      <div className={classNames(className, 'properties-matching-header')}>
        <div className='criteria-wrapper'>
          <div className='criteria'>
            <Typography variant='body6' className='criteria-key'>
              Looking for
            </Typography>
            <Typography variant='body5' className='criteria-value'>
              Properties
            </Typography>
          </div>
          <div className='divider-line' />
          <div className='criteria'>
            <Typography variant='body6' className='criteria-key'>
              Location
            </Typography>
            <Typography variant='body5' className='criteria-value'>
              {criteriaStore.criteria.area_of_interest}
            </Typography>
          </div>

          <div className='divider-line' />
          <div className='criteria'>
            <Typography variant='body6' className='criteria-key'>
              Budget
            </Typography>
            <Typography variant='body5' className='criteria-value'>
              {`${criteriaStore.criteria.budget?.min}£ - ${criteriaStore.criteria.budget?.max}£`}
            </Typography>
          </div>
          <div className='divider-line' />
        </div>
        <Label
          variant='tertiary'
          onClick={() =>
            globalSetCriteria.openSetCriteria({
              afterSetCriteria: () => {
                suggestedProperties.refetch();
                criteriaStore.fetchCriteria(userStore.auth.access_token);
              }
            })
          }>
          <Icon icon='filter' />
          Preferences
        </Label>
      </div>
    </>
  );
})`
  &.properties-matching-header {
    padding: 12px 32px;

    background: #fff;
    /* Card Shadow */
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 32px;

    display: flex;
    column-gap: 16px;
    font-weight: 500;

    .criteria-wrapper {
      display: flex;
      column-gap: 16px;

      .criteria {
        display: grid;

        .criteria-key {
          font-weight: 500;
          color: #a7a7a7;
        }
        .criteria-value {
          font-weight: 700;
          color: #0d2a38;
        }
      }
    }

    .divider-line {
      width: 1px;
      background: #e7e7e7;
    }
  }
`;
