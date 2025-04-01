import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';

import { Icon, Label, PropertyCard, ShowGlobalLoading } from '../../../components/index';

import { ViewProperty } from '../MatchesProperties/ViewProperty';

import { useUserStore } from '../../../globalState/user';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import { useCriteriaStore } from '../../../globalState/criteria';
import { useGlobalSetCriteria } from '../../SetCriteria/GlobalSetCriteria';

import { SuggestedPropertyType } from '../matches.type';
import { useSuggestedProperties } from '../../Suggestions/SuggestionsProperties/useSuggestedProperties';
import { useMatchedProperties } from '../MatchesProperties/useMatchedProperties';
import { matchSuggestedProperty } from './matchSuggestedProperty';
import { dismissSuggestedProperty } from './dismissSuggestedProperty';
import { NoMatchesCard } from '../NoMatchesCard';

interface PotentialMatchesProps extends HTMLAttributes<HTMLDivElement> {}
export const PotentialMatches = styled(({ className }: PotentialMatchesProps) => {
  const suggestedProperties = useSuggestedProperties({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });

  const matchedProperties = useMatchedProperties({ params: { chosen: true } });

  const criteriaStore = useCriteriaStore();
  const [activeSlide, setActiveSlide] = React.useState<number>(0);

  const [propertyToView, setPropertyToView] = React.useState<SuggestedPropertyType | null>(null);

  const userStore = useUserStore();

  const suggestedProperty: SuggestedPropertyType = suggestedProperties?.data[activeSlide];

  const globalSetCriteria = useGlobalSetCriteria();

  const next = () =>
    setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % suggestedProperties.data?.length));
  const previous = () => {
    activeSlide >= 1 && setActiveSlide((activeSlide) => activeSlide - 1);
  };

  const likeProperty = useMutation({
    mutationFn: matchSuggestedProperty,
    onSuccess: () => {
      if (propertyToView) {
        setPropertyToView(null);
      }
      if (suggestedProperties.data.length - 1 === activeSlide && suggestedProperties.data.length > 1) {
        previous();
      }
      suggestedProperties.refetch();
      matchedProperties.refetch();
    }
  });

  const dislikeProperty = useMutation({
    mutationFn: dismissSuggestedProperty,
    onSuccess: () => {
      if (propertyToView) {
        setPropertyToView(null);
      }
      if (suggestedProperties.data.length - 1 === activeSlide && suggestedProperties.data.length > 1) {
        previous();
      }
      suggestedProperties.refetch();
    }
  });

  const onAdjustMatchPreferencesClick = () => {
    globalSetCriteria.openSetCriteria({
      afterSetCriteria: () => {
        suggestedProperties.refetch();
        criteriaStore.fetchCriteria(userStore.auth.access_token);
      }
    });
  };

  return (
    <>
      {(suggestedProperties.isFetching || likeProperty.isLoading || dislikeProperty.isLoading) && (
        <ShowGlobalLoading />
      )}
      <div className={classNames('potential-matches', className)}>
        <motion.div className='slides-wrapper'>
          {!suggestedProperties.isFetching && !suggestedProperties.data.length && (
            <NoMatchesCard onHandleClick={onAdjustMatchPreferencesClick} />
          )}

          {suggestedProperties.data?.map((propertySuggestion, tenantIndex) => {
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
            disabled={activeSlide === suggestedProperties.data?.length - 1}>
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
          dislikeProperty={() =>
            dislikeProperty.mutate({
              propertyId: propertyToView?.property._id,
              access_token: userStore.auth.access_token
            })
          }
          likeProperty={() =>
            likeProperty.mutate({
              propertyId: propertyToView?.property._id,
              access_token: userStore.auth.access_token
            })
          }
        />
      )}
    </>
  );
})`
  &.potential-matches {
    position: relative;
    display: grid;
    grid-template-rows: auto min-content;
    row-gap: 32px;
    box-sizing: border-box;
    justify-items: center;
    overflow-x: clip;

    align-content: center;

    .slides-wrapper {
      display: flex;
      column-gap: 24px;
      width: 800px;
      height: 540px;
      box-sizing: border-box;
      align-items: center;
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
