import React from 'react';
import { MatchesWithoutAccountSection } from './MatchesWithoutAccountSection';
import { StartMatchingWithoutAccountModal } from './StartMatchingWithoutAccountModal';

interface StartMatchingWithoutAccountProps {
  closeStartMatching: () => any;
  onSigInClick: () => any;
  onCreateAccountClick: () => any;
}
export const StartMatchingWithoutAccount = ({
  closeStartMatching,
  onCreateAccountClick,
  onSigInClick
}: StartMatchingWithoutAccountProps) => {
  const [startedMatching, setStartedMatching] = React.useState(false);
  const [showStartMatchingModal, setShowStartMatchingModal] = React.useState(true);

  const afterSetCriteria = () => {
    setShowStartMatchingModal(false);
    setStartedMatching(true);
  };

  return (
    <>
      {startedMatching && <MatchesWithoutAccountSection onCreateAccountClick={onCreateAccountClick} />}

      <StartMatchingWithoutAccountModal
        visibilityStore={[showStartMatchingModal, setShowStartMatchingModal]}
        closeStartMatching={closeStartMatching}
        onSigInClick={onSigInClick}
        onCreateAccountClick={onCreateAccountClick}
        afterSetCriteria={afterSetCriteria}
      />
    </>
  );
};
