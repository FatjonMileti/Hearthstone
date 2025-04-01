type IGridState = any;
import { Typography } from '../../../components/index';
import React, { HTMLAttributes } from 'react';
import { useUserStore } from '../../../globalState/user';
import axios from '../../../utils/axios';
import config from '../../../config';
import { Button } from '../../../components/index';

import { IRoom } from '../messages.interface';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Icon } from '../../../components/index';
import { Role } from '../../../enums';

const state: IGridState = {
  loading: true,
  rows: [],
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

interface SignedDocumentsProps extends HTMLAttributes<HTMLDivElement> {
  room: IRoom;
}

export const SignedDocuments = styled((props: SignedDocumentsProps) => {
  const { room } = props;
  const { auth, userDetails } = useUserStore();
  const [list, setList] = React.useState<IGridState>({
    ...state
  });

  React.useEffect(() => {
    getEnvelopes();
  }, []);

  const otherUser = room.participant._id === userDetails.user_id ? room.author : room.participant;

  const getEnvelopes = async () => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope`, {
      params: {
        document_type: 'Rent Contract',
        property: room.property._id,
        participant: otherUser._id,
        getDataFor: userDetails.role
      }
    });
    setList((prevList: any) => ({
      ...prevList,
      rows: data.docs,
      totalRows: data.totalDocs,
      loading: false
    }));
  };

  const isLandlord = userDetails.role === Role.Landlord;

  const handleSign = async (item: any) => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope/${item._id}`);
    window.location.href = isLandlord ? data.sign_url_landlord : data.sign_url_tenant;
  };

  const downloadContract = (item: any) => {
    return window.open(
      `${config.apiUrl}/api/docusign/envelope/${item.envelope_id}/download?fileName=${item.document_type}.pdf`,
      '_blank'
    );
  };

  return (
    <div className={classNames(props.className, 'signed-documents')}>
      <Typography variant='body3' className='signed-documents-title'>
        Sign documents
      </Typography>
      <div className='tenant-documents-list'>
        {list.rows.length > 0 &&
          list.rows.map((item: any, index) => {
            return isLandlord ? (
              <SignedDocumentLandlord
                item={item}
                handleSign={handleSign}
                key={index}
                downloadContract={downloadContract}
              />
            ) : (
              <SignedDocumentTenant
                item={item}
                handleSign={handleSign}
                key={index}
                downloadContract={downloadContract}
              />
            );
          })}

        {list.rows.length === 0 && (
          <div className='document-item'>
            <Typography>No signed documents</Typography>
          </div>
        )}
      </div>

      <Typography variant='body4'>
        You can find more information about why we need these documents in the Hearthstone T&Cs section.
      </Typography>
    </div>
  );
})`
  &.signed-documents {
    display: grid;
    row-gap: 24px;
    .signed-documents-title {
      font-family: At Gambit, serif;
    }

    .tenant-documents-list {
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

          .button {
            marginright: '5px';
          }
        }
      }
    }
  }
`;

interface ISignedDocumentLandlord {
  item: any;
  handleSign: (item: any) => void;
  downloadContract: (item: any) => void;
}
const SignedDocumentLandlord = (props: ISignedDocumentLandlord) => {
  const { item, handleSign, downloadContract } = props;

  const can_download = item.signed_by_landlord && item.signed_by_tenant;

  return (
    <div className='document-item'>
      <div className='document-status'>
        <div className={classNames('completion-bullet', { active: item.signed_by_landlord })}>
          <Icon icon='checked' size={12} />
        </div>
        <Typography variant='body4' className='document-name'>
          {item.document_type}
        </Typography>
      </div>

      <div className='document-action-buttons'>
        <Button onClick={() => downloadContract(item)} disabled={!can_download}>
          Download
        </Button>
        {!item.signed_by_landlord && <Button onClick={() => handleSign(item)}>Sign</Button>}
      </div>
    </div>
  );
};

interface ISignedDocumentTenant {
  item: any;
  handleSign: (item: any) => void;
  downloadContract: (item: any) => void;
}
const SignedDocumentTenant = (props: ISignedDocumentTenant) => {
  const { item, handleSign, downloadContract } = props;

  const can_download = item.signed_by_landlord && item.signed_by_tenant;

  return (
    <div className='document-item'>
      <div className='document-status'>
        <div className={classNames('completion-bullet', { active: item.signed_by_tenant })}>
          <Icon icon='checked' size={12} />
        </div>
        <Typography variant='body4' className='document-name'>
          {item.document_type}
        </Typography>
      </div>

      <div className='document-action-buttons'>
        <Button onClick={() => downloadContract(item)} disabled={!can_download}>
          Download
        </Button>
        {!item.signed_by_tenant && <Button onClick={() => handleSign(item)}>Sign</Button>}
      </div>
    </div>
  );
};
