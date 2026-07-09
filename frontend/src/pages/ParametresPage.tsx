import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../constants/labels';

export const ParametresPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Box>
      <PageHeader title="Paramètres" subtitle="Informations de votre compte" />

      <Card sx={{ maxWidth: 560 }}>
        <CardContent className="flex flex-col gap-3">
          <InfoRow label="Matricule" value={user.matricule} />
          <InfoRow label="Nom complet" value={`${user.prenom} ${user.nom}`} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Téléphone" value={user.telephone ?? '—'} />
          <InfoRow label="Rôle" value={ROLE_LABELS[user.role.code] ?? user.role.libelle} />
          <InfoRow
            label="Dernière connexion"
            value={user.derniereConnexion ? new Date(user.derniereConnexion).toLocaleString('fr-FR') : '—'}
          />
          <Divider className="my-2" />
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => void handleLogout()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);
