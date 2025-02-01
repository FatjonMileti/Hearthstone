import React from 'react';
import { IResolveParams, LoginSocialFacebook } from 'reactjs-social-login';
import { SocialAccountButton } from '../../../components/SocialAccountButton';

type FacebookLoginProps = {
  appId: string;
  onLoginSuccess: ({ provider, user }: { provider: string; user: any }) => void;
  onLoginFailure: (error: string) => void;
  scope?: string;
};

export const LoginWithFacebook: React.FC<FacebookLoginProps> = ({
  appId,
  onLoginSuccess,
  onLoginFailure,
  scope = 'email'
}) => {
  return (
    <LoginSocialFacebook
      appId={appId}
      onResolve={({ provider, data }: IResolveParams) => {
        onLoginSuccess({ provider, user: data });
      }}
      scope={scope}
      onReject={(error) => {
        onLoginFailure('failed_to_login_facebook');
      }}>
      <SocialAccountButton icon='facebook-f' />
    </LoginSocialFacebook>
  );
};
