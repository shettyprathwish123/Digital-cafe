import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access the order management dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button onClick={() => navigate('/')} color="secondary">
              Back to Customer View
            </Button>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Default credentials:
            </Typography>
            <Typography variant="caption" display="block">
              Username: admin
            </Typography>
            <Typography variant="caption" display="block">
              Password: admin123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
