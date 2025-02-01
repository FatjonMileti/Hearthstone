import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';

import {
  Icon,
  Label,
  PropertyCard,
  Typography,
  ShowGlobalLoading,
  SegmentControl
} from '../../../components';

import { useSuggestedProperties } from './useSuggestedProperties';
import { useMatchesCount } from '../../Matches/useMatchesCount';
import { ViewProperty } from '../../Matches/MatchesProperties/ViewProperty';

import { useUserStore } from '../../../globalState/user';
import axios from '../../../utils/axios';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import { useCriteriaStore } from '../../../globalState/criteria';
import { useGlobalSetCriteria } from '../../SetCriteria/GlobalSetCriteria';

import forestBackgroundImage from '../../Home/forest.jpeg';
import { SuggestedPropertyType } from '../../Matches/matches.type';

enum ActiveTab {
  Perfect = 'Perfect',
  Potential = 'Potential'
}

interface SuggestionsPropertiesProps extends HTMLAttributes<HTMLDivElement> {}
export const SuggestionsProperties = styled(({ className }: SuggestionsPropertiesProps) => {
  const [activeTab, setActiveTab] = React.useState(ActiveTab.Potential);

  const suggestedProperties = useSuggestedProperties({
    params: { chosen: false },
    options: {
      refetchOnMount: true
    }
  });

  const criteriaStore = useCriteriaStore();
  const [activeSlide, setActiveSlide] = React.useState<number>(0);

  const [propertyToView, setPropertyToView] = React.useState<SuggestedPropertyType | null>(null);

  const userStore = useUserStore();

  const suggestedProperty: SuggestedPropertyType = suggestedProperties.data[activeSlide];

  const matchesCount = useMatchesCount({
    params: { chosen: true, disliked: false }
  });

  const globalSetCriteria = useGlobalSetCriteria();

  const next = () =>
    setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % suggestedProperties.data?.length));
  const previous = () => {
    activeSlide >= 1 && setActiveSlide((activeSlide) => activeSlide - 1);
  };

  const likeProperty = useMutation({
    mutationFn: ({ propertyId }: { propertyId: string }) => {
      return axios(userStore.auth.access_token).post('/api/match/properties', {
        property: propertyId
      });
    },
    onSuccess: () => {
      if (propertyToView) {
        setPropertyToView(null);
      }
      if (suggestedProperties.data.length - 1 === activeSlide && suggestedProperties.data.length > 1) {
        previous();
      }
      suggestedProperties.refetch();
      matchesCount.refetch();
    }
  });

  const dislikeProperty = useMutation({
    mutationFn: ({ propertyId }: { propertyId: string }) => {
      return axios(userStore.auth.access_token).post('/api/match/dislikes/properties', {
        property: propertyId
      });
    },
    onSuccess: () => {
      if (propertyToView) {
        setPropertyToView(null);
      }
      if (suggestedProperties.data.length - 1 === activeSlide && suggestedProperties.data.length > 1) {
        previous();
      }
      suggestedProperties.refetch();
      matchesCount.refetch();
    }
  });

  const onMatchOptionsClick = () => {
    globalSetCriteria.openSetCriteria({
      afterSetCriteria: () => {
        suggestedProperties.refetch();
        matchesCount.refetch();
      }
    });
  };

  return (
    <>
      {(suggestedProperties.isFetching || likeProperty.isLoading || dislikeProperty.isLoading) && (
        <ShowGlobalLoading />
      )}
      <div className={classNames('suggestions-properties', className)}>
        <div className='section-header'>
          <div className='header-left-content'>
            <Typography>My matches</Typography>
          </div>

          <div className='tabs-wrapper'>
            <SegmentControl
              label='Potential matches'
              active={activeTab === ActiveTab.Potential}
              onClick={() => setActiveTab(ActiveTab.Potential)}
            />
            <SegmentControl
              label='Perfect matches'
              active={activeTab === ActiveTab.Perfect}
              onClick={() => setActiveTab(ActiveTab.Perfect)}
              counter={5}
            />
          </div>

          <Label variant='special' size='large' className='filters-button' onClick={onMatchOptionsClick}>
            <Icon icon='filter' />
            Match options ({suggestedProperties.data?.length})
          </Label>
        </div>

        <motion.div className='slides-wrapper'>
          {!suggestedProperties.isFetching && !suggestedProperties.data.length && (
            <div className='no-matches-card'>
              <div className='title-description'>
                <Icon icon='intersect' size={64} color='#E5155A' />
                <Typography variant='body2' className='title'>
                  Looking for more matches?
                </Typography>
                <Typography variant='body4' className='description'>
                  There are <span className='red-text'>28 available properties</span> that could be a perfect
                  match for you if you are looking to adapt your{' '}
                  <span className='black-text'>Budget Preferences.</span>
                </Typography>
              </div>
              <Label
                variant='secondary'
                size='large'
                className='action-button'
                onClick={() =>
                  globalSetCriteria.openSetCriteria({
                    afterSetCriteria: () => {
                      suggestedProperties.refetch();
                      criteriaStore.fetchCriteria(userStore.auth.access_token);
                    }
                  })
                }>
                Adjust match preferences
              </Label>
            </div>
          )}

          {suggestedProperties.data.map((propertySuggestion, tenantIndex) => {
            const { property } = propertySuggestion;

            return (
              <PropertyCard
                key={tenantIndex}
                {...{
                  animate: {
                    x: `calc(${-760 * activeSlide}px - ${activeSlide * 24}px)`
                  },
                  transition: { duration: 0.4 }
                }}
                name={`${property.created_by?.first_name} ${property.created_by?.last_name}`}
                avatar={getAvatarFormIndex(property.created_by?.avatar)}
                inView={tenantIndex === activeSlide}
                percentage={property.percentage}
                onViewPropertyClick={() => setPropertyToView(suggestedProperty)}
                image={`${property?.property_images?.[0]?.link || ''}`}
                size='large'
                property={property}
              />
            );
          })}
        </motion.div>

        <div
          className='matches-slider-footer'
          style={{ visibility: !suggestedProperties.data.length ? 'hidden' : 'initial' }}>
          <Label variant='secondary' size='large' onClick={previous} disabled={activeSlide === 0}>
            <Icon icon='chevron-left' />
            Previous
          </Label>

          <Label
            variant='secondary'
            size='large'
            onClick={next}
            disabled={activeSlide === suggestedProperties.data.length - 1}>
            Next
            <Icon icon='chevron-right' />
          </Label>
        </div>
      </div>

      {propertyToView && (
        <ViewProperty
          open={true}
          closeModal={() => setPropertyToView(null)}
          onBackdropClick={() => setPropertyToView(null)}
          propertyMatch={propertyToView}
          dislikeProperty={() => dislikeProperty.mutate({ propertyId: propertyToView?.property._id })}
          likeProperty={() => likeProperty.mutate({ propertyId: propertyToView?.property._id })}
        />
      )}
    </>
  );
})`
  &.suggestions-properties {
    position: relative;
    min-height: calc(100vh - 112px);
    display: grid;
    grid-template-rows: min-content auto;
    align-content: space-between;
    row-gap: 32px;
    box-sizing: border-box;
    justify-items: center;
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
      background-image: url(${forestBackgroundImage});
      background-repeat: no-repeat;
      background-size: cover;
      opacity: 0.4;
      z-index: -2;
      top: -112px;
    }

    .section-header {
      display: flex;
      padding: 24px 36px;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      box-sizing: border-box;

      .tabs-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .slides-wrapper {
      display: flex;
      column-gap: 24px;
      width: 800px;
      height: 540px;
      box-sizing: border-box;
      align-items: center;

      .no-matches-card {
        padding: 64px;
        width: 672px;
        height: 452px;
        box-sizing: border-box;
        border-radius: 12px;
        flex-shrink: 0;
        display: grid;
        justify-items: center;
        row-gap: 48px;

        border: 2px solid #eee0d3;
        background: #f7f1e7;
        /* Nav Shadow */
        box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);

        .title-description {
          display: grid;
          justify-items: center;
          row-gap: 24px;

          .title,
          .description {
            text-align: center;
          }

          .description {
            .red-text,
            .black-text {
              font-weight: 700;
            }
            .red-text {
              color: #e5155a;
            }
            .black-text {
              color: #000;
            }
          }

          .title {
            .highlighted {
              color: #e5155a;
            }
          }
        }
        .action-button {
          padding: 20px 32px;
        }
      }
    }

    .matches-slider-footer {
      width: 100%;
      padding: 24px 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      column-gap: 24px;
      user-select: none;

      .label {
        width: 164px;
      }
    }
  }
`;
