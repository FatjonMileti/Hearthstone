import { useProfileStore } from '../../globalState/profile.tsx';
import React from 'react';
import { useUserStore } from '../../globalState/user.tsx';
import axiosWithToken from '../../utils/axios.ts';
import axios from '../../utils/axios.ts';
import config from '../../config.ts';
import { Role } from '../../enums.ts';

export const useAgreement = () => {
  const { signed_transaction_agreement, has_transaction_agreement, transaction_agreement_link } =
    useProfileStore();

  const [loading, setLoading] = React.useState<boolean>(false);

  const profileUser = useProfileStore();
  const user = useUserStore();

  const getTransactionAgreementStatus = () => {
    if (!has_transaction_agreement) {
      return 'Create transaction agreement';
    }
    return !signed_transaction_agreement
      ? 'Sign the transaction agreement'
      : 'Transaction agreement is created';
  };

  const buttonLabel = () => {
    if (!has_transaction_agreement) {
      return 'Generate agreement';
    }
    return !signed_transaction_agreement ? 'Sign agreement' : 'Download';
  };

  const isLandlord = user.userDetails.role === Role.Landlord;

  const handleTransactionAgreement = async () => {
    if (!has_transaction_agreement) {
      setLoading(true);
      await axiosWithToken(user.auth.access_token).post('/api/docusign/create-transaction-envelope', {});
      await profileUser.fetchProfile(user.auth.access_token);
      return setLoading(false);
    }

    if (!signed_transaction_agreement) {
      setLoading(true);
      const { data, status } = await axios(user.auth.access_token).get(
        `${config.apiUrl}/api/docusign?document_type=Hearthstone transaction agreement`
      );

      if (status === 200) {
        window.location.href = isLandlord ? data.sign_url_landlord : data.sign_url_tenant;
      }
      setLoading(false);
      return;
    } else {
      window.open(transaction_agreement_link + '?fileName=HearthstoneTransactionAgreement.pdf', '_blank');
    }
  };

  return {
    handleTransactionAgreement,
    buttonLabel,
    getTransactionAgreementStatus,
    loading
  };
};
