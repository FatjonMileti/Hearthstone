'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config';
import SocketContext from './SocketContext';
import { useUserStore } from '../globalState/user';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const userStore = useUserStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (userStore.auth && userStore.userDetails?.user_id) {
      const newSocket = io(config.apiUrl, {
        ...(process.env.NODE_ENV !== 'development' && { transports: ['websocket'] }),
        auth: {
          token: userStore.auth.access_token,
        },
      });
      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [userStore?.userDetails?.user_id, userStore.auth]);

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
