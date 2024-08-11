const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Người dùng đã đăng kí' });
  } catch (error) {
    res.status(500).json({ error: 'Thử tạo tên đăng nhập khác' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Sai mật khẩu hoặc tên người dùng' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi đăng nhập' });
  }
});

module.exports = router;
