const express = require('express');
const router = express.Router();
const { getMessages, searchMessages, getThreadReplies } = require('../controllers/messageController');

router.get('/search', searchMessages);
router.get('/:channelId', getMessages);
router.get('/:messageId/replies', getThreadReplies);

module.exports = router;
