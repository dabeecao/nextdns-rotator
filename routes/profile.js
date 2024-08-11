const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ 
      username: user.username,
      nextdnsUrls: user.nextdnsUrls,
      dohUrl: `https://yourdomain.com/doh/${user.username}`,
      dotUrl: `${user.username}.yourdomain.com`
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin profile của người dùng' });
  }
});

router.post('/update', authenticateJWT, async (req, res) => {
  const { nextdnsUrls } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.userId, { nextdnsUrls });
    res.json({ message: 'Đã cập nhật profile' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật Profile' });
  }
});

module.exports = router;
