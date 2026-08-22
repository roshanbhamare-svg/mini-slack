import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Search } from 'lucide-react';

const ChatArea = ({ channel, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${channel._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim() === '') {
      setIsSearching(false);
      fetchMessages();
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/search?q=${q}&channelId=${channel._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (channel && socket) {
      socket.emit('join_channel', { channelId: channel._id });
      fetchMessages();
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [channel, socket]);

  useEffect(() => {
    if (!socket) return;

    const onReceiveMessage = (message) => {
      if (message.channel === channel._id && !message.threadId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const onMessageDeleted = (deletedId) => {
      setMessages(prev => prev.map(m => m._id === deletedId ? { ...m, isDeleted: true, content: 'This message was deleted.' } : m));
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('message_deleted', onMessageDeleted);

    return () => {
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_deleted', onMessageDeleted);
    };
  }, [socket, channel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isSearching) scrollToBottom();
  }, [messages, isSearching]);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="h-14 border-b border-gray-700 shadow-sm flex items-center justify-between px-6 bg-gray-800/95 backdrop-blur z-10 shrink-0">
        <h2 className="font-bold text-gray-100 flex items-center gap-1.5">
          <span className="text-gray-500">#</span> {channel.name.replace('#', '')}
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={handleSearch}
            className="bg-gray-900 border border-gray-700 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-gray-200 placeholder-gray-500 w-64"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        <MessageList 
          messages={messages} 
          currentUser={currentUser} 
          channelId={channel._id} 
        />
        <div ref={messagesEndRef} />
      </div>

      {!isSearching && (
        <div className="shrink-0 p-4 pt-0">
          <MessageInput channelId={channel._id} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
