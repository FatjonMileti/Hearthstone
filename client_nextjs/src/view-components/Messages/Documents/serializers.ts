import { IUser_Documents } from '../../MyAccount/user.interface';

export const mapDocumentToSend = (documents: IUser_Documents[], document: IUser_Documents) => {
  return documents?.map((doc) => {
    if (doc.type === document.type) {
      doc = document;
      return doc;
    } else {
      return doc;
    }
  });
};
