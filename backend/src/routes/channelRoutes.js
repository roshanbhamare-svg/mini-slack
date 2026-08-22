const express = require('express');
const router = express.Router();
const { getChannels, initChannels } = require('../controllers/channelController');

router.get('/', getChannels);
router.post('/init', initChannels); // Utility to init default channels

module.exports = router;
