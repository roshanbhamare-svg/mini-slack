const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');

const getChannels = async (req, res) => {
  try {
    // Determine query: If user logged in, get public channels OR DMs where user is member
    // Use { $ne: true } so older channels without the isDM field are treated as public
    const query = req.user 
      ? { $or: [{ isDM: { $ne: true } }, { isDM: true, members: req.user._id }] }
      : { isDM: { $ne: true } };

    const channels = await Channel.find(query)
      .populate('members', 'username avatarUrl')
      .sort({ createdAt: 1 })
      .lean();
    
    if (req.user) {
      // Calculate unread count for each channel
      const channelsWithUnread = await Promise.all(
        channels.map(async (channel) => {
          const lastReadDate = req.user.lastRead?.get(channel._id.toString()) || new Date(0);
          
          const unreadCount = await Message.countDocuments({
            channel: channel._id,
            createdAt: { $gt: lastReadDate },
            threadId: { $exists: false } // only count main channel messages
          });
          
          return { ...channel, unreadCount };
        })
      );
      return res.json(channelsWithUnread);
    }

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const markChannelRead = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id);
    user.lastRead.set(channelId, new Date());
    await user.save();

    res.json({ message: 'Channel marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const initChannels = async (req, res) => {
  try {
    const defaultChannels = ['#general', '#engineering', '#random', '#design'];
    for (const name of defaultChannels) {
      await Channel.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Default channels initialized' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createDM = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    // Ensure we don't DM ourselves
    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot DM yourself' });
    }

    const members = [req.user._id, targetUserId].sort();
    const dmName = `DM_${members[0]}_${members[1]}`;

    // Check if it already exists
    let channel = await Channel.findOne({ name: dmName });
    if (!channel) {
      channel = await Channel.create({
        name: dmName,
        isDM: true,
        members: members
      });
    }
    
    const populatedChannel = await Channel.findById(channel._id).populate('members', 'username avatarUrl').lean();
    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getChannels,
  markChannelRead,
  initChannels,
  createDM,
};
