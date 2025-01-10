import { createContext, Context } from 'react';
import { Socket } from 'socket.io-client';

interface ISocketContext {
  socket: Socket | null;
}

const SocketContext: Context<ISocketContext> = createContext<ISocketContext>({ socket: null });

export default SocketContext;
