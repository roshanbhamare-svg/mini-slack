import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Trash2, MessageSquare, Smile, Info } from 'lucide-react';
import MessageInfoModal from './MessageInfoModal';

const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString([], options);
};

const MessageList = ({ messages, currentUser, channelId, onReply }) => {
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
            className={`group flex gap-3 py-1.5 px-4 -mx-4 hover:bg-gray-800/80 transition-colors ${!showAvatar ? 'mt-0' : 'mt-2'}`}
            onMouseEnter={() => setHoveredMessageId(msg._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="w-10 flex-shrink-0 flex justify-center">
              {showAvatar ? (
                <img 
                  src={msg.sender?.avatarUrl || 'https://ui-avatars.com/api/?name=Unknown&background=555&color=fff'} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-md object-cover shadow-sm bg-gray-700"
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
                  <span className="font-semibold text-gray-200">
                    {msg.sender?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              )}
              
              <div className={`text-gray-300 ${msg.isDeleted ? 'italic text-gray-500 text-sm' : 'leading-relaxed'}`}>
                {msg.content}
              </div>

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className="bg-gray-700/50 text-xs px-1.5 py-0.5 rounded border border-gray-600/50">
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hover Actions */}
            {!msg.isDeleted && hoveredMessageId === msg._id && (
              <div className="absolute right-6 -mt-3 bg-gray-800 border border-gray-700 shadow-md rounded-md flex items-center p-0.5 z-10">
                <div className="flex items-center gap-1 border-r border-gray-700 pr-1 mr-1">
                  {['👍', '❤️', '😂', '🔥', '👀'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => handleReaction(msg._id, emoji)}
                      className="p-1 text-gray-400 hover:bg-gray-600 hover:scale-110 rounded transition-all text-sm"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => onReply && onReply(msg)}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                  title="Reply"
                >
                  <MessageSquare size={14} />
                </button>
                {isMine && (
                  <>
                    <button 
                      onClick={() => setInfoMessage(msg)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                      title="Message Info"
                    >
                      <Info size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(msg._id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 size={14} />
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
