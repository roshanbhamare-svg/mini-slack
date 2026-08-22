import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { X, Sparkles, Loader2 } from 'lucide-react';

const ThreadPane = ({ activeThread, onClose, currentUser, channelId }) => {
  const [replies, setReplies] = useState([]);
  const [aiDraft, setAiDraft] = useState('');
  const [draftTrigger, setDraftTrigger] = useState(0);
  const [isDrafting, setIsDrafting] = useState(false);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeThread) return;
    const fetchReplies = async () => {
      try {
        const res = await axios.get(`/api/messages/${activeThread._id}/replies`);
        setReplies(res.data);
      } catch (err) {
        console.error('Error fetching replies:', err);
      }
    };
    fetchReplies();
  }, [activeThread]);

  useEffect(() => {
    if (!socket || !activeThread) return;

    const onReceiveMessage = (message) => {
      if (message.threadId === activeThread._id) {
        setReplies(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const onReactionUpdated = (updatedMessage) => {
      if (updatedMessage.threadId === activeThread._id) {
        setReplies(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
      }
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('reaction_updated', onReactionUpdated);

    return () => {
      socket.off('receive_message', onReceiveMessage);
      socket.off('reaction_updated', onReactionUpdated);
    };
  }, [socket, activeThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [replies]);

  const handleDraftReply = async () => {
    if (!activeThread) return;
    setIsDrafting(true);
    setAiDraft(''); // clear previous draft trigger
    
    try {
      const res = await axios.post('/api/ai/draft-reply', {
        originalMessage: activeThread.content
      });
      // Append a space so user can keep typing easily
      setAiDraft(res.data.draft + ' ');
      setDraftTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error drafting reply:', err);
      const backendMessage = err.response?.data?.message || 'Failed to draft reply.';
      alert(backendMessage);
    } finally {
      setIsDrafting(false);
    }
  };

  if (!activeThread) return null;

  return (
    <div className="flex flex-col h-full w-80 lg:w-96 border-l border-gray-900 bg-gray-950 shrink-0 shadow-sm z-20">
      <div className="h-14 border-b border-gray-900 flex items-center justify-between px-4 bg-gray-950 shrink-0">
        <h3 className="font-bold text-white">Thread</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-200 hover:bg-gray-900 p-1 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {/* Render the original parent message distinctly */}
        <div className="pb-4 mb-4 border-b border-gray-900">
          <MessageList 
            messages={[activeThread]} 
            currentUser={currentUser} 
            channelId={channelId} 
            theme="dark"
          />
        </div>
        
        {/* Render Replies */}
        <MessageList 
          messages={replies} 
          currentUser={currentUser} 
          channelId={channelId} 
          theme="dark"
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-4 pt-0 flex flex-col gap-2">
        <button
          onClick={handleDraftReply}
          disabled={isDrafting}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isDrafting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} className="text-emerald-400" />
          )}
          {isDrafting ? 'Drafting...' : 'Draft AI Reply'}
        </button>
        <MessageInput 
          channelId={channelId} 
          currentUser={currentUser} 
          threadId={activeThread._id} 
          initialDraft={aiDraft}
          draftTrigger={draftTrigger}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default ThreadPane;
