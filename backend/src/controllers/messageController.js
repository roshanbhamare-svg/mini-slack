const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    // Get messages for the channel that are not replies (no threadId)
    const messages = await Message.find({ channel: channelId, threadId: { $exists: false } })
      .populate('sender', 'username avatarUrl')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { q, channelId } = req.query;
    if (!q) return res.json([]);
    
    const query = { content: { $regex: q, $options: 'i' }, isDeleted: false };
    if (channelId) {
      query.channel = channelId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getThreadReplies = async (req, res) => {
  try {
    const { messageId } = req.params;
    const replies = await Message.find({ threadId: messageId })
      .populate('sender', 'username avatarUrl')
      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getMessages,
  searchMessages,
  getThreadReplies,
};
