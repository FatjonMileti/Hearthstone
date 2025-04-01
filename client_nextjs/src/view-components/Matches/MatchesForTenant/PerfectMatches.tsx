import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '../../../compat/router';

import { Icon, Label, PropertyCard, ShowGlobalLoading } from '../../../components/index';
import { ViewProperty } from '../MatchesProperties/ViewProperty';

import axios from '../../../utils/axios';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';

import { useUserStore } from '../../../globalState/user';

import { MatchedPropertyType } from '../matches.type';
import { useMatchedProperties } from '../MatchesProperties/useMatchedProperties';
import { cancelMatchedProperty } from './cancelMatchedProperty';
import { useSuggestedProperties } from '../../Suggestions/SuggestionsProperties/useSuggestedProperties';

interface PerfectMatchesProps extends HTMLAttributes<HTMLDivElement> {}
export const PerfectMatches = styled(({ className }: PerfectMatchesProps) => {
  const matchedProperties = useMatchedProperties({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });

  const suggestedProperties = useSuggestedProperties({
    params: { chosen: false },
    options: {
      refetchOnMount: true
    }
  });

  const userStore = useUserStore();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = React.useState<number>(0);
  const [propertyToView, setPropertyToView] = React.useState<MatchedPropertyType | null>(null);

  const next = () =>
    setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % matchedProperties.data?.length));
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
      if (matchedProperties.data.length - 1 === activeSlide && matchedProperties.data.length > 1) {
        previous();
      }
      matchedProperties.refetch();
    }
  });

  const dislikeProperty = useMutation({
    mutationFn: cancelMatchedProperty,
    onSuccess: () => {
      if (propertyToView) {
        setPropertyToView(null);
      }
      if (matchedProperties.data.length - 1 === activeSlide && matchedProperties.data.length > 1) {
        previous();
      }
      matchedProperties.refetch();
      suggestedProperties.refetch();
    }
  });

  const chatWith = async (matchId: string) => {
    navigate(`/messages?matchId=${matchId}`);
  };

  return (
    <>
      {(matchedProperties.isFetching || likeProperty.isLoading || dislikeProperty.isLoading) && (
        <ShowGlobalLoading />
      )}
      <div className={classNames('perfect-matches', className)}>
        <motion.div className='slides-wrapper'>
          {matchedProperties.data.map((matchedProperty, tenantIndex) => {
            const motionProps = {
              animate: {
                x: `calc(${-760 * activeSlide}px - ${activeSlide * 24}px)`
              },
              transition: { duration: 0.4 }
            };
            return (
              <PropertyCard
                key={tenantIndex}
                name={`${matchedProperty.property.created_by?.first_name} ${matchedProperty.property.created_by?.last_name}`}
                avatar={getAvatarFormIndex(matchedProperty.property.created_by?.avatar)}
                inView={tenantIndex === activeSlide}
                matched={matchedProperty.matched}
                percentage={matchedProperty.property.percentage}
                onViewPropertyClick={() => setPropertyToView(matchedProperty)}
                image={`${matchedProperty.property?.property_images?.[0]?.link || ''}`}
                size='large'
                property={matchedProperty.property}
                awaitingMatch={matchedProperty.chosen && !matchedProperty.matched}
                {...motionProps}
                chatWith={() => chatWith(matchedProperty._id)}
              />
            );
          })}
        </motion.div>

        <div
          className='matches-slider-footer'
          style={{ visibility: !matchedProperties.data.length ? 'hidden' : 'initial' }}>
          <Label variant='secondary' size='large' onClick={previous} disabled={activeSlide === 0}>
            <Icon icon='chevron-left' />
            Previous
          </Label>

          <Label
            variant='secondary'
            size='large'
            onClick={next}
            disabled={activeSlide === matchedProperties.data.length - 1}>
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
              matchId: propertyToView.matchId,
              access_token: userStore.auth.access_token
            })
          }
          likeProperty={() => likeProperty.mutate({ propertyId: propertyToView?.property._id })}
        />
      )}
    </>
  );
})`
    &.perfect-matches {
        position: relative;
        display: grid;
        grid-template-rows: auto min-content;
        row-gap: 32px;
        box-sizing: border-box;
        justify-items: center;
        overflow-x: clip;

        align-content: center;
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
