import { styled } from '@mui/system';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

import { Typography } from '../../../components/index';
import { Label } from '../../../components/index';
import { Icon } from '../../../components/index';
import { ShowGlobalLoading } from '../../../components/index';
import { PropertyCard } from '../../../components/index';

import { useSuggestedPropertiesWithoutAccount } from './useSuggestedPropertiesWithoutAccount';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';

import backgroundImg from '../../Home/forest.jpeg';
import { useCriteriaWithoutAccountStore } from '../../../globalState/useCriteriaWithoutAccount';

interface MatchesWithoutAccountSectionProps extends HTMLAttributes<HTMLDivElement> {
  onCreateAccountClick: () => any;
}

export const MatchesWithoutAccountSection = styled(
  ({ className, onCreateAccountClick }: MatchesWithoutAccountSectionProps) => {
    const suggestedProperties = useSuggestedPropertiesWithoutAccount();
    const criteriaStore = useCriteriaWithoutAccountStore();

    return (
      <div className={classNames('matches-without-account-section', className)}>
        {suggestedProperties.isFetching && <ShowGlobalLoading />}
        <div className='section-header'>
          <Typography className='matching-with'>
            Matching with
            <span className='address'> properties in {criteriaStore.criteria.area_of_interest}</span>
          </Typography>
          {suggestedProperties.data.length === 0 ? (
            <Typography variant='body5' className='sub-title'>
              No matches. Enter more details to refine your search.
            </Typography>
          ) : (
            <Typography variant='body5' className='sub-title'>
              Displaying {suggestedProperties.data.length} potential matches.
            </Typography>
          )}
        </div>
        <motion.div className='slides-wrapper'>
          {suggestedProperties.data.length > 0 && (
            <div className='results-card'>
              <Icon icon='intersect' size={64} color='#E5155A' />
              <Typography variant='body2' className='title'>
                Login or create an account to review the
                <span className='highlighted'> {suggestedProperties.data.length} potential matches</span>{' '}
                we’ve found
              </Typography>
              <Typography variant='body4' className='description'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </Typography>
            </div>
          )}

          {suggestedProperties.data.map((propertySuggestion, tenantIndex) => {
            const { property } = propertySuggestion;

            return (
              <PropertyCard
                key={tenantIndex}
                name={`${property.created_by?.first_name} ${property.created_by?.last_name}`}
                avatar={getAvatarFormIndex(property.created_by?.avatar)}
                inView={false}
                percentage={property.percentage}
                onViewPropertyClick={() => {}}
                image={`${property?.property_images?.[0]?.link || ''}`}
                size='large'
                property={property}
              />
            );
          })}
        </motion.div>
        <Label size='large' onClick={onCreateAccountClick}>
          Create Account
        </Label>
      </div>
    );
  }
)`
  &.matches-without-account-section {
    position: relative;
    min-height: calc(100vh - 112px);
    display: grid;
    padding: 36px;
    justify-content: center;
    justify-items: center;
    align-content: space-between;
    box-sizing: border-box;
    row-gap: 32px;
    overflow-x: clip;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(255, 251, 243, 0.9) 20%, rgba(255, 255, 255, 0.9) 100%)
        no-repeat;
      z-index: -1;
      top: -112px;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url(${backgroundImg});
      background-repeat: no-repeat;
      background-size: cover;
      opacity: 0.4;
      z-index: -2;
      top: -112px;
    }

    .section-header {
      display: grid;
      row-gap: 8px;
      align-items: center;
      justify-self: center;
      justify-items: center;

      .matching-with {
        font-family: Roobert, serif;
        font-size: 18px;
        line-height: 24px;
        font-weight: 700;
        .address {
          color: #184d6d;
        }
      }

      .sub-title {
        margin-top: 8px;
      }
    }

    .slides-wrapper {
      display: flex;
      column-gap: 24px;
      width: 672px;
      box-sizing: border-box;

      .results-card {
        padding: 64px;
        width: 672px;
        height: 452px;
        box-sizing: border-box;
        border-radius: 12px;
        flex-shrink: 0;
        display: grid;
        row-gap: 24px;
        justify-items: center;

        border: 2px solid #eee0d3;
        background: #f7f1e7;
        /* Nav Shadow */
        box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);

        .title,
        .description {
          text-align: center;
        }

        .title {
          .highlighted {
            color: #e5155a;
          }
        }
      }

      .no-matches {
        display: grid;
        align-items: center;
        justify-items: center;
        width: 100%;
      }
    }
  }
`;
