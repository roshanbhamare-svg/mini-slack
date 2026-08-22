import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios';

function App() {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  
  // Basic user mock for this demo
  const [currentUser] = useState({
    _id: 'mock-user-' + Math.floor(Math.random() * 10000), // In real app, from Auth
    username: 'Guest' + Math.floor(Math.random() * 100),
    avatarUrl: `https://ui-avatars.com/api/?name=Guest`
  });

  useEffect(() => {
    // Fetch channels on mount
    const fetchChannels = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/channels');
        setChannels(res.data);
        if (res.data.length > 0) {
          setCurrentChannel(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching channels', err);
      }
    };
    fetchChannels();
  }, []);

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
            <ChatArea 
              channel={currentChannel} 
              currentUser={currentUser} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a channel to start messaging
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
