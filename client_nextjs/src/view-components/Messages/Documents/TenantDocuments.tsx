import React, { HTMLAttributes } from 'react';
import { useUserStore } from '../../../globalState/user';
import { useDocuments } from './useDocuments.hook';
import { Typography } from '../../../components';
import { UploadComponent } from './UploadComponent';
import { Button } from '../../../components';
import { IRoom } from '../messages.interface';
import { DocumentType, IUser_Documents } from '../../MyAccount/user.interface';
import { styled } from '@mui/system';
import classNames from 'classnames';
import { Icon } from '../../../components';
import { Label } from '../../../components';

interface TenantDocumentsProps extends HTMLAttributes<HTMLDivElement> {
  room: IRoom;
}
export const TenantDocuments = styled((props: TenantDocumentsProps) => {
  const { room } = props;
  const { userDetails } = useUserStore();
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const participant = userDetails.user_id === room.participant._id ? room.author._id : room.participant._id;

  const { documents, userDocuments, approveOrDisapproveDocument, useMyDocument, handleDocument } =
    useDocuments({
      participant
    });

  return (
    <div className={classNames(props.className, 'tenant-documents')}>
      <Typography className='tenant-documents-title' variant='body3'>
        Tenant documents
      </Typography>

      <div className='tenant-documents-list'>
        {documents.map((document, index) => {
          const userDocument = userDocuments.find((userDoc) => userDoc.type === document.type);

          return (
            <div className='document-item' key={index}>
              <div className='document-status'>
                <div className={classNames('completion-bullet', { active: !!document?.key })}>
                  <Icon icon='checked' size={12} />
                </div>
                <Typography variant='body4' className='document-name'>
                  {document.type}
                </Typography>
              </div>

              <TenantDocumentItem
                document={document}
                userDocument={userDocument}
                key={index}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                useMyDocument={useMyDocument}
                handleDocument={handleDocument}
              />

              <LandlordDocumentItem
                document={document}
                approveOrDisapproveDocument={approveOrDisapproveDocument}
              />
            </div>
          );
        })}
      </div>

      <Typography variant='body4'>
        You can find more information about why we need these documents in the Hearthstone T&Cs section.
      </Typography>
    </div>
  );
})`
  &.tenant-documents {
    display: grid;
    row-gap: 24px;

    .tenant-documents-title {
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

          .button-img-wrapper {
            display: flex;

            img {
              margin-right: 10px;
              margin-top: 5px;
            }

            a {
              margin-right: 10px;
              margin-top: 16px;
            }
          }
        }
      }
    }
  }
`;

interface ITenantDocumentItem {
  document: IUser_Documents;
  selectedFile: any;
  setSelectedFile: React.Dispatch<React.SetStateAction<any>>;
  userDocument: IUser_Documents | undefined;
  useMyDocument: (document: IUser_Documents) => void;
  handleDocument: (document: IUser_Documents, type: DocumentType) => void;
}

const TenantDocumentItem = ({
  document,
  selectedFile,
  userDocument,
  setSelectedFile,
  useMyDocument,
  handleDocument
}: ITenantDocumentItem) => {
  return (
    <div className='document-action-buttons'>
      {document?.key && (
        <>
          {selectedFile && selectedFile.key === document.key ? (
            <>
              <UploadComponent handleDocument={(file: any) => handleDocument(file, document.type)} />
              {userDocument && (
                <Button onClick={() => useMyDocument(userDocument)}>Use my {document.type}</Button>
              )}
            </>
          ) : (
            <div className='button-img-wrapper'>
              {document.mimetype.startsWith('image') && (
                <img src={document.link} width={40} height={40} alt={''} />
              )}
              {document.mimetype.startsWith('application/pdf') && (
                <a href={`${document.link}`} target='_blank'>
                  {document.originalName}
                </a>
              )}
              <Button variant='secondary' onClick={() => setSelectedFile(document)}>
                Edit
              </Button>
            </div>
          )}
        </>
      )}

      {!document?.key && (
        <>
          <UploadComponent handleDocument={(file: any) => handleDocument(file, document.type)} />
          {userDocument && (
            <Button onClick={() => useMyDocument(userDocument)}>Use my {document.type}</Button>
          )}
        </>
      )}
    </div>
  );
};

interface ILandlordDocumentItem {
  document: IUser_Documents;
  approveOrDisapproveDocument: (document: IUser_Documents) => void;
}
const LandlordDocumentItem = ({ document, approveOrDisapproveDocument }: ILandlordDocumentItem) => {
  return (
    <div className='document-action-buttons'>
      {document?.approved ? (
        <Label variant='tertiary'>Approved</Label>
      ) : (
        <>
          {document.key ? (
            <div className='button-img-wrapper'>
              {document.mimetype.startsWith('image') && (
                <img src={document.link} width={40} height={40} alt={''} />
              )}
              {document.mimetype.startsWith('application/pdf') && (
                <a href={`${document.link}`} target='_blank'>
                  {document.originalName}
                </a>
              )}
              <Button onClick={() => approveOrDisapproveDocument(document)}>Approve</Button>
            </div>
          ) : (
            <Label variant='tertiary'>No document uploaded by tenant</Label>
          )}
        </>
      )}
    </div>
  );
};
