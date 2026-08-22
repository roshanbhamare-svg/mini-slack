import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Trash2, MessageSquare, Smile, Info } from 'lucide-react';
import MessageInfoModal from './MessageInfoModal';

const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString([], options);
};

const MessageList = ({ messages, currentUser, channelId, onReply, theme = 'light' }) => {
  const socket = useSocket();
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const handleDelete = (messageId) => {
    socket.emit('delete_message', { messageId, channelId });
  };

  const handleReaction = (messageId, emoji) => {
    socket.emit('add_reaction', { messageId, channelId, emoji, userId: currentUser._id });
  };

  return (
    <div className="flex flex-col">
      {messages.map((msg, index) => {
        const isMine = msg.sender?._id === currentUser._id;
        const showAvatar = index === 0 || messages[index - 1].sender?._id !== msg.sender?._id;

        return (
          <div 
            key={msg._id} 
            className={`group flex gap-3 py-1.5 px-4 -mx-4 transition-colors ${theme === 'dark' ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100/60'} ${!showAvatar ? 'mt-0' : 'mt-2'}`}
            onMouseEnter={() => setHoveredMessageId(msg._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="w-10 flex-shrink-0 flex justify-center">
              {showAvatar ? (
                <img 
                  src={msg.sender?.avatarUrl || 'https://ui-avatars.com/api/?name=Unknown&background=555&color=fff'} 
                  alt="avatar" 
                  className={`w-10 h-10 rounded-md object-cover shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-800' : 'bg-gray-200 border-gray-200'}`}
                />
              ) : (
                <div className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 flex items-center h-5">
                  {formatTime(msg.createdAt)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {showAvatar && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {msg.sender?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              )}
              
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} ${msg.isDeleted ? (theme === 'dark' ? 'italic text-gray-500 text-sm' : 'italic text-gray-400 text-sm') : 'leading-relaxed'}`}>
                {msg.content}
              </div>

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className={`text-xs px-1.5 py-0.5 rounded border ${theme === 'dark' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-900 border-orange-200'}`}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hover Actions */}
            {!msg.isDeleted && hoveredMessageId === msg._id && (
              <div className={`absolute right-6 -mt-3 shadow-sm rounded-md flex items-center p-0.5 z-10 ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <div className={`grid grid-cols-10 gap-0.5 pr-1 mr-1 p-0.5 border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                  {['👍', '❤️', '😂', '🔥', '👀', '🎉', '💯', '🤔', '🙌', '✨', '😊', '🙏', '😎', '💡', '✅', '🚀', '👏', '😅', '😍', '🤷'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => handleReaction(msg._id, emoji)}
                      className={`p-1.5 flex items-center justify-center hover:scale-110 rounded transition-all text-base ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => onReply && onReply(msg)}
                  className={`p-2 rounded transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                  title="Reply"
                >
                  <MessageSquare size={18} />
                </button>
                {isMine && (
                  <>
                    <button 
                      onClick={() => setInfoMessage(msg)}
                      className={`p-2 rounded transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/20' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                      title="Message Info"
                    >
                      <Info size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(msg._id)}
                      className={`p-2 rounded transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                      title="Delete Message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {infoMessage && (
        <MessageInfoModal 
          message={infoMessage} 
          onClose={() => setInfoMessage(null)} 
        />
      )}
    </div>
  );
};

export default MessageList;
