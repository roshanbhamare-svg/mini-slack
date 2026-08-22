import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send } from 'lucide-react';

const MessageInput = ({ channelId, currentUser, threadId = null, initialDraft = '', draftTrigger = 0, theme = 'light' }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (draftTrigger > 0 && initialDraft) {
      setContent(initialDraft);
    }
  }, [draftTrigger, initialDraft]);
  const socket = useSocket();

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !socket) return;

    socket.emit('send_message', {
      channelId,
      content: content.trim(),
      senderId: currentUser._id,
      threadId,
    });
    
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className="relative mt-2">
      <div className={`overflow-hidden rounded-lg border shadow-sm focus-within:ring-1 focus-within:ring-emerald-400 transition-all ${theme === 'dark' ? 'border-gray-800 bg-gray-900 focus-within:border-emerald-500' : 'border-gray-300 bg-white focus-within:border-emerald-400'}`}>
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
          className={`block w-full resize-none border-0 bg-transparent py-3 px-4 focus:ring-0 sm:text-sm ${theme === 'dark' ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
          rows={1}
          style={{ minHeight: '3rem', maxHeight: '10rem' }}
        />
        
        <div className={`flex items-center justify-between px-2 py-1.5 border-t ${theme === 'dark' ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-2">
            {/* Additional buttons like attach file can go here */}
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-emerald-400 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400'}`}
          >
            <Send size={18} className={content.trim() ? "text-emerald-500" : ""} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
