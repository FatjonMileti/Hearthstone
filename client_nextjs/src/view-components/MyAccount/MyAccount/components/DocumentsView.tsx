import React, { useRef } from 'react';
import { IUser_Documents, DOCUMENT_TYPES, DocumentType } from '../user.interface';
import { Typography } from '../../../../components';
import { Button } from '../../../../components';
import { Icon } from '../../../../components';

const getDescription = (type: DocumentType) => {
  let description: string = '';
  if (type === 'Proof of ID') {
    description = `Upload a document (jpg, png or pdf) of your valid ID to verify your account. Once verified a badge will be visible on your account to indicate that your account is verified.`;
  }
  if (type === 'Landlord reference') {
    description = `Upload a document (Landlord reference) (jpg, png or pdf).`;
  }
  if (type === 'Employer reference') {
    description = `Upload a document (Employer reference) (jpg, png or pdf).`;
  }
  return <Typography variant='body4'>{description}</Typography>;
};

interface IDocumentView {
  documents: IUser_Documents[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => void;
}

export const DocumentsView = (props: IDocumentView) => {
  const { handleFileChange, documents } = props;

  // Use an object to hold refs for each document type
  const fileInputRefs: { [key in DocumentType]: React.RefObject<HTMLInputElement> } = {
    'Proof of ID': useRef<HTMLInputElement>(null),
    'Landlord reference': useRef<HTMLInputElement>(null),
    'Employer reference': useRef<HTMLInputElement>(null)
  };

  const handleAddDocumentClick = (type: DocumentType) => {
    const fileInputRef = fileInputRefs[type];
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {DOCUMENT_TYPES.map((document, index) => {
        const selectedDocument = documents.find((userDoc) => userDoc.type === document.type);

        console.log({ selectedDocument });

        return (
          <div className='section' key={index}>
            <Typography variant='body4' className='title'>
              {document.type}
            </Typography>
            {getDescription(document.type)}

            <Button
              size='small'
              variant='secondary'
              startIcon={
                selectedDocument?.key ? (
                  <Icon icon='chevron-right' size={20} />
                ) : (
                  <Icon icon='plus' size={20} />
                )
              }
              onClick={() => handleAddDocumentClick(document.type)}>
              {selectedDocument?.key ? 'Change document' : 'Add document'}
            </Button>
            <input
              type='file'
              accept='image/*, application/pdf'
              style={{ display: 'none' }}
              ref={fileInputRefs[document.type]}
              onChange={(event) => handleFileChange(event, document.type)}
            />
            {selectedDocument?.link && selectedDocument.mimetype.startsWith('image/') && (
              <img src={selectedDocument.link} alt='preview' height={200} />
            )}
            {selectedDocument?.link && selectedDocument.mimetype.startsWith('application/pdf') && (
              <>
                Download{' '}
                <a href={`${selectedDocument.link}`} target='_blank'>
                  {selectedDocument.originalName}
                </a>
              </>
            )}
            {document.type === 'Proof of ID' && (
              <div className='note'>
                <Typography variant='body5'>
                  <b>Note:</b> ID verification is mandatory to generate the transaction agreement. You can
                  skip this step but remember you won’t be able to message your match and close the deal until
                  you generate and sign the transaction agreement.
                </Typography>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
