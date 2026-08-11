import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { ProfilePopover } from '../components/ProfilePopover';
import { notificationsApi } from '../api/services';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TopBar = () => {
  const { user } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const [unread, setUnread] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [items, setItems] = useState<Notification[]>([]);

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: (t) => (t.palette.mode === 'light' ? 'rgba(255,255,255,0.72)' : 'background.paper'),
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 68 }, gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: 14, sm: 16 },
            letterSpacing: '-0.02em',
          }}
        >
          Système de Gestion du Parc Informatique
        </Typography>

        <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'}>
          <IconButton onClick={toggleMode} color="inherit" aria-label="Basculer le thème">
            {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} color="inherit" aria-label="Notifications">
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          slotProps={{ paper: { sx: { width: 360, maxHeight: 420, borderRadius: 3 } } }}
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

        {user && (
          <>
            <ButtonBase
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              aria-label="Ouvrir mon profil"
              aria-expanded={Boolean(profileAnchor)}
              sx={{
                ml: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 999,
                pl: 0.5,
                pr: { xs: 0.75, sm: 1.5 },
                py: 0.5,
                border: 1,
                borderColor: profileAnchor ? 'primary.main' : 'transparent',
                bgcolor: profileAnchor ? 'action.selected' : 'transparent',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user.prenom} {user.nom}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                  {user.role.libelle}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 18,
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' },
                  transform: profileAnchor ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </ButtonBase>

            <ProfilePopover
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
