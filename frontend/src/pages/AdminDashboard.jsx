import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material';
import {
  Logout,
  Refresh,
  ArrowForward,
  CheckCircle,
  Delete,
  LocalCafe,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/apiService';

const AdminDashboard = ({ mode, toggleTheme }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusFilter, setStatusFilter] = useState('active');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    let es;
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      try {
        es = new EventSource('/api/orders/stream', { withCredentials: true });
        es.addEventListener('order-create', () => {
          playNotify();
          showSnackbar('New order received', 'success');
          loadOrders();
        });
        const onEvent = () => loadOrders();
        es.addEventListener('order-update', onEvent);
        es.addEventListener('order-delete', onEvent);
        es.addEventListener('error', () => {
          try { es.close(); } catch { }
          setTimeout(connect, 2000);
        });
      } catch { }
    };
    connect();
    return () => {
      clearInterval(interval);
      stopped = true;
      es && es.close();
    };
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      let fetchedOrders;
      if (statusFilter === 'active') {
        // Get NEW and PREPARING orders
        const allOrders = await orderAPI.getAllOrders();
        fetchedOrders = allOrders.filter(
          (order) => order.status === 'NEW' || order.status === 'PREPARING'
        );
      } else if (statusFilter === 'all') {
        fetchedOrders = await orderAPI.getAllOrders();
      } else {
        fetchedOrders = await orderAPI.getAllOrders(statusFilter);
      }
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showSnackbar('Failed to load orders', 'error');
    }
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    setLoading(true);
    try {
      let newStatus = '';
      if (currentStatus === 'NEW') {
        newStatus = 'PREPARING';
      } else if (currentStatus === 'PREPARING') {
        newStatus = 'READY';
      } else if (currentStatus === 'READY') {
        newStatus = 'COMPLETED';
      }

      if (newStatus) {
        await orderAPI.updateOrderStatus(orderId, newStatus);
        showSnackbar(`Order status updated to ${newStatus}`, 'success');
        loadOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showSnackbar('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    setLoading(true);
    try {
      await orderAPI.deleteOrder(orderId);
      showSnackbar('Order deleted successfully', 'success');
      setDialogOpen(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      showSnackbar('Failed to delete order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const playNotify = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    } catch { }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'error';
      case 'PREPARING':
        return 'warning';
      case 'READY':
        return 'success';
      case 'COMPLETED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getNextStatusLabel = (status) => {
    switch (status) {
      case 'NEW':
        return 'Start Preparing';
      case 'PREPARING':
        return 'Mark Ready';
      case 'READY':
        return 'Complete';
      default:
        return 'Update Status';
    }
  };

  const [searchNumber, setSearchNumber] = useState('');
  const handleSearch = async () => {
    if (!searchNumber) return;
    try {
      const found = await orderAPI.getOrderByNumber(parseInt(searchNumber));
      if (found) {
        openOrderDetails(found);
        setSearchNumber('');
      }
    } catch {
      showSnackbar('Order not found', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <LocalCafe sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Order Queue
          </Typography>
          <Chip label="Live" color="success" size="small" sx={{ mr: 2 }} />
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} title="Toggle theme">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton color="inherit" onClick={loadOrders} title="Refresh">
            <Refresh />
          </IconButton>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Order Queue Management
          </Typography>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(e, newFilter) => newFilter && setStatusFilter(newFilter)}
            size="small"
          >
            <ToggleButton value="active">Active Orders</ToggleButton>
            <ToggleButton value="NEW">New</ToggleButton>
            <ToggleButton value="PREPARING">Preparing</ToggleButton>
            <ToggleButton value="READY">Ready</ToggleButton>
            <ToggleButton value="COMPLETED">Completed</ToggleButton>
            <ToggleButton value="all">All Orders</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <TextField
              size="small"
              label="Find Order #"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
            />
            <Button variant="outlined" onClick={handleSearch}>Search</Button>
          </Box>
        </Box>

        {orders.length === 0 ? (
          <Alert severity="info">No orders found in this category.</Alert>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: 2,
                    borderColor: order.status === 'NEW' ? 'error.main' : order.status === 'PREPARING' ? 'warning.main' : 'success.main',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => openOrderDetails(order)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h5" component="h2" fontWeight="bold">
                        Order #{order.orderNumber}
                      </Typography>
                      <Chip label={order.status} color={getStatusColor(order.status)} />
                    </Box>

                    {order.customerName && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Customer: {order.customerName}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Items: {order.items.length}
                    </Typography>

                    <Typography variant="h6" color="primary" gutterBottom>
                      Total: ₹{order.totalPrice.toFixed(2)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Placed: {new Date(order.createdAt).toLocaleString()}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {order.status !== 'COMPLETED' && (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={order.status === 'READY' ? <CheckCircle /> : <ArrowForward />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order.id, order.status);
                          }}
                          disabled={loading}
                        >
                          {getNextStatusLabel(order.status)}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              Order #{selectedOrder.orderNumber} Details
              <Chip
                label={selectedOrder.status}
                color={getStatusColor(selectedOrder.status)}
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              {selectedOrder.customerName && (
                <Typography variant="body1" gutterBottom>
                  <strong>Customer:</strong> {selectedOrder.customerName}
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                <strong>Order Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total:</strong> ₹{selectedOrder.totalPrice.toFixed(2)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Items:
              </Typography>
              <List>
                {selectedOrder.items.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={item.menuItem.name}
                      secondary={`Quantity: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                color="error"
                startIcon={<Delete />}
                disabled={loading}
              >
                Delete Order
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              {selectedOrder.status !== 'COMPLETED' && (
                <Button
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, selectedOrder.status);
                    setDialogOpen(false);
                  }}
                  variant="contained"
                  disabled={loading}
                >
                  {getNextStatusLabel(selectedOrder.status)}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminDashboard;
