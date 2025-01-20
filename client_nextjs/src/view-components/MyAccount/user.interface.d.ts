export interface IUser_Documents {
  _id?: string;
  file?: any;
  approved?: boolean;
}

export interface UserNotifications {
  email_updates: boolean;
  sms_updates: boolean;
  desktop_notification: boolean;
  offers_updates: boolean;
  news_updates: boolean;
}
