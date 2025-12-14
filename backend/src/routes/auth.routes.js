const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register (for initial setup only)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
      return res.status(400).json({ error: 'Username and password (min 6 chars) are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin',
      },
    });

    // Store user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
