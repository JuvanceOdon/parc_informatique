import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BadgeIcon from '@mui/icons-material/Badge';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { brand } from '../theme/theme';
import { getErrorMessage } from '../utils/errors';

/**
 * Login style inspiré des écrans « modal sign-in » (carte flottante sur fond atmosphérique).
 * Réf. : https://dribbble.com/shots/26137348-Sign-up-sing-in-login-registration-modal-screen
 */
export const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(identifiant, motDePasse);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Identifiants invalides'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2.5, sm: 4 },
        background: isDark
          ? `radial-gradient(ellipse at 20% 20%, ${brand.navyMid} 0%, transparent 50%),
             radial-gradient(ellipse at 80% 10%, rgba(201,162,39,0.18) 0%, transparent 42%),
             linear-gradient(160deg, #071018 0%, ${brand.navy} 55%, #0d1a2c 100%)`
          : `radial-gradient(ellipse at 15% 15%, rgba(26,54,93,0.14) 0%, transparent 48%),
             radial-gradient(ellipse at 85% 20%, rgba(201,162,39,0.18) 0%, transparent 45%),
             radial-gradient(ellipse at 50% 100%, rgba(59,96,144,0.12) 0%, transparent 50%),
             linear-gradient(165deg, #e8eef7 0%, #f4f6fb 45%, #e6ecf5 100%)`,
      }}
    >
      {/* Formes atmosphériques (décor modal screen) */}
      <Box
        className="login-orb"
        sx={{
          position: 'absolute',
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          borderRadius: '50%',
          top: { xs: '-8%', md: '-6%' },
          left: { xs: '-10%', md: '8%' },
          background: isDark ? 'rgba(173,199,247,0.08)' : 'rgba(26,54,93,0.08)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        className="login-orb-delay"
        sx={{
          position: 'absolute',
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          borderRadius: '42% 58% 55% 45% / 48% 42% 58% 52%',
          bottom: { xs: '-6%', md: '6%' },
          right: { xs: '-8%', md: '10%' },
          background: isDark ? 'rgba(201,162,39,0.12)' : 'rgba(201,162,39,0.16)',
          pointerEvents: 'none',
        }}
      />
      <Box
        className="login-glow"
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          top: '40%',
          left: '55%',
          transform: 'translate(-50%, -50%)',
          background: isDark
            ? 'radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <IconButton
        onClick={toggleMode}
        aria-label="Basculer le thème"
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(8px)',
          border: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26,54,93,0.08)',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)',
          },
        }}
      >
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>

      {/* Modal flottant */}
      <Box
        className="login-form-enter"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,54,93,0.08)',
          boxShadow: isDark
            ? '0 28px 64px rgba(0,0,0,0.55)'
            : '0 28px 64px rgba(26,54,93,0.14), 0 8px 20px rgba(26,54,93,0.06)',
        }}
      >
        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            pt: { xs: 3.5, sm: 4 },
            pb: 2.5,
            textAlign: 'center',
            background: isDark
              ? `linear-gradient(180deg, rgba(173,199,247,0.06) 0%, transparent 100%)`
              : `linear-gradient(180deg, rgba(26,54,93,0.04) 0%, transparent 100%)`,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(145deg, ${brand.navy} 0%, ${brand.navyMid} 100%)`,
              boxShadow: `0 10px 24px ${brand.navy}44`,
            }}
          >
            <SecurityIcon sx={{ color: brand.gold, fontSize: 30 }} />
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: '0.14em',
              fontSize: 11,
              color: 'secondary.main',
              mb: 1,
            }}
          >
            MINISTÈRE DES FORCES ARMÉES
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.55rem', sm: '1.75rem' },
            }}
          >
            Connexion
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Accédez au parc informatique avec votre matricule.
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => void handleSubmit(e)}
          sx={{
            px: { xs: 3, sm: 4 },
            pb: { xs: 3.5, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25,
            '& .MuiOutlinedInput-root': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(26,54,93,0.03)',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(26,54,93,0.05)',
              },
              '&.Mui-focused': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(173,199,247,0.12)' : 'rgba(26,54,93,0.08)',
                boxShadow: (t) =>
                  t.palette.mode === 'dark'
                    ? '0 0 0 3px rgba(173,199,247,0.18)'
                    : '0 0 0 3px rgba(26,54,93,0.1)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 1.5,
              },
            },
            /* Fond plus marqué dès qu’il y a du texte (saisie ou autofill navigateur) */
            '& .MuiOutlinedInput-root:has(input:not(:placeholder-shown))': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'rgba(173,199,247,0.1)' : 'rgba(26,54,93,0.07)',
            },
            '& .MuiOutlinedInput-input': {
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                WebkitBoxShadow: (t) =>
                  t.palette.mode === 'dark'
                    ? '0 0 0 100px #1a2740 inset'
                    : '0 0 0 100px #e8eef6 inset',
                WebkitTextFillColor: (t) => t.palette.text.primary,
                caretColor: (t) => t.palette.text.primary,
                transition: 'background-color 99999s ease-out 0s',
              },
            },
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Identifiant / Matricule"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            required
            fullWidth
            autoFocus
            placeholder=" "
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: (t) =>
                  identifiant
                    ? t.palette.mode === 'dark'
                      ? 'rgba(173,199,247,0.12)'
                      : 'rgba(26,54,93,0.09)'
                    : undefined,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="disabled" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            fullWidth
            placeholder=" "
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: (t) =>
                  motDePasse
                    ? t.palette.mode === 'dark'
                      ? 'rgba(173,199,247,0.12)'
                      : 'rgba(26,54,93,0.09)'
                    : undefined,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="disabled" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={submitting}
            fullWidth
            endIcon={<LoginIcon />}
            sx={{
              mt: 0.5,
              py: 1.35,
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: `0 8px 20px ${brand.gold}55`,
              '&:hover': {
                boxShadow: `0 10px 24px ${brand.gold}66`,
              },
            }}
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
          >
            Système de gestion du parc informatique — MFA
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
