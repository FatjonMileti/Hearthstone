import React from 'react';
import { useLocation, useNavigate } from '../../../compat/router';

export const RedirectUriPage = () => {
  const params = new URLSearchParams(useLocation().search);
  const code = params.get('code');
  const state = params.get('state');
  const navigate = useNavigate();
  React.useEffect(() => {
    try {
      window.opener?.postMessage({ code, state });
      window.close();
      if (code && state) {
        navigate(`/login`, { state: { code, state } });
      }
    } catch (error: any) {
      console.log(error);
    }
  }, []);
  return null;
};
