import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errors';

export const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
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
    <Box className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f2440] to-[#1a365d] p-4">
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent className="p-8">
          <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 700 }}>
            Ministère des Forces Armées
          </Typography>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }} className="mb-1">
            Parc Informatique
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mb-6">
            Connectez-vous pour accéder au système
          </Typography>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <TextField
              label="Matricule ou email"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
              {submitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
