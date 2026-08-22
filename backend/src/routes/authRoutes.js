const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, changePassword, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout', logout);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, getAllUsers);

module.exports = router;
