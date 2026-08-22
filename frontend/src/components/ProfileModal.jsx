import React, { useState } from 'react';
import axios from 'axios';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ onClose, currentUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { logout } = useAuth();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto-close form after a second
      setTimeout(() => {
        setIsEditingPassword(false);
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-purple-600 to-blue-600"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex justify-between items-end mb-4">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username} 
              className="w-24 h-24 rounded-xl border-4 border-gray-800 bg-gray-900 shadow-md"
            />
          </div>

          <h2 className="text-2xl font-bold text-white">{currentUser.username}</h2>
          <p className="text-gray-400 mt-1">{currentUser.email}</p>

          <div className="mt-6 border-t border-gray-700 pt-6">
            {!isEditingPassword ? (
              <button 
                onClick={() => setIsEditingPassword(true)}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 bg-gray-700/50 hover:bg-gray-700 transition-colors"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Change Password</h3>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingPassword(false)}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>

                {error && <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded border border-red-800/50">{error}</div>}
                {success && <div className="text-green-400 text-sm bg-green-900/30 p-2 rounded border border-green-800/50 flex items-center gap-2"><Check size={16}/> {success}</div>}

                <div>
                  <input
                    type="password" placeholder="Current Password" required
                    value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:border-purple-500 text-white text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password" placeholder="New Password" required minLength="6"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:border-purple-500 text-white text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password" placeholder="Confirm New Password" required minLength="6"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:border-purple-500 text-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
          
          {/* Logout Option directly in profile modal as well for convenience */}
          {!isEditingPassword && (
             <div className="mt-4 pt-4 border-t border-gray-700">
               <button 
                 onClick={logout}
                 className="w-full text-left py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
               >
                 Log out of Mini Slack
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
