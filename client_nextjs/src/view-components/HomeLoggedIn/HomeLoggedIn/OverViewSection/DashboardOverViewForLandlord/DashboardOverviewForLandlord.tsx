import { DefaultState } from '../DefaultState';

import React, { useState } from 'react';

import { useProfileStore } from '../../../../../globalState/profile';

import { States } from '../DashboardOverview';
import { Agreement } from '../Agreement';
import { MatchesAwaiting } from './MatchesAwaiting';
import { PerfectMatch } from './PerfectMatch';
import { useMatchedTenants } from '../../../../Matches/MatchesTenants/useMatchedTenants';
import { MultiplePerfectMatches } from './MultiplePerfectMatches';
import { useSuggestedTenants } from '../../../../Suggestions/SugestionsTenants/useSuggestedTenants';
import { AnimatePresence } from 'framer-motion';
import { FinalDocs } from './FinalDocs';
import { motionPropsAnimatePresence } from '../OverViewSection';

interface DashboardOverviewForLandlordProps {}
export const DashboardOverviewForLandlord = ({}: DashboardOverviewForLandlordProps) => {
  const [state, setState] = useState<States>(States.Default);

  const profileStore = useProfileStore();

  const matchedTenants = useMatchedTenants({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });

  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });

  React.useEffect(() => {
    if (matchedTenants.isFetched && suggestedTenants.isFetched) {
      if (!profileStore.signed_transaction_agreement) {
        setState(States.Agreement);
        return;
      }

      if (matchedTenants.data?.length > 0) {
        if (matchedTenants.data?.length === 1) {
          setState(States.PerfectMatch);
        } else {
          setState(States.MultiplePerfectMatches);
        }
        return;
      }

      if (suggestedTenants.data.length > 0) {
        setState(States.MatchesAwaiting);
        return;
      }

      setState(States.Default);
    }
  }, [matchedTenants.data, suggestedTenants.data, profileStore.signed_transaction_agreement]);

  return (
    <>
      <AnimatePresence>
        {state === States.Default && <DefaultState motionProps={motionPropsAnimatePresence} />}
        {state === States.MatchesAwaiting && <MatchesAwaiting motionProps={motionPropsAnimatePresence} />}
        {state === States.PerfectMatch && matchedTenants.data[0] && (
          <PerfectMatch match={matchedTenants.data[0]} motionProps={motionPropsAnimatePresence} />
        )}
        {state === States.MultiplePerfectMatches && (
          <MultiplePerfectMatches
            count={matchedTenants.data.length}
            match={matchedTenants.data[0]}
            motionProps={motionPropsAnimatePresence}
          />
        )}
        {state === States.Agreement && <Agreement />}
        {state === States.FinalDocs && (
          <FinalDocs match={matchedTenants.data[0]} motionProps={motionPropsAnimatePresence} />
        )}
      </AnimatePresence>
    </>
  );
};
