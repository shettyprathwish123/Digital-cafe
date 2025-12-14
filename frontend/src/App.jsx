import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CustomerView from './pages/CustomerView';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [mode, setMode] = useState('light');
  useEffect(() => {
    try {
      const m = localStorage.getItem('dcafe_mode');
      if (m) setMode(m);
    } catch {}
  }, []);
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#6B4423' },
      secondary: { main: '#D4AF37' },
      background: mode === 'light' ? { default: '#F5F5DC' } : {},
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
    },
  }), [mode]);
  const toggleTheme = () => {
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('dcafe_mode', next); } catch {}
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<CustomerView mode={mode} toggleTheme={toggleTheme} />} />
            <Route path="/track/:orderId" element={<OrderTracking mode={mode} toggleTheme={toggleTheme} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard mode={mode} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
