import { useUserStore } from '../../../globalState/user';
import { useProfileStore } from '../../../globalState/profile';
import React from 'react';
import axios from '../../../utils/axios';
import { AxiosError } from 'axios';
import { DOCUMENT_TYPES, DocumentType, IUser_Documents } from '../../MyAccount/user.interface';
import { mapDocumentToSend } from './serializers';

interface IDocument {
  _id: string | undefined;
  tenant: string;
  landlord: string;
  file: any[];
}

interface IUseDocs {
  participant: string;
}
export const useDocuments = ({
  participant
}: IUseDocs): {
  documents: IUser_Documents[];
  setDocument: React.Dispatch<React.SetStateAction<IDocument>>;
  userDocuments: IUser_Documents[];
  useMyDocument: (document: IUser_Documents) => void;
  handleDocument: (document: IUser_Documents, type: DocumentType) => void;
  approveOrDisapproveDocument: (documentDetails: IUser_Documents) => void;
} => {
  const [document, setDocument] = React.useState<IDocument>({
    _id: undefined,
    file: DOCUMENT_TYPES,
    tenant: '',
    landlord: ''
  });
  const [userDocuments, setUserDocuments] = React.useState<IUser_Documents[]>([]);
  const { auth } = useUserStore();

  const profileStore = useProfileStore();

  React.useEffect(() => {
    getUploadedDocuments();
    if (!document._id) {
      getUserDocuments();
    }
  }, [profileStore.id]);

  const getUploadedDocuments = async () => {
    try {
      const { data, status } = await axios(auth.access_token).get('/api/document/by-user', {
        params: { participant }
      });

      if (status === 200) {
        setDocument(data);
      }
    } catch (error: AxiosError | any) {}
  };

  const getUserDocuments = async () => {
    const { documents } = profileStore;
    if (documents?.length > 0) {
      setUserDocuments(
        DOCUMENT_TYPES.map((doc) => {
          const exitingDocument = documents.find((item) => item.type === doc.type && item.key && item.link);
          return exitingDocument ? exitingDocument : doc;
        })
      );
    }
  };

  const useMyDocument = async (userDoc: IUser_Documents) => {
    try {
      const documentsToSend: IUser_Documents[] = mapDocumentToSend(document.file, userDoc);

      const response = await postOrUpdateDocs(documentsToSend);
      setDocument(response.data);
    } catch (err: AxiosError | any) {}
  };

  const handleDocument = async (currentDoc: any, type: DocumentType) => {
    try {
      currentDoc.type = type;

      const documentsToSend: IUser_Documents[] = mapDocumentToSend(document.file, currentDoc);
      const response = await postOrUpdateDocs(documentsToSend);
      setDocument(response.data);
    } catch (error: AxiosError | any) {
      console.log(error);
    }
  };

  const postOrUpdateDocs = async (docs: IUser_Documents[]) => {
    return document._id
      ? await axios(auth.access_token).patch('/api/document/' + document._id, {
          participant,
          file: docs
        })
      : await axios(auth.access_token).post('/api/document', {
          participant,
          file: docs
        });
  };

  const approveOrDisapproveDocument = async (documentDetails: IUser_Documents) => {
    documentDetails.approved = !documentDetails.approved;
    try {
      const { data, status } = await axios(auth.access_token).patch('/api/document/' + document._id, {
        fileDoc: documentDetails
      });

      if (status === 200) {
        setDocument(data);
      }
    } catch (error: AxiosError | any) {}
  };

  return {
    documents: document.file,
    setDocument,
    userDocuments,
    useMyDocument,
    handleDocument,
    approveOrDisapproveDocument
  };
};
