import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { Typography, TenantCard, ShowGlobalLoading, SegmentControl, Icon, Label } from '../../../components';

import { useSuggestedTenants } from './useSuggestedTenants';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import axios from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';
import { useMatchesCount } from '../../Matches/useMatchesCount';
import { SuggestedTenantType } from '../../Matches/matches.type';
import { ViewProfile } from '../../Matches/MatchesTenants/ViewProfile';
import { EditPropertyModal } from '../../Properties/NewProperty/EditPropertyModal';

import forestBackgroundImage from '../../Home/forest.jpeg';

enum ActiveTab {
  Perfect = 'Perfect',
  Potential = 'Potential'
}

interface MatchesTenantsProps extends HTMLAttributes<HTMLDivElement> {}
export const SuggestionsTenants = styled(({ className }: MatchesTenantsProps) => {
  const [activeTab, setActiveTab] = React.useState(ActiveTab.Potential);
  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });

  const [activeSlide, setActiveSlide] = React.useState<number>(0);
  const [tenantToView, setTenantToView] = React.useState<SuggestedTenantType | null>(null);
  const [propertyToEdit, setPropertyToEdit] = React.useState<string | undefined>();

  const userStore = useUserStore();

  const suggestedTenant: SuggestedTenantType = suggestedTenants.data[activeSlide];
  const matchedProperty = suggestedTenant?.property;

  const matchesCount = useMatchesCount({
    params: { chosen: true, disliked: false }
  });

  const next = () =>
    setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % suggestedTenants.data?.length));
  const previous = () => {
    activeSlide >= 1 && setActiveSlide((activeSlide) => activeSlide - 1);
  };

  const likeTenant = useMutation({
    mutationFn: ({ tenantId, propertyId }: { tenantId: string; propertyId: string }) => {
      return axios(userStore.auth.access_token).post('/api/match/tenants', {
        tenant: tenantId,
        property: propertyId
      });
    },
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      if (suggestedTenants.data.length - 1 === activeSlide && suggestedTenants.data.length > 1) {
        previous();
      }
      suggestedTenants.refetch();
      matchesCount.refetch();
    }
  });

  const dislikeTenant = useMutation({
    mutationFn: ({ tenantId, propertyId }: { tenantId: string; propertyId: string }) => {
      return axios(userStore.auth.access_token).post('/api/match/dislikes/tenants', {
        tenant: tenantId,
        property: propertyId
      });
    },
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      if (suggestedTenants.data.length - 1 === activeSlide && suggestedTenants.data.length > 1) {
        previous();
      }
      suggestedTenants.refetch();
      matchesCount.refetch();
    }
  });

  return (
    <>
      {(suggestedTenants.isFetching || dislikeTenant.isLoading || likeTenant.isLoading) && (
        <ShowGlobalLoading />
      )}
      <div className={classNames('suggestions-tenants', className)}>
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

          <Label variant='special' size='large' className='filters-button'>
            <Icon icon='filter' />
            Match options (12)
          </Label>
        </div>

        <motion.div className='slides-wrapper'>
          {suggestedTenants.data.map((tenant, tenantIndex) => {
            const { criteria: tenantCriteria } = tenant;

            return (
              <TenantCard
                key={tenantIndex}
                animate={{
                  x: `calc(${-100 * activeSlide}% - ${activeSlide * 24}px)`
                }}
                transition={{ duration: 0.4 }}
                name={`${tenantCriteria.firstName} ${tenantCriteria.lastName}`}
                avatar={getAvatarFormIndex(tenantCriteria.avatar)}
                inView={tenantIndex === activeSlide}
                percentage={matchedProperty.percentage}
                onViewProfileClick={() => setTenantToView(suggestedTenant)}
                size='large'
              />
            );
          })}
        </motion.div>

        {suggestedTenants.data.length > 0 && (
          <div className='matches-slider-footer'>
            <Label variant='secondary' size='large' onClick={previous} disabled={activeSlide === 0}>
              <Icon icon='chevron-left' />
              Previous
            </Label>

            <Label
              variant='secondary'
              size='large'
              onClick={next}
              disabled={activeSlide === suggestedTenants.data.length - 1}>
              Next
              <Icon icon='chevron-right' />
            </Label>
          </div>
        )}
      </div>

      {tenantToView && (
        <ViewProfile
          tenantMatch={tenantToView}
          closeViewProfile={() => setTenantToView(null)}
          likeTenant={() => {
            likeTenant.mutate({
              propertyId: tenantToView.property._id,
              tenantId: tenantToView.criteria.tenantId
            });
          }}
          dislikeTenant={() => {
            dislikeTenant.mutate({
              propertyId: tenantToView.property._id,
              tenantId: tenantToView.criteria.tenantId
            });
          }}
        />
      )}

      {propertyToEdit && (
        <EditPropertyModal
          propertyId={propertyToEdit}
          showStore={[!!propertyToEdit, () => setPropertyToEdit(undefined)]}
          afterSaveAsDraft={() => suggestedTenants.refetch()}
          onBack={() => setPropertyToEdit(undefined)}
          afterDelete={() => suggestedTenants.refetch()}
          afterStartMatching={async () => {
            await suggestedTenants.refetch();
          }}
        />
      )}
    </>
  );
})`
  &.suggestions-tenants {
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
      width: 440px;
      box-sizing: border-box;

      .no-matches {
        display: grid;
        align-items: center;
        justify-items: center;
        width: 100%;
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
