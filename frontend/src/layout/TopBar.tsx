import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationsApi } from '../api/services';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [items, setItems] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    try {
      const [countResult, listResult] = await Promise.all([
        notificationsApi.unreadCount(),
        notificationsApi.list({ limit: 8 }),
      ]);
      setUnread(countResult.count);
      setItems(listResult.data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user) return;

    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAll = async () => {
    await notificationsApi.markAllAsRead();
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Système de Gestion du Parc Informatique
        </Typography>
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          slotProps={{ paper: { sx: { width: 360, maxHeight: 420 } } }}
        >
          <Box className="flex items-center justify-between px-4 py-2">
            <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
            {unread > 0 && (
              <Typography
                variant="caption"
                color="primary"
                className="cursor-pointer"
                onClick={() => void handleMarkAll()}
              >
                Tout marquer lu
              </Typography>
            )}
          </Box>
          <Divider />
          {items.length === 0 ? (
            <MenuItem disabled>Aucune notification</MenuItem>
          ) : (
            items.map((n) => (
              <MenuItem
                key={n.id}
                onClick={async () => {
                  if (!n.lu) {
                    await notificationsApi.markAsRead(n.id);
                    setUnread((c) => Math.max(0, c - 1));
                  }
                }}
                sx={{ opacity: n.lu ? 0.7 : 1, alignItems: 'flex-start', py: 1.5 }}
              >
                <ListItemText
                  primary={n.titre}
                  secondary={
                    <>
                      {n.message}
                      <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                      </Typography>
                    </>
                  }
                  slotProps={{
                    primary: { sx: { fontWeight: n.lu ? 400 : 700, fontSize: 14 } },
                    secondary: { sx: { fontSize: 12 } },
                  }}
                />
              </MenuItem>
            ))
          )}
        </Menu>
        <Box className="ml-4 hidden items-center gap-2 sm:flex">
          <Typography variant="body2">
            {user?.prenom} {user?.nom}
          </Typography>
          <IconButton color="inherit" onClick={() => void handleLogout()} title="Déconnexion">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
