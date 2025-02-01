import { useCallback } from 'react';
import config from '../../../config';
import { LoginSocialGoogle, IResolveParams } from 'reactjs-social-login';
import { SocialAccountButton } from '../../../components/SocialAccountButton';
export const LoginWithGoogle = (props: any) => {
  const { onSuccess } = props;

  const onLoginStart = useCallback(() => {
    console.log('login start');
  }, []);

  return (
    <LoginSocialGoogle
      client_id={config.google.google_app_id || ''}
      onLoginStart={onLoginStart}
      redirect_uri={config.google.redirect_page || ''}
      scope='profile email'
      discoveryDocs='claims_supported'
      access_type='offline'
      onResolve={({ provider, data }: IResolveParams) => {
        onSuccess({ provider, user: data });
      }}
      onReject={(err) => {
        console.log(err);
      }}>
      <SocialAccountButton icon='google' />
    </LoginSocialGoogle>
  );
};
