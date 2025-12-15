import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import { LocalCafe, Home, CheckCircle, Brightness4, Brightness7 } from '@mui/icons-material';
import { orderAPI } from '../services/apiService';

const OrderTracking = ({ mode, toggleTheme }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [queueInfo, setQueueInfo] = useState({ position: null, queueLength: 0, etaMinutes: null });
  const [prevStatus, setPrevStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
    // Commenting out EventSource temporarily as it's causing blank page issues
    // The page will now use polling (setInterval) for updates instead of real-time SSE
    /*
    let es;
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      try {
        es = new EventSource(`${window.location.origin}/api/orders/${orderId}/stream`);
        es.addEventListener('order-update', (ev) => {
          try {
            const data = JSON.parse(ev.data);
            setOrder(data);
          } catch { }
        });
        es.addEventListener('order-delete', () => setError('Order not found'));
        es.addEventListener('error', () => {
          try { es.close(); } catch { }
          setTimeout(connect, 2000);
        });
      } catch { }
    };
    connect();
    */
    const interval = setInterval(loadOrder, 10000);
    return () => {
      clearInterval(interval);
      // stopped = true;
      // es && es.close();
    };
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      const fetchedOrder = await orderAPI.getOrder(orderId);
      setOrder(fetchedOrder);
      setPrevStatus((s) => {
        if (s && s !== 'READY' && fetchedOrder.status === 'READY') {
          launchConfetti();
        }
        return fetchedOrder.status;
      });
      try {
        const qi = await orderAPI.getQueuePosition(orderId);
        setQueueInfo(qi);
      } catch { }
      setError('');
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getActiveStep = (status) => {
    switch (status) {
      case 'NEW':
        return 0;
      case 'PREPARING':
        return 1;
      case 'READY':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 0;
    }
  };

  const steps = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Completed'];

  const launchConfetti = () => {
    const count = 100;
    const end = Date.now() + 800;
    const colors = ['#bb0000', '#eeee00', '#00bb00', '#0077ff', '#ff8800'];
    function frame() {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.borderRadius = '2px';
      el.style.zIndex = 9999;
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      const duration = 2000 + Math.random() * 1000;
      const translateX = (Math.random() - 0.5) * 200;
      el.animate([
        { transform: el.style.transform, top: '-10px' },
        { transform: el.style.transform, top: '100vh', offset: 1 }
      ], { duration, easing: 'ease-out' }).onfinish = () => el.remove();
      if (Date.now() < end) setTimeout(frame, count / 20);
    }
    frame();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          <Alert severity="error">{error || 'Order not found'}</Alert>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <LocalCafe sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Digital Cafe - Order Tracking
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} title="Toggle theme">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button color="inherit" onClick={() => navigate('/')} startIcon={<Home />}>
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Order #{order.orderNumber}
            </Typography>
            <Chip
              label={order.status}
              color={
                order.status === 'READY'
                  ? 'success'
                  : order.status === 'PREPARING'
                    ? 'warning'
                    : 'default'
              }
              icon={order.status === 'READY' ? <CheckCircle /> : undefined}
              sx={{ fontSize: '1rem', py: 2, px: 1 }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {queueInfo.position !== null && (
              <Typography variant="body1" color="text.secondary">
                Position in queue: {queueInfo.position + 1} / {queueInfo.queueLength} • ETA ~ {queueInfo.etaMinutes} min
              </Typography>
            )}
          </Box>

          {order.status === 'READY' && (
            <Alert severity="success" sx={{ mb: 3 }}>
              🎉 Your order is ready for pickup!
            </Alert>
          )}

          <Stepper activeStep={getActiveStep(order.status)} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            {order.customerName && (
              <Typography variant="body1" gutterBottom>
                <strong>Customer:</strong> {order.customerName}
              </Typography>
            )}
            <Typography variant="body1" gutterBottom>
              <strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              <strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Order Items:
          </Typography>
          <List>
            {order.items.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6">{item.menuItem.name}</Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {item.menuItem.description}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)} = ₹
                        {(item.quantity * item.price).toFixed(2)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              This page automatically refreshes every 5 seconds
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default OrderTracking;
