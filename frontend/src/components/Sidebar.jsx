import React, { useState } from 'react';
import axios from 'axios';
import { Hash, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import NewDMModal from './NewDMModal';

const Sidebar = ({ channels, currentChannel, setCurrentChannel, currentUser, fetchChannels }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);

  const publicChannels = channels.filter(c => !c.isDM);
  const directMessages = channels.filter(c => c.isDM);

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
  };

  const handleCreateDM = async (targetUserId) => {
    try {
      const res = await axios.post('/api/channels/dm', { targetUserId });
      setIsNewDMOpen(false);
      await fetchChannels();
      setCurrentChannel(res.data);
    } catch (err) {
      console.error('Error creating DM', err);
    }
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
            {publicChannels.map((channel) => {
              const isActive = currentChannel?._id === channel._id;
              const hasUnread = channel.unreadCount > 0;
              
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
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 mt-6 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direct Messages</h2>
            <button 
              onClick={() => setIsNewDMOpen(true)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              title="New Message"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {directMessages.map((channel) => {
              const isActive = currentChannel?._id === channel._id;
              const hasUnread = channel.unreadCount > 0;
              const otherMember = channel.members?.find(m => m._id !== currentUser._id) || channel.members?.[0];
              const displayName = otherMember?.username || 'Unknown';
              
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
                    <img 
                      src={otherMember?.avatarUrl || 'https://ui-avatars.com/api/?name=Unknown'} 
                      alt={displayName}
                      className="w-4 h-4 rounded-sm bg-gray-700" 
                    />
                    <span className={`truncate ${isActive || hasUnread ? 'font-medium' : ''}`}>
                      {displayName}
                    </span>
                  </div>
                  {hasUnread && !isActive && (
                    <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {currentUser && (
        <>
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="p-4 border-t border-gray-800 bg-gray-900 shrink-0 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-8 h-8 rounded-md bg-gray-800" />
                <div className="truncate">
                  <div className="text-sm font-bold text-gray-200 truncate">{currentUser.username}</div>
                  <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }} 
                className="text-gray-500 hover:text-red-400 hover:bg-gray-700 p-1.5 rounded transition-colors" 
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          
          {isProfileOpen && (
            <ProfileModal onClose={() => setIsProfileOpen(false)} currentUser={currentUser} />
          )}

          {isNewDMOpen && (
            <NewDMModal 
              onClose={() => setIsNewDMOpen(false)} 
              onUserSelect={handleCreateDM} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
