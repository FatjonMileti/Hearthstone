import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { TenantCard, ShowGlobalLoading, Icon, Label } from '../../../components/index';

import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import { useUserStore } from '../../../globalState/user';
import { SuggestedTenantType } from '../matches.type';
import { ViewProfile } from '../MatchesTenants/ViewProfile';
import { EditPropertyModal } from '../../Properties/NewProperty/EditPropertyModal';

import { useSuggestedTenants } from '../../Suggestions/SugestionsTenants/useSuggestedTenants';
import { useMatchedTenants } from '../MatchesTenants/useMatchedTenants';
import { matchSuggestedTenant } from './matchSuggestedTenant';
import { dismissSuggestedTenant } from './dismissSuggestedTenant';
import { NoMatchesCard } from '../NoMatchesCard';

interface PotentialMatchesProps extends HTMLAttributes<HTMLDivElement> {}
export const PotentialMatches = styled(({ className }: PotentialMatchesProps) => {
  const [activeSlide, setActiveSlide] = React.useState<number>(0);
  const [tenantToView, setTenantToView] = React.useState<SuggestedTenantType | null>(null);
  const [propertyToEdit, setPropertyToEdit] = React.useState<string | undefined>();

  const userStore = useUserStore();

  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });

  const matchedTenants = useMatchedTenants({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });

  const suggestedTenant: SuggestedTenantType = suggestedTenants.data[activeSlide];
  const matchedProperty = suggestedTenant?.property;

  const next = () =>
    setActiveSlide((activeSlide) => Math.abs((activeSlide + 1) % suggestedTenants.data?.length));
  const previous = () => {
    activeSlide >= 1 && setActiveSlide((activeSlide) => activeSlide - 1);
  };

  const likeTenant = useMutation({
    mutationFn: matchSuggestedTenant,
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      if (suggestedTenants.data.length - 1 === activeSlide && suggestedTenants.data.length > 1) {
        previous();
      }
      suggestedTenants.refetch();
      matchedTenants.refetch();
    }
  });

  const dislikeTenant = useMutation({
    mutationFn: dismissSuggestedTenant,
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      if (suggestedTenants.data.length - 1 === activeSlide && suggestedTenants.data.length > 1) {
        previous();
      }
      suggestedTenants.refetch();
    }
  });

  return (
    <>
      {(suggestedTenants.isFetching || dislikeTenant.isLoading || likeTenant.isLoading) && (
        <ShowGlobalLoading />
      )}
      <div className={classNames('potential-matches', className)}>
        <div>
          {!suggestedTenants.isFetching && !suggestedTenants.data.length && (
            <NoMatchesCard className='no-matches' onHandleClick={null} />
          )}
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
              access_token: userStore.auth.access_token,
              propertyId: tenantToView.property._id,
              tenantId: tenantToView.criteria.tenantId
            });
          }}
          dislikeTenant={() => {
            dislikeTenant.mutate({
              propertyId: tenantToView.property._id,
              tenantId: tenantToView.criteria.tenantId,
              access_token: userStore.auth.access_token
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
  &.potential-matches {
    position: relative;
    display: grid;
    grid-template-rows: auto min-content min-content;
    row-gap: 32px;
    box-sizing: border-box;
    justify-items: center;
    overflow-x: clip;

    .no-matches {
      padding: 24px 36px;
      box-sizing: border-box;
    }

    .slides-wrapper {
      display: flex;
      column-gap: 24px;
      width: 440px;
      box-sizing: border-box;
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
