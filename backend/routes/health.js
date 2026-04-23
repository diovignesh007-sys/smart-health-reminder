const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { submitHealth, getLatestRecord } = require('../controllers/healthController');

router.post('/submit', authMiddleware, submitHealth);
router.get('/latest', authMiddleware, getLatestRecord);

module.exports = router;