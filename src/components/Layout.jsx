import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { Logout, Dashboard, Checklist, TaskAlt } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const link = { color: 'inherit', '&.active': { bgcolor: 'rgba(255,255,255,.18)' } };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <TaskAlt sx={{ mr: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 3 }}>TaskBoard</Typography>
          <Button component={NavLink} to="/" end startIcon={<Dashboard />} sx={link}>Dashboard</Button>
          <Button component={NavLink} to="/todos" startIcon={<Checklist />} sx={link}>Todos</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar onClick={(e) => setAnchor(e.currentTarget)} sx={{ cursor: 'pointer', bgcolor: 'secondary.main' }}>
            {user.fullName[0].toUpperCase()}
          </Avatar>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={600}>{user.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={async () => { setAnchor(null); await logout(); navigate('/login'); }}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}><Outlet /></Container>
    </Box>
  );
}
