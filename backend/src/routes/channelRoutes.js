const express = require('express');
const router = express.Router();
const { getChannels, initChannels, markChannelRead, createDM } = require('../controllers/channelController');

router.get('/', getChannels);
router.post('/dm', createDM);
router.post('/:channelId/read', markChannelRead);
router.post('/init', initChannels); // Utility to init default channels

module.exports = router;
