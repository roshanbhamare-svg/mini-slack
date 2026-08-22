import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Hash } from 'lucide-react';

const Sidebar = ({ channels, currentChannel, setCurrentChannel }) => {
  const socket = useSocket();
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If the message is not for the currently open channel, increment unread count
      if (currentChannel && message.channel !== currentChannel._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.channel]: (prev[message.channel] || 0) + 1
        }));
      }
    };

    socket.on('receive_message', handleNewMessage);
    return () => socket.off('receive_message', handleNewMessage);
  }, [socket, currentChannel]);

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
    // Clear unread count when opening the channel
    setUnreadCounts(prev => ({ ...prev, [channel._id]: 0 }));
  };

  return (
    <div className="w-64 bg-gray-900 flex flex-col h-full border-r border-gray-700 shadow-xl z-10">
      <div className="p-4 flex items-center shadow-md bg-gray-900 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Mini Slack
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Channels</h2>
          <div className="space-y-1">
            {channels.map((channel) => {
              const isActive = currentChannel?._id === channel._id;
              const hasUnread = unreadCounts[channel._id] > 0;
              
              return (
                <button
                  key={channel._id}
                  onClick={() => handleChannelClick(channel)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded transition-all duration-200 group
                    ${isActive 
                      ? 'bg-purple-600/20 text-purple-300' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Hash size={16} className={isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'} />
                    <span className={`truncate ${isActive || hasUnread ? 'font-medium' : ''}`}>
                      {channel.name.replace('#', '')}
                    </span>
                  </div>
                  {hasUnread && !isActive && (
                    <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                      {unreadCounts[channel._id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
