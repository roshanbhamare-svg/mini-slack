import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send } from 'lucide-react';

const MessageInput = ({ channelId, currentUser }) => {
  const [content, setContent] = useState('');
  const socket = useSocket();

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !socket) return;

    socket.emit('send_message', {
      channelId,
      content: content.trim(),
      senderId: currentUser._id,
    });
    
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className="relative mt-2">
      <div className="overflow-hidden rounded-lg border border-gray-600 bg-gray-700/50 shadow-sm focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Message this channel..."
          className="block w-full resize-none border-0 bg-transparent py-3 px-4 text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          rows={1}
          style={{ minHeight: '3rem', maxHeight: '10rem' }}
        />
        
        <div className="flex items-center justify-between bg-gray-800/80 px-2 py-1.5">
          <div className="flex items-center gap-2">
            {/* Additional buttons like attach file can go here */}
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <Send size={18} className={content.trim() ? "text-purple-400" : ""} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
