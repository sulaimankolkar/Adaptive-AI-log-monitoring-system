import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={3}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Adaptive AI Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sign in to access the drift monitoring dashboard
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box textAlign="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link onClick={() => navigate('/register')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
export default Login;
