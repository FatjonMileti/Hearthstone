import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';

import { usePropertyForm } from './usePropertyForm.tsx';
import { ApiPropertyDocumentType } from './property.types.ts';
import axios from '../../../utils/axios.ts';
import { useUserStore } from '../../../globalState/user.tsx';
import { Modal } from '../../../components/Modal.tsx';
import { Typography } from '../../../components/Typography.tsx';
import { PropertyForm } from './PropertyForm.tsx';
import { RoundAction } from '../../../components/RoundAction.tsx';

export interface AddPropertyModalProps extends HTMLAttributes<HTMLDivElement> {
  showStore: [boolean, (show: boolean) => void];
  afterSave?: () => void;
  onBack: () => void;
}

export const AddPropertyModal = styled(
  ({ className, showStore, afterSave = () => {}, onBack }: AddPropertyModalProps) => {
    const [modalVisibility, setModalVisibility] = showStore;

    const { auth } = useUserStore();

    const form = usePropertyForm();

    const saveAsDraft = async (payload: Partial<ApiPropertyDocumentType>) => {
      try {
        return await axios(auth.access_token).post('/api/asset/draft', payload);
      } catch (err) {
        throw err;
      }
    };

    const startMatching = async (payload: Partial<ApiPropertyDocumentType>) => {
      try {
        return await axios(auth.access_token).post('/api/asset', payload);
      } catch (err) {
        throw err;
      }
    };

    return (
      <Modal
        className={`add-property-modal ${className}`}
        open={modalVisibility}
        onBackdropClick={() => setModalVisibility(false)}
        onClose={() => setModalVisibility(false)}>
        <div className='header'>
          <Typography variant='body2'>Add property</Typography>
          <div className='right-side'>
            <RoundAction icon='close' onClick={() => setModalVisibility(false)} />
          </div>
        </div>
        <PropertyForm
          startMatching={startMatching}
          saveAsDraft={saveAsDraft}
          form={form}
          onBack={onBack}
          afterStartMatching={afterSave}
          afterSaveAsDraft={afterSave}
        />
      </Modal>
    );
  }
)`
  &.add-property-modal {
    overflow-y: auto;
    max-height: 100vh;
    height: auto;
    width: 100vw;

    border-radius: 0px;

    .modal-container {
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 36px;
      border-bottom: 2px solid #f3f4f5;
      box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);

      .right-side {
        display: flex;
        column-gap: 16px;
        align-items: center;

        .delete-button {
          color: #e5155a;
          border-color: #e5155a;
        }
      }
    }
  }
`;
