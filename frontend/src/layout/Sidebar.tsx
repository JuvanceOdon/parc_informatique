import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import DevicesIcon from '@mui/icons-material/Devices';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { brand } from '../theme/theme';
import type { RoleCode } from '../types';

const DRAWER_WIDTH = 280;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: RoleCode[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', path: '/', icon: <DashboardIcon /> },
  { label: 'Matériels', path: '/materiels', icon: <DevicesIcon /> },
  { label: 'Affectations', path: '/affectations', icon: <SwapHorizIcon /> },
  { label: 'Tickets', path: '/tickets', icon: <ConfirmationNumberIcon /> },
  { label: 'Maintenances', path: '/maintenances', icon: <BuildIcon /> },
  { label: 'Catégories', path: '/categories', icon: <CategoryIcon /> },
  {
    label: 'Services',
    path: '/services',
    icon: <BusinessIcon />,
    roles: ['ADMIN', 'CHEF_SERVICE'],
  },
  { label: 'Utilisateurs', path: '/utilisateurs', icon: <PeopleIcon />, roles: ['ADMIN'] },
  {
    label: 'Rapports',
    path: '/rapports',
    icon: <AssessmentIcon />,
    roles: ['ADMIN', 'CHEF_SERVICE', 'TECHNICIEN'],
  },
  { label: "Journal d'audit", path: '/journal-audit', icon: <HistoryIcon />, roles: ['ADMIN'] },
];

export const Sidebar = () => {
  const { hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => hasRole(role)),
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
          bgcolor: brand.navy,
          color: '#eaf1ff',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(173,199,247,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SecurityIcon sx={{ color: '#adc7f7', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: '#fff' }}>
            Parc Informatique MFA
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'rgba(234,241,255,0.65)',
              textTransform: 'uppercase',
              mt: 0.25,
            }}
          >
            Ministère des Forces Armées
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              borderRadius: 3,
              mb: 0.75,
              color: 'rgba(234,241,255,0.78)',
              position: 'relative',
              '& .MuiListItemIcon-root': { color: 'rgba(234,241,255,0.7)' },
              '&:hover': {
                bgcolor: 'rgba(173,199,247,0.1)',
              },
              '&.active': {
                bgcolor: brand.sidebarActive,
                color: '#fff',
                '& .MuiListItemIcon-root': { color: brand.gold },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: '0 4px 4px 0',
                  bgcolor: brand.gold,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 1.5 }} />
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={() => void handleLogout()}
          sx={{
            justifyContent: 'flex-start',
            color: 'rgba(234,241,255,0.78)',
            px: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Drawer>
  );
};

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
