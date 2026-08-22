import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios';

function App() {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch mock user and channels on mount
    const initApp = async () => {
      try {
        // 1. Get or create a random mock user in the DB
        const randomName = 'Guest' + Math.floor(Math.random() * 1000);
        const userRes = await axios.post('http://localhost:5001/api/users/login', { username: randomName });
        setCurrentUser(userRes.data);

        // 2. Fetch channels
        const res = await axios.get('http://localhost:5001/api/channels');
        setChannels(res.data);
        if (res.data.length > 0) {
          setCurrentChannel(res.data[0]);
        }
      } catch (err) {
        console.error('Error initializing app', err);
      }
    };
    initApp();
  }, []);

  if (!currentUser) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

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
