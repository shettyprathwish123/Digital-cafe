const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

const adminClients = new Set();
const orderClients = new Map();

function broadcastAdmin(event, payload) {
  for (const res of adminClients) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}

function broadcastOrder(orderId, event, payload) {
  const set = orderClients.get(orderId);
  if (set) {
    for (const res of set) {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }
}

router.get('/stream', authenticate, isAdmin, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  adminClients.add(res);
  res.write(`event: init\n`);
  res.write(`data: {"ok":true}\n\n`);
  const interval = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {"t":${Date.now()}}\n\n`);
  }, 15000);
  req.on('close', () => {
    adminClients.delete(res);
    clearInterval(interval);
  });
});

router.get('/:id/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const id = req.params.id;
  if (!orderClients.has(id)) orderClients.set(id, new Set());
  const set = orderClients.get(id);
  set.add(res);
  res.write(`event: init\n`);
  res.write(`data: {"ok":true}\n\n`);
  const interval = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {"t":${Date.now()}}\n\n`);
  }, 15000);
  req.on('close', () => {
    set.delete(res);
    clearInterval(interval);
    if (set.size === 0) orderClients.delete(id);
  });
});

// Create new order (public - no authentication required)
router.post('/', async (req, res) => {
  try {
    const { customerName, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Fetch menu items to calculate total price
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ error: 'Some menu items not found' });
    }

    // Calculate total price
    let totalPrice = 0;
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }
      const price = menuItem.price * item.quantity;
      totalPrice += price;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      };
    });

    const latest = await prisma.order.findFirst({
      select: { orderNumber: true },
      orderBy: { orderNumber: 'desc' },
    });
    const nextOrderNumber = (latest?.orderNumber || 0) + 1;

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        customerName,
        totalPrice,
        status: 'NEW',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    broadcastAdmin('order-create', order);
    broadcastOrder(order.id, 'order-update', order);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders (admin only - for queue management)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    
    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by ID (public - for customers to check status)
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by order number (public - for customers)
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const orderNumber = parseInt(req.params.orderNumber);
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.get('/queue/position/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const target = await prisma.order.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const active = await prisma.order.findMany({
      where: { OR: [{ status: 'NEW' }, { status: 'PREPARING' }] },
      orderBy: { createdAt: 'asc' },
      select: { id: true, status: true, items: true },
    });
    const position = active.findIndex(o => o.id === id);
    const queueLength = active.length;
    const perItem = 2;
    const base = 1;
    let totalItemsAhead = 0;
    for (let i = 0; i < active.length; i++) {
      if (active[i].id === id) break;
      totalItemsAhead += active[i].items.length;
    }
    const etaMinutes = base + totalItemsAhead * perItem;
    res.json({ position: position === -1 ? null : position, queueLength, etaMinutes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute queue position' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['NEW', 'PREPARING', 'READY', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    broadcastAdmin('order-update', order);
    broadcastOrder(order.id, 'order-update', order);
    res.json(order);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await prisma.order.delete({
      where: { id: req.params.id },
    });
    broadcastAdmin('order-delete', deleted);
    broadcastOrder(deleted.id, 'order-delete', deleted);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
