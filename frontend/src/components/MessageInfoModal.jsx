import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Users, CheckCheck } from 'lucide-react';

const MessageInfoModal = ({ message, onClose }) => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReaders = async () => {
      try {
        const res = await axios.get(`/api/messages/${message._id}/read-by`);
        setReaders(res.data);
      } catch (err) {
        console.error('Error fetching readers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReaders();
  }, [message._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-2">
            <CheckCheck size={18} className="text-blue-400" />
            <h3 className="font-semibold text-gray-200">Message Info</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Your message:</div>
          <div className="text-gray-200 italic break-words border-l-2 border-purple-500 pl-3 py-1">
            "{message.content}"
          </div>
        </div>

        <div className="p-4 h-64 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={14} /> Read by {readers.length > 0 ? `(${readers.length})` : ''}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : readers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No one has read this yet.
            </div>
          ) : (
            <div className="space-y-3">
              {readers.map(user => (
                <div key={user._id} className="flex items-center gap-3 bg-gray-700/20 p-2 rounded-lg border border-gray-700/50">
                  <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-md bg-gray-800" />
                  <span className="font-medium text-gray-300">{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
