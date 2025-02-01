import React, { useState } from 'react';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Icon } from '../../../components';
import { Label } from '../../../components';
import { Modal } from '../../../components';
import { IconButton } from '../../../components';
import { Tab, Tabs } from '../../../components';
import { IRoom } from '../messages.interface';
import { TenantDocuments } from './TenantDocuments';
import { SignedDocuments } from './SignedDocuments';
import { HearthstoneTermsAndCondition } from './HearthstoneTermsAndCondition';
import { useUserStore } from '../../../globalState/user';
import { NewRentingContract } from './NewRentingContract';
import request from '../../../utils/axios';

interface DocumentsTestProps extends React.HTMLAttributes<HTMLDivElement> {
  room: IRoom;
}

export const Documents = styled(({ room, className }: DocumentsTestProps) => {
  const [showModal, setShowModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const [documentState, setDocumentState] = useState<{
    areDocumentsApproved: boolean;
    isContractCreated: boolean;
  }>({ areDocumentsApproved: false, isContractCreated: false });

  const userStore = useUserStore();

  React.useEffect(() => {
    if (room?.property) {
      console.log('fetch document details...');
      getDocumentStatus();
    }
  }, [room]);

  const getDocumentStatus = async () => {
    try {
      const response = await request(userStore.auth.access_token).get(
        `/api/chat/${room._id}/contract-documents-status`
      );

      setDocumentState((prevState) => ({
        ...prevState,
        isContractCreated: response.data.isContractCreated,
        areDocumentsApproved: response.data.areDocumentsApproved
      }));
    } catch (err) {
      throw err;
    }
  };

  const onReload = () => {
    getDocumentStatus();
  };

  const onFinish = () => {
    alert('Contract created with success!');
    onReload();
  };

  const onModalClose = () => {
    setShowModal(false);
    onReload();
  };

  const tenant = room.participant._id === userStore.userDetails.user_id ? room.author : room.participant;

  return (
    <div className={classNames('documents', className)}>
      <div className='documents-action-buttons'>
        <Label variant='secondary' onClick={() => setShowModal(true)}>
          View documents
        </Label>

        {!documentState.isContractCreated && (
          <NewRentingContract
            tenant={tenant._id}
            property={room.property}
            onFinish={onFinish}
            canCreate={documentState.areDocumentsApproved}
          />
        )}

        {documentState.isContractCreated && (
          <Label variant='tertiary' disabled={true}>
            Contract is created
          </Label>
        )}
      </div>
      <ViewDocumentsModal
        open={showModal}
        className='view-documents-modal'
        onBackdropClick={() => onModalClose()}>
        <div className='modal-header'>
          <div />
          <div className='tabs-wrapper'>
            <Tabs value={activeTab} onChange={setActiveTab} rounded variant='tertiary'>
              <Tab label='Tenant documents' />
              <Tab label='Signed documents' />
              <Tab label='Hearthstone T&Cs' />
            </Tabs>
          </div>
          <IconButton size='large' onClick={() => onModalClose()}>
            <Icon icon='close' size={24} />
          </IconButton>
        </div>
        <div className='modal-body'>
          {activeTab === 0 && <TenantDocuments room={room} />}
          {activeTab === 1 && <SignedDocuments room={room} />}
          {activeTab === 2 && <HearthstoneTermsAndCondition />}
        </div>
      </ViewDocumentsModal>
    </div>
  );
})`
  &.documents {
    background: #f7f1e7;
    align-self: flex-start;

    .documents-action-buttons {
      display: flex;
      flex-direction: column;
      row-gap: 16px;

      .button,
      .label {
        width: auto;
      }
    }
  }
`;

const ViewDocumentsModal = styled(Modal)`
  &.view-documents-modal {
    box-shadow: 0px 4px 48px 0px rgba(0, 0, 0, 0.04);
    .modal-container {
      width: 1020px;
      max-width: 100vw;
      height: 730px;
      max-height: 100vh;
      padding: 0;
    }

    .modal-header {
      display: grid;
      grid-template-columns: min-content auto min-content;
      justify-content: space-between;
      padding: 20px 36px;

      align-items: center;

      .tabs-wrapper {
        .tabs {
          .tab {
            padding: 12px 24px;
          }
        }
      }
    }

    .modal-body {
      padding: 16px 32px;
      display: grid;
      row-gap: 24px;
    }
  }
`;
