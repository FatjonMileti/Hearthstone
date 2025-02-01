import config from '../../../config';
import { SocialAccountButton } from '../../../components/SocialAccountButton';

// twitter oauth Url constructor
function getTwitterOauthUrl() {
  const rootUrl = 'https://twitter.com/i/oauth2/authorize';
  const options = {
    redirect_uri: config.twitter.redirect_page ?? '',
    client_id: config.twitter.client_id,
    state: 'state',
    response_type: 'code',
    code_challenge: 'y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8',
    code_challenge_method: 'S256',
    scope: ['users.read', 'tweet.read'].join(' ') // add/remove scopes as needed
  };
  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

export const LoginWithTwitter = ({}: any) => {
  const goTo = () => {
    const url = getTwitterOauthUrl();
    window.location.href = url;
  };
  return <SocialAccountButton icon='twitter' onClick={() => goTo()} />;
};
