import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    // Connect to the backend socket server with the access token
    const newSocket = io('http://localhost:5001', {
      auth: { token: accessToken }
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
