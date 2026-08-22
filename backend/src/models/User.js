const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
