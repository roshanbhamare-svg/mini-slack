import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import Register from './components/Register';
import { SocketProvider, useSocket } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';

const ProtectedLayout = () => {
  const { currentUser, loading } = useAuth();
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const socket = useSocket();

  const fetchChannels = async () => {
    try {
      const res = await axios.get('/api/channels');
      setChannels(res.data);
      if (res.data.length > 0 && !currentChannel) {
        handleChannelSelect(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching channels', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchChannels();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    
    const onNewUnread = ({ channelId, threadId }) => {
      // Ignore thread messages for main channel unread count
      if (threadId) return;
      
      // If we are currently looking at this channel, don't show it as unread
      if (currentChannel && currentChannel._id === channelId) return;

      setChannels(prev => prev.map(ch => 
        ch._id === channelId ? { ...ch, unreadCount: (ch.unreadCount || 0) + 1 } : ch
      ));
    };

    socket.on('new_unread_message', onNewUnread);
    return () => socket.off('new_unread_message', onNewUnread);
  }, [socket, currentChannel]);

  const handleChannelSelect = async (channel) => {
    setCurrentChannel(channel);
    try {
      // Mark as read in backend
      await axios.post(`/api/channels/${channel._id}/read`);
      // Clear unread count locally
      setChannels(prev => prev.map(ch => 
        ch._id === channel._id ? { ...ch, unreadCount: 0 } : ch
      ));
    } catch (err) {
      console.error('Error marking channel read', err);
    }
  };

  if (loading) return <div className="h-screen w-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <Sidebar 
        channels={channels} 
        currentChannel={currentChannel}
        setCurrentChannel={handleChannelSelect}
        currentUser={currentUser}
        fetchChannels={fetchChannels}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {currentChannel ? (
          <ChatArea channel={currentChannel} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a channel to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <SocketProvider>
            <ProtectedLayout />
          </SocketProvider>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
