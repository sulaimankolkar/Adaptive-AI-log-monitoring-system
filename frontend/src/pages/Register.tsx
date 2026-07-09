import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, Alert, Chip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sign up to start monitoring data drift
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            TEST CREDENTIALS (Click to copy):
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Email: admin@example.com" 
              onClick={() => { setEmail('admin@example.com'); navigator.clipboard.writeText('admin@example.com'); }}
              clickable
              icon={<ContentCopy fontSize="small" />}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
            <Chip 
              label="Password: adminpassword" 
              onClick={() => { setPassword('adminpassword'); navigator.clipboard.writeText('adminpassword'); }}
              clickable
              icon={<ContentCopy fontSize="small" />}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
            <Chip 
              label="Name: System Admin" 
              onClick={() => { setFullName('System Admin'); navigator.clipboard.writeText('System Admin'); }}
              clickable
              icon={<ContentCopy fontSize="small" />}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link onClick={() => navigate('/login')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
export default Register;
