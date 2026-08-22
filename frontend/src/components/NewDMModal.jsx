import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Search } from 'lucide-react';

const NewDMModal = ({ onClose, onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/auth/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">New Direct Message</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="h-72 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map(user => (
                <button
                  key={user._id}
                  onClick={() => onUserSelect(user._id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors group text-left"
                >
                  <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-md bg-gray-200" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-gray-900 group-hover:text-emerald-800 truncate">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewDMModal;
