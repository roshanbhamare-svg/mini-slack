import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { X } from 'lucide-react';

const ThreadPane = ({ activeThread, onClose, currentUser, channelId }) => {
  const [replies, setReplies] = useState([]);
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

  if (!activeThread) return null;

  return (
    <div className="flex flex-col h-full w-80 lg:w-96 border-l border-gray-700 bg-gray-800 shrink-0 shadow-xl">
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800 shrink-0">
        <h3 className="font-bold text-gray-100">Thread</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 p-1 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {/* Render the original parent message distinctly */}
        <div className="pb-4 mb-4 border-b border-gray-700/50">
          <MessageList 
            messages={[activeThread]} 
            currentUser={currentUser} 
            channelId={channelId} 
          />
        </div>
        
        {/* Render Replies */}
        <MessageList 
          messages={replies} 
          currentUser={currentUser} 
          channelId={channelId} 
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-4 pt-0">
        <MessageInput 
          channelId={channelId} 
          currentUser={currentUser} 
          threadId={activeThread._id} 
        />
      </div>
    </div>
  );
};

export default ThreadPane;
