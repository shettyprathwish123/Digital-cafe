import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  Box,
  Chip,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  TextField,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  LocalCafe,
  RestaurantMenu,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { menuAPI, orderAPI } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const CustomerView = ({ mode, toggleTheme }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    loadMenuItems();
    try {
      const saved = localStorage.getItem('dcafe_cart');
      const savedName = localStorage.getItem('dcafe_name');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setCart(parsed);
          showSnackbar('Restored your cart', 'success');
        }
      }
      if (savedName) setCustomerName(savedName);
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dcafe_cart', JSON.stringify(cart));
      localStorage.setItem('dcafe_name', customerName);
    } catch { }
  }, [cart, customerName]);

  const loadMenuItems = async () => {
    try {
      const items = await menuAPI.getAllItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      showSnackbar('Failed to load menu items', 'error');
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((ci) => ci.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showSnackbar(`${item.name} added to cart`, 'success');
  };

  const updateQuantity = (itemId, delta) => {
    setCart(
      cart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showSnackbar('Your cart is empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: customerName.trim() || undefined,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const order = await orderAPI.createOrder(orderData);
      showSnackbar(`Order #${order.orderNumber} placed successfully!`, 'success');
      setCart([]);
      setCustomerName('');
      setDrawerOpen(false);

      // Navigate to order tracking page
      setTimeout(() => {
        navigate(`/track/${order.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to place order:', error);
      showSnackbar('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <LocalCafe sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Digital Cafe
          </Typography>
          <Button color="inherit" onClick={() => navigate('/admin/login')}>
            Admin Login
          </Button>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <Badge badgeContent={getTotalItems()} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Digital Cafe
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Order your favorite items and track your order in real-time
          </Typography>
        </Box>

        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <RestaurantMenu sx={{ mr: 1 }} />
              {category}
            </Typography>
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl}
                        alt={item.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.description}
                        </Typography>
                      )}
                      <Chip
                        label={`₹${item.price.toFixed(2)}`}
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => addToCart(item)}
                        disabled={!item.available}
                      >
                        {item.available ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Cart
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {cart.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Your cart is empty
            </Typography>
          ) : (
            <>
              <List>
                {cart.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <IconButton size="small" onClick={() => removeFromCart(item.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                          <Remove />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                          <Add />
                        </IconButton>
                      </Box>
                      <Typography fontWeight="bold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <TextField
                label="Your Name (Optional)"
                fullWidth
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ₹{getTotalPrice().toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

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

export default CustomerView;
