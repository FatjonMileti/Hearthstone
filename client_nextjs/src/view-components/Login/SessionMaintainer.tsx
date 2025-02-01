import React from 'react';
import axios from '../../utils/axios';
import config from '../../config';
import { decodeJWT } from './LoginModal';
import { ShowGlobalLoading } from '../../components';
import { useUserStore } from '../../globalState/user';
import { useProfileStore } from '../../globalState/profile';
import { useNavigate } from 'react-router-dom';

export const refreshToken = async (debug = false) => {
  if (debug) console.log('Refreshing token...');

  const userStore = useUserStore.getState();

  try {
    const response = await axios(null).post(`${config.apiUrl}/api/account/refresh`, {
      refresh_token: userStore.auth.refresh_token
    });

    const userDetails = decodeJWT(response.data.access_token);

    userDetails.rules = response.data.rules;

    const auth = response.data;

    userStore.set((user: any) => ({
      ...user,
      auth: {
        ...auth,
        expirationTime: Date.now() + auth.expires_in * 1000,
        refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
      },
      userDetails
    }));
  } catch (error) {
    if (debug) console.log('Error refreshing token', error);
    userStore.set((user: any) => ({ ...user, auth: null, userDetails: null, ability: null }));
  }
};

export const SessionMaintainer = ({
  debug = false,
  children = null
}: {
  debug?: boolean;
  children?: React.ReactNode;
}) => {
  const user = useUserStore();
  const setUser = useUserStore((state) => state.set);
  const profileStore = useProfileStore();

  const [refreshTimeoutId, setRefreshTimeoutId] = React.useState<NodeJS.Timeout | undefined>(undefined);
  const [resumingSession, setResumingSession] = React.useState<boolean>(true);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user.auth) {
      setResumingSession(false);
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }
      setRefreshTimeoutId(undefined);
      if (debug) console.log('No session');
      return;
    }

    setResumingSession(true);

    const tokenExpirationTime = user.auth.expirationTime;
    const now = Date.now();
    const refreshTokenExpirationTime = user.auth.refreshExpirationTime;
    const offset = 5 * 1000;
    const timeUntilRefresh = tokenExpirationTime - now - offset; // 1 minute before expiration

    if (timeUntilRefresh <= 0) {
      if (debug) console.log('Token has expired');
      if (now > refreshTokenExpirationTime) {
        if (debug) console.log('Refresh token has expired');

        setUser((user: any) => ({ ...user, auth: null, userDetails: null, ability: null }));
        setResumingSession(false);
      } else {
        if (debug) console.log('Refresh token has not expired yet');

        refreshToken(debug).then(() => {
          setResumingSession(false);
        });
      }
    } else {
      if (debug) {
        console.log('Token has not expired yet, it expires in: ', `${(tokenExpirationTime - now) / 1000}s`);
      }

      const timeoutId = setTimeout(refreshToken, timeUntilRefresh);
      setRefreshTimeoutId(timeoutId);

      if (debug)
        console.log(
          `scheduled refresh ${offset / 1000}s before it expires, after: ${timeUntilRefresh / 1000}s`
        );

      // check if user deleted or access denied
      if (debug) console.log('Checking if user still have access...');

      profileStore
        .fetchProfile(user.auth.access_token)
        .then(() => {
          if (debug) console.log('User still have access');
        })
        .catch((err) => {
          if (debug) console.log('Error fetching user profile: ', err);
          setUser((user: any) => ({ ...user, auth: null, userDetails: null, ability: null }));
          navigate('/');
        })
        .finally(() => {
          setResumingSession(false);
        });
    }
  }, [user.auth]);

  return <>{resumingSession ? <ShowGlobalLoading /> : <>{children}</>}</>;
};
