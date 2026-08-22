const Channel = require('../models/Channel');

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
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

module.exports = {
  getChannels,
  initChannels,
};
