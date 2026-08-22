import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import Register from './components/Register';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';

const ProtectedLayout = () => {
  const { currentUser, loading } = useAuth();
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchChannels = async () => {
      try {
        const res = await axios.get('/api/channels');
        setChannels(res.data);
        if (res.data.length > 0) setCurrentChannel(res.data[0]);
      } catch (err) {
        console.error('Error fetching channels', err);
      }
    };
    fetchChannels();
  }, [currentUser]);

  if (loading) return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;

  return (
    <SocketProvider>
      <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
        <Sidebar 
          channels={channels} 
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-gray-800">
          {currentChannel ? (
            <ChatArea channel={currentChannel} currentUser={currentUser} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a channel to start messaging
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
