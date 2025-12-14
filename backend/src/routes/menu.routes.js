const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: { name: 'asc' },
    });
    res.json(menuItems);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get single menu item (public)
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        category,
        imageUrl,
      },
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, price, description, category, imageUrl, available } = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: {
        name,
        price: price ? parseFloat(price) : undefined,
        description,
        category,
        imageUrl,
        available,
      },
    });

    res.json(menuItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.menuItem.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
