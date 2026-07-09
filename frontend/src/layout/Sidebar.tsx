import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
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
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleCode } from '../types';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: RoleCode[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', path: '/', icon: <DashboardIcon /> },
  { label: 'Utilisateurs', path: '/utilisateurs', icon: <PeopleIcon />, roles: ['ADMIN'] },
  {
    label: 'Services',
    path: '/services',
    icon: <BusinessIcon />,
    roles: ['ADMIN', 'CHEF_SERVICE'],
  },
  { label: 'Catégories', path: '/categories', icon: <CategoryIcon /> },
  { label: 'Matériels', path: '/materiels', icon: <DevicesIcon /> },
  { label: 'Affectations', path: '/affectations', icon: <SwapHorizIcon /> },
  { label: 'Tickets', path: '/tickets', icon: <ConfirmationNumberIcon /> },
  { label: 'Maintenances', path: '/maintenances', icon: <BuildIcon /> },
  {
    label: 'Rapports',
    path: '/rapports',
    icon: <AssessmentIcon />,
    roles: ['ADMIN', 'CHEF_SERVICE', 'TECHNICIEN'],
  },
  { label: 'Journal d\'audit', path: '/journal-audit', icon: <HistoryIcon />, roles: ['ADMIN'] },
  { label: 'Paramètres', path: '/parametres', icon: <SettingsIcon /> },
];

export const Sidebar = () => {
  const { user, hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => hasRole(role)),
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid #e2e8f0',
        },
      }}
    >
      <Toolbar>
        <Box>
          <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 700 }}>
            MFA
          </Typography>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
            Parc Informatique
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: 14 } } }}
            />
          </ListItemButton>
        ))}
      </List>
      {user && (
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Connecté en tant que
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user.prenom} {user.nom}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.role.libelle}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
