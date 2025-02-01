import React, { useRef } from 'react';
import axios from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';
import { Button } from '../../../components/Button';
import { AxiosError } from 'axios';

interface IUploadDocument {
  handleDocument: (data: any) => void;
}

export const UploadComponent = (props: IUploadDocument) => {
  const { handleDocument } = props;
  const { auth } = useUserStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddDocumentClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      const formData = new FormData();

      formData.append('files', selectedFile);
      try {
        const { status, data } = await axios(auth.access_token).post('/api/document/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (status === 200) {
          handleDocument(data[0]);
        }
      } catch (error: AxiosError | any) {}
    }
  };

  return (
    <>
      <input
        type='file'
        accept='image/*, application/pdf'
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={(event) => handleFileChange(event)}
      />
      <Button onClick={handleAddDocumentClick}>Upload</Button>
    </>
  );
};
