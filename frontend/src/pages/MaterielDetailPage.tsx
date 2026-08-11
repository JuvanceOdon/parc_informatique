import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { materielsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { MaterielFormDialog } from '../components/forms/MaterielFormDialog';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/PageLoader';
import {
  MATERIEL_ETAT_LABELS,
  MATERIEL_HISTORIQUE_LABELS,
  MATERIEL_STATUT_LABELS,
} from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import type { Materiel, MaterielHistoriqueEntry } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

export const MaterielDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const [materiel, setMateriel] = useState<Materiel | null>(null);
  const [historique, setHistorique] = useState<MaterielHistoriqueEntry[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, hist] = await Promise.all([
        materielsApi.getById(Number(id)),
        materielsApi.getHistorique(Number(id)),
      ]);
      setMateriel(detail);
      setHistorique(hist);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleDeactivate = async () => {
    if (!materiel) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await materielsApi.deactivate(materiel.id);
      navigate('/materiels');
    } catch (err) {
      setActionError(getErrorMessage(err));
      setDeactivateOpen(false);
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !materiel) return <Alert severity="error">{error ?? 'Matériel introuvable'}</Alert>;

  return (
    <Box>
      <Button component={Link} to="/materiels" startIcon={<ArrowBackIcon />} className="mb-4">
        Retour à la liste
      </Button>

      <PageHeader
        title={`${materiel.codeMateriel} — ${materiel.designation}`}
        subtitle={`Catégorie : ${materiel.categorie.libelle}`}
        action={
          isStaff ? (
            <Box className="flex gap-2">
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Modifier
              </Button>
              {materiel.actif && (
                <Button variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={() => setDeactivateOpen(true)}>
                  Désactiver
                </Button>
              )}
            </Box>
          ) : undefined
        }
      />

      {actionError && <Alert severity="error" className="mb-4">{actionError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-4">
                <Tab label="Informations" />
                <Tab label={`Historique (${historique.length})`} />
              </Tabs>

              {tab === 0 && (
                <Grid container spacing={2}>
                  <InfoItem label="Code" value={materiel.codeMateriel} />
                  <InfoItem label="N° série" value={materiel.numeroSerie ?? '—'} />
                  <InfoItem label="Marque / Modèle" value={`${materiel.marque ?? '—'} / ${materiel.modele ?? '—'}`} />
                  <InfoItem label="Statut" value={MATERIEL_STATUT_LABELS[materiel.statut] ?? materiel.statut} />
                  <InfoItem label="État" value={MATERIEL_ETAT_LABELS[materiel.etat] ?? materiel.etat} />
                  <InfoItem label="Service" value={materiel.service?.libelle ?? '—'} />
                  <InfoItem label="Localisation" value={materiel.localisation ?? '—'} />
                  <InfoItem
                    label="Acquisition"
                    value={materiel.dateAcquisition ? new Date(materiel.dateAcquisition).toLocaleDateString('fr-FR') : '—'}
                  />
                  <InfoItem
                    label="Fin garantie"
                    value={materiel.dateFinGarantie ? new Date(materiel.dateFinGarantie).toLocaleDateString('fr-FR') : '—'}
                  />
                  <Grid size={{ xs: 12 }}>
                    <InfoItem label="Description" value={materiel.description ?? '—'} />
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <HistoryTimeline entries={historique} actionLabels={MATERIEL_HISTORIQUE_LABELS} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Typography variant="h6" color="text.primary">Statut</Typography>
              <Chip label={MATERIEL_STATUT_LABELS[materiel.statut] ?? materiel.statut} color="primary" />
              {materiel.garantieExpiree && <Chip label="Garantie expirée" color="error" size="small" />}
              {materiel.garantieExpireBientot && !materiel.garantieExpiree && (
                <Chip label="Garantie expire bientôt" color="warning" size="small" />
              )}
              {!materiel.actif && <Chip label="Inactif" color="default" size="small" />}
              <Typography variant="caption" color="text.secondary" className="mt-2">
                Créé le {new Date(materiel.createdAt).toLocaleString('fr-FR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <MaterielFormDialog
        open={editOpen}
        materiel={materiel}
        onClose={() => setEditOpen(false)}
        onSaved={() => void load()}
      />

      <ConfirmDialog
        open={deactivateOpen}
        title="Désactiver le matériel"
        message={`Confirmer la désactivation de « ${materiel.codeMateriel} » ?`}
        confirmLabel="Désactiver"
        confirmColor="warning"
        loading={deactivating}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => void handleDeactivate()}
      />
    </Box>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1">{value}</Typography>
  </Grid>
);
