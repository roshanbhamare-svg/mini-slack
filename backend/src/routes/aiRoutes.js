const express = require('express');
const router = express.Router();
const { draftReply } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/draft-reply', protect, draftReply);

module.exports = router;
