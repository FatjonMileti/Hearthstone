import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { decodeJWT } from '../LoginModal';
import { useUserStore } from '../../../globalState/user';

export const RedirectUriTwitterPage = () => {
  const [cookies, , removeCookie] = useCookies(['oauth2_token', 'username', 'acceptCookies']);

  const navigate = useNavigate();

  const user = useUserStore();
  const setUser = useUserStore((state) => state.set);

  React.useEffect(() => {
    if (cookies && cookies.oauth2_token) {
      const auth = cookies.oauth2_token;
      const userDetails = decodeJWT(auth.access_token);
      setUser((user: any) => ({
        ...user,
        auth: {
          ...auth,
          expirationTime: Date.now() + auth.expires_in * 1000,
          refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
        },
        userDetails
      }));
      if (cookies.oauth2_token) {
        removeCookie('oauth2_token');
      }
    } else {
      return navigate('/login');
    }
  }, []);

  React.useEffect(() => {
    if (user && user.auth) {
      return navigate('/');
    }
  }, [user]);

  return <p>Loading...</p>;
};
