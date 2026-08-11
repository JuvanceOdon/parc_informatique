import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Popover,
  Switch,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { ROLE_LABELS } from '../constants/labels';
import { brand } from '../theme/theme';

interface ProfilePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const ProfilePopover = ({ anchorEl, open, onClose }: ProfilePopoverProps) => {
  const { user, logout } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const roleLabel = ROLE_LABELS[user.role.code] ?? user.role.libelle;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 1.5,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 2,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            boxShadow: (t) =>
              t.palette.mode === 'light'
                ? '0 20px 50px rgba(26, 54, 93, 0.16)'
                : '0 20px 50px rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          px: 2.5,
          pt: 2.5,
          pb: 5,
          background: `linear-gradient(145deg, ${brand.navy} 0%, ${brand.navyMid} 55%, #2a4a7a 100%)`,
          color: '#eaf1ff',
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Fermer"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'rgba(234,241,255,0.7)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: brand.gold,
            mb: 1.5,
          }}
        >
          MON PROFIL
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: 22,
              fontWeight: 800,
              bgcolor: brand.gold,
              color: brand.navy,
              border: '3px solid rgba(255,255,255,0.25)',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {user.prenom} {user.nom}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: 'rgba(234,241,255,0.7)' }}>
              {user.matricule}
            </Typography>
            <Chip
              size="small"
              label={roleLabel}
              sx={{
                mt: 1,
                height: 24,
                fontWeight: 700,
                fontSize: 11,
                bgcolor: 'rgba(201,162,39,0.2)',
                color: brand.gold,
                border: '1px solid rgba(201,162,39,0.35)',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            mb: 2,
          }}
        >
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Téléphone" value={user.telephone ?? '—'} />
          <InfoRow
            label="Dernière connexion"
            value={
              user.derniereConnexion
                ? new Date(user.derniereConnexion).toLocaleString('fr-FR')
                : '—'
            }
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            mb: 2,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === 'light' ? 'rgba(26,54,93,0.04)' : 'rgba(255,255,255,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {isDark ? (
              <DarkModeOutlinedIcon fontSize="small" color="action" />
            ) : (
              <LightModeOutlinedIcon fontSize="small" color="action" />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Mode sombre
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={isDark} onChange={toggleMode} color="secondary" size="small" />}
            label=""
            sx={{ m: 0, mr: -0.5 }}
          />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => void handleLogout()}
          sx={{
            borderRadius: 1.5,
            py: 1.1,
            fontWeight: 700,
          }}
        >
          Se déconnecter
        </Button>
      </Box>
    </Popover>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 2,
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        textAlign: 'right',
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);
