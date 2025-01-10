export default {
  apiUrl: process.env.NEXT_PUBLIC_BACK_END_URL || 'http://localhost:3001',
  googleRedirectUrl: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  google: {
    google_app_id: process.env.NEXT_PUBLIC_GG_APP_ID || '',
    redirect_page: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
  },
  facebook: {
    facebook_id: `${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}`,
  },
  redirect_uri: `${process.env.NEXT_PUBLIC_FRONT_END_URL || ''}`,
  twitter: {
    client_id: `${process.env.NEXT_PUBLIC_TWITTER_APP_ID || ''}`,
    redirect_page: process.env.NEXT_PUBLIC_TWITTER_REDIRECT_PAGE || '',
  },
  apple: {
    client_id: `${process.env.NEXT_PUBLIC_APPLE_ID || 'ttest'}`,
  },
};
