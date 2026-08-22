const express = require('express');
const router = express.Router();
const { getMessages, searchMessages, getThreadReplies, getMessageReaders } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// Make sure auth middleware is applied to these routes if they are protected
router.use(protect);

router.get('/search', searchMessages);
router.get('/:messageId/replies', getThreadReplies);
router.get('/:messageId/read-by', getMessageReaders);
router.get('/:channelId', getMessages);

module.exports = router;
