type IGridState = any;
import { Typography } from '../../../components/index';
import React, { Fragment, HTMLAttributes } from 'react';
import { useUserStore } from '../../../globalState/user';
import axios from '../../../utils/axios';
import config from '../../../config';
import { Button } from '../../../components/index';
import { useProfileStore } from '../../../globalState/profile';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Icon } from '../../../components/index';
import { Checkbox } from '../../../components/index';
import { Label } from '../../../components/index';
import { useNavigate } from '../../../compat/router';
import { Role } from '../../../enums';

enum DocumentType {
  PRIVACY_AGREEMENT = 'Hearthstone privacy agreement',
  TRANSACTION_AGREEMENT = 'Hearthstone transaction agreement',
  RENT_CONTRACT = 'Rent Contract'
}

const state: IGridState = {
  loading: true,
  rows: [{ document_type: 'Hearthstone privacy agreement', signed_by_landlord: false, signed_by_tenant: false }],
  totalRows: 0,
  rowsPerPageOptions: [10, 20, 50],
  pageSize: 9,
  page: 1,
  rowCount: 0,
  sort: 'created_at',
  asc: false,
  selectedIds: [],
  search: ''
};

export const HearthstoneTermsAndCondition = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const { auth, userDetails } = useUserStore();
  const profileStore = useProfileStore();
  const [list, setList] = React.useState<IGridState>({
    ...state
  });

  React.useEffect(() => {
    getEnvelopes();
  }, []);

  const getEnvelopes = async () => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope`, {
      params: {
        document_type: 'Hearthstone transaction agreement',
        getDataFor: userDetails.role
      }
    });
    setList((prevList: any) => ({
      ...prevList,
      rows: [prevList.rows[0], ...data.docs],
      totalRows: data.totalDocs,
      loading: false
    }));
  };

  const isLandlord = userDetails.role === Role.Landlord;

  const handleSign = async (item: any) => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope/${item._id}`);
    window.location.href = isLandlord ? data.sign_url_landlord : data.sign_url_tenant;
  };

  const handlePolicyAccept = async () => {
    try {
      const { status } = await axios(auth.access_token).patch(
        `${config.apiUrl}/api/user/${userDetails.user_id}`,
        {
          agreed_application_policy: true
        }
      );
      if (status === 200) {
        await profileStore.fetchProfile(auth.access_token);
      }
    } catch (error: any) {}
  };

  const downloadContract = (item: any) => {
    return window.open(
      `${config.apiUrl}/api/docusign/envelope/${item.envelope_id}/download?fileName=${item.document_type}.pdf`,
      '_blank'
    );
  };

  return (
    <div className={classNames(className, 'terms-and-conditions')}>
      <Typography variant='body3' className='terms-and-conditions-title'>
        Hearthstone T&Cs
      </Typography>
      <div className='documents-list'>
        {list.rows.length > 0 &&
          list.rows.map((item: any, index) => {
            return (
              <Fragment key={index}>
                {item.document_type === DocumentType.PRIVACY_AGREEMENT ? (
                  <SignedDocumentAgreementPolicy item={item} handleSign={handlePolicyAccept} />
                ) : (
                  <SignedDocumentAgreement
                    item={item}
                    handleSign={handleSign}
                    downloadContract={downloadContract}
                  />
                )}
              </Fragment>
            );
          })}
        {list.rows.length === 0 && (
          <div className='document-item'>
            <Typography>Empty</Typography>
          </div>
        )}
      </div>
    </div>
  );
})`
  &.terms-and-conditions {
    display: grid;
    row-gap: 24px;

    .terms-and-conditions-title {
      font-family: At Gambit, serif;
    }

    .documents-list {
      display: grid;
      row-gap: 16px;
      .document-item {
        display: flex;
        padding: 24px;
        align-items: center;
        gap: 16px;
        align-self: stretch;
        justify-content: space-between;

        border-radius: 8px;
        border: 1px solid var(--primary-brand-ocean-blue, #184d6d);

        .document-status {
          display: flex;
          column-gap: 8px;
          .completion-bullet {
            width: 24px;
            height: 24px;
            display: grid;
            align-items: center;
            justify-content: center;
            background-color: #cfd5d5;

            border-radius: 50%;
            .icon {
              visibility: hidden;
              color: white;
            }

            &.active {
              background-color: #184d6d;
              .icon {
                visibility: visible;
              }
            }
          }

          .document-name {
            font-weight: 700;
            color: #0d2a38;
          }
        }

        .document-action-buttons {
          display: flex;
          column-gap: 16px;
          align-items: center;
        }
      }
    }
  }
`;

interface IAgreementDocument {
  item: any;
  handleSign: (item: any) => void;
  downloadContract: (item: any) => void;
}

const SignedDocumentAgreement = (props: IAgreementDocument) => {
  const { item, handleSign, downloadContract } = props;
  const { userDetails } = useUserStore();

  const isLandlord = userDetails.role === Role.Landlord;

  return (
    <div className='document-item'>
      <div className='document-status'>
        <div
          className={classNames('completion-bullet', {
            active: isLandlord ? item.signed_by_landlord : item.signed_by_tenant
          })}>
          <Icon icon='checked' size={12} />
        </div>
        <Typography variant='body4' className='document-name'>
          {item.document_type}
        </Typography>
      </div>

      <div className='document-action-buttons'>
        {item.signed_by_tenant && <Button onClick={() => downloadContract(item)}>Download</Button>}
        {item.signed_by_landlord && <Button onClick={() => downloadContract(item)}>Download</Button>}

        {isLandlord && !item.signed_by_landlord && <Button onClick={() => handleSign(item)}>Sign</Button>}
        {!isLandlord && !item.signed_by_tenant && <Button onClick={() => handleSign(item)}>Sign</Button>}
      </div>
    </div>
  );
};

interface IAgreementPolicyDocument {
  item: any;
  handleSign: () => void;
}
const SignedDocumentAgreementPolicy = (props: IAgreementPolicyDocument) => {
  const { item, handleSign } = props;

  const user = useProfileStore();
  const navigate = useNavigate();

  return (
    <div className='document-item'>
      <div className='document-status'>
        <div className={classNames('completion-bullet', { active: user.agreed_application_policy })}>
          <Icon icon='checked' size={12} />
        </div>
        <Typography variant='body4' className='document-name'>
          {item.document_type}
        </Typography>
      </div>

      <div className='document-action-buttons'>
        <Label variant='tertiary' onClick={() => navigate('/policy-agreement')}>
          Read policy agreement
        </Label>
        <Checkbox
          defaultChecked={user.agreed_application_policy}
          onClick={handleSign}
          disabled={user.agreed_application_policy}
        />
      </div>
    </div>
  );
};
