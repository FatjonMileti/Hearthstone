import React from 'react';
import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../components';
import { Button } from '../../../components';
import axios from '../../../utils/axios';
import { DOCUMENT_TYPES, DocumentType, IUser_Documents } from './user.interface';
import { useUserStore } from '../../../globalState/user';
import { useProfileStore } from '../../../globalState/profile';
import { ShowGlobalLoading } from '../../../components';
import { DocumentsView } from './components/DocumentsView';
import { useAgreement } from './useAgreement';
import ShakeHands from './images/shake hands image.png';

export const TransactionAgreement = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [documents, setDocuments] = React.useState<IUser_Documents[]>([]);

  const [loading, setLoading] = React.useState(false);

  const { userDetails, auth } = useUserStore();
  const profileStore = useProfileStore();

  const { buttonLabel, handleTransactionAgreement } = useAgreement();

  React.useEffect(() => {
    getDocuments();
  }, [profileStore]);

  const getDocuments = () => {
    const { documents } = profileStore;
    if (documents?.length > 0) {
      setDocuments(
        DOCUMENT_TYPES.map((doc) => {
          const exitingDocument = documents.find((item) => item.type === doc.type && item.key && item.link);
          return exitingDocument || doc;
        })
      );
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    try {
      setLoading(true);

      const selectedFile = event.target.files && event.target.files[0];

      if (selectedFile) {
        // Handle the selected file
        const formData = new FormData();

        formData.append('files', selectedFile);
        const response = await axios(auth.access_token).post('/api/document/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status === 200) {
          const documentsToMap = documents.length > 0 ? documents : DOCUMENT_TYPES;
          const documentsToSend: IUser_Documents[] = documentsToMap.map((doc) => {
            if (doc.type === type) {
              doc.key = response.data[0].key;
              doc.mimetype = response.data[0].mimetype;
              doc.originalName = response.data[0].originalName;
              doc.link = response.data[0].link;
              return doc;
            } else {
              return doc;
            }
          });

          await updateUserDocs(documentsToSend);
          await profileStore.fetchProfile(auth.access_token);
        }
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserDocs = async (data: any[]) => {
    try {
      await axios(auth.access_token).patch('/api/user/' + userDetails.user_id, {
        documents: data
      });
    } catch (err) {
      throw err;
    }
  };

  return (

    <div className={`transaction-agreement-section ${className}`}>
      {loading && <ShowGlobalLoading />}
      <Typography variant='body2' className='transaction-agreement'>
        Transaction Agreement
      </Typography>
      <div className='section-wrapper'>
      <div className='body-content'>
        <DocumentsView documents={documents} handleFileChange={handleFileChange} />

        <div className='section'>
          <Typography variant='body4' className='title'>
            Hearthstone transaction agreement
          </Typography>
          <Typography variant='body4'>
            The transaction agreement acts as a guarantee between you, your match and Hearthstone that everything
            will be handled according with the UK in force laws.
          </Typography>

          <Button size='small' variant='secondary' onClick={() => handleTransactionAgreement()}>
            {buttonLabel()}
          </Button>
          <div className='note'>
            <Typography variant='body5'>
              <b>Note:</b> The agreement can be generated after you have your ID verified. You can skip this
              step but remember you won’t be able to message your match and close the deal until you generate
              and sign the transaction agreement.
            </Typography>
          </div>
        </div>
      </div>
      <div className='right-part'>
        <img src={ShakeHands} alt='' className='shake-hands' />
      </div>
      </div>
    </div>
  );
})`
  &.transaction-agreement-section {
      display: grid;
      gap: 40px;

      .transaction-agreement {
          color: #0d2a38;
          font-weight: 600;
          line-height: 48px;
      }
      
      .section-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 24px;

          .body-content {
              display: grid;
              row-gap: 32px;

              .section {
                  display: grid;
                  row-gap: 16px;

                  .title {
                      color: #a7a7a7;
                  }

                  .note {
                      padding: 12px;
                      color: #646464;
                      background-color: #f3f4f5;
                      border-radius: 8px;
                  }
              }
          }

          .right-part {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 8px;

              .shake-hands {
                  background-size: cover;
                  background-repeat: no-repeat;
                  background-position: center;
                  width: 340px;
                  height: 300px;
              }
          }
      }
  }
`;
