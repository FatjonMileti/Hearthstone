import React from 'react';
import { styled } from '@mui/system';
import axios, { AxiosError } from 'axios';
import { useNavigate, useParams } from '../../compat/router';

import config from '../../config';
import { ShowGlobalLoading } from '../../components';
import { decodeJWT } from '../Login/LoginModal';
import { useUserStore } from '../../globalState/user';
export const VerifyAccount = styled(({ className = '' }: React.HTMLAttributes<HTMLDivElement>) => {
  const setUser = useUserStore((user) => user.set);

  const [loading, setLoading] = React.useState(false);

  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.apiUrl}/api/account/invitation/${params.token}`);
        await verifyRegistration(response);
      } catch (err: AxiosError | any) {
        if (err?.response?.data?.message === 'user_not_found') {
          return navigate('/404');
        }
        throw err;
      }

      navigate('/');
    })();
  }, [params]);

  const verifyRegistration = async (response: any) => {
    setLoading(true);
    const auth = response.data;
    try {
      const userDetails = decodeJWT(response.data.access_token);

      setUser((user: any) => ({
        ...user,
        auth: {
          ...auth,
          expirationTime: Date.now() + auth.expires_in * 1000,
          refreshExpirationTime: Date.now() + auth.refresh_expires_in * 1000
        },
        userDetails
      }));
    } catch (err: AxiosError | any) {
      const message = err?.response?.data?.message;

      if (!message) throw err;

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return <div className={`set-password ${className}`}>{loading && <ShowGlobalLoading />}</div>;
})`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f3edea 30.91%);
`;
