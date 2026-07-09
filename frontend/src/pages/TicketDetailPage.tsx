import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ticketsApi } from '../api/services';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { PageHeader } from '../components/PageHeader';
import { PageLoader } from '../components/PageLoader';
import {
  TICKET_HISTORIQUE_LABELS,
  TICKET_PRIORITE_LABELS,
  TICKET_STATUT_LABELS,
} from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import type { TicketDetail, TicketHistoriqueEntry } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

export const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isStaff } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [historique, setHistorique] = useState<TicketHistoriqueEntry[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [newStatut, setNewStatut] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ titre: '', description: '', priorite: '' });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, hist] = await Promise.all([
        ticketsApi.get(Number(id)),
        ticketsApi.getHistorique(Number(id)),
      ]);
      setTicket(detail);
      setHistorique(hist);
      setNewStatut(detail.statut);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleComment = async () => {
    if (!ticket || !comment.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await ticketsApi.addCommentaire(ticket.id, comment.trim());
      setComment('');
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatutChange = async () => {
    if (!ticket || newStatut === ticket.statut) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await ticketsApi.changeStatut(ticket.id, { statut: newStatut });
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = () => {
    if (!ticket) return;
    setEditForm({ titre: ticket.titre, description: ticket.description, priorite: ticket.priorite });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!ticket) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await ticketsApi.update(ticket.id, {
        titre: editForm.titre,
        description: editForm.description,
      });
      if (isStaff && editForm.priorite !== ticket.priorite) {
        await ticketsApi.changePriorite(ticket.id, { priorite: editForm.priorite });
      }
      setEditOpen(false);
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !ticket) return <Alert severity="error">{error ?? 'Ticket introuvable'}</Alert>;

  return (
    <Box>
      <Button component={Link} to="/tickets" startIcon={<ArrowBackIcon />} className="mb-4">
        Retour à la liste
      </Button>

      <PageHeader
        title={`${ticket.numeroTicket} — ${ticket.titre}`}
        subtitle={`Demandeur : ${ticket.demandeur.prenom} ${ticket.demandeur.nom}`}
        action={
          <Button variant="contained" startIcon={<EditIcon />} onClick={openEdit}>
            Modifier
          </Button>
        }
      />

      {actionError && <Alert severity="error" className="mb-4">{actionError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-4">
                <Tab label="Détails" />
                <Tab label={`Commentaires (${ticket.commentaires.length})`} />
                <Tab label={`Historique (${historique.length})`} />
              </Tabs>

              {tab === 0 && (
                <Typography variant="body1" className="whitespace-pre-wrap">
                  {ticket.description}
                </Typography>
              )}

              {tab === 1 && (
                <Box className="flex flex-col gap-4">
                  {ticket.commentaires.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Aucun commentaire.</Typography>
                  ) : (
                    ticket.commentaires.map((c) => (
                      <Box key={c.id}>
                        <Typography variant="subtitle2">
                          {c.utilisateur.prenom} {c.utilisateur.nom}
                        </Typography>
                        <Typography variant="body2">{c.contenu}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(c.createdAt).toLocaleString('fr-FR')}
                        </Typography>
                        <Divider className="mt-3" />
                      </Box>
                    ))
                  )}
                  <Box className="flex gap-2">
                    <TextField
                      label="Ajouter un commentaire"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => void handleComment()}
                      disabled={submitting || !comment.trim()}
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      Envoyer
                    </Button>
                  </Box>
                </Box>
              )}

              {tab === 2 && (
                <HistoryTimeline entries={historique} actionLabels={TICKET_HISTORIQUE_LABELS} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="mb-3">
            <CardContent className="flex flex-col gap-2">
              <Chip label={TICKET_STATUT_LABELS[ticket.statut] ?? ticket.statut} color="primary" />
              <Chip label={TICKET_PRIORITE_LABELS[ticket.priorite] ?? ticket.priorite} variant="outlined" />
              {ticket.materiel && (
                <Typography variant="body2">
                  Matériel :{' '}
                  <Link to={`/materiels/${ticket.materiel.id}`} className="text-[#1a365d] underline">
                    {ticket.materiel.codeMateriel}
                  </Link>
                </Typography>
              )}
              {ticket.assignee && (
                <Typography variant="body2">
                  Assigné à : {ticket.assignee.prenom} {ticket.assignee.nom}
                </Typography>
              )}
              {ticket.service && (
                <Typography variant="body2">Service : {ticket.service.libelle}</Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Créé le {new Date(ticket.createdAt).toLocaleString('fr-FR')}
              </Typography>
            </CardContent>
          </Card>

          {isStaff && (
            <Card>
              <CardContent className="flex flex-col gap-3">
                <Typography variant="h6" color="primary.dark">Actions staff</Typography>
                <TextField
                  select
                  label="Changer le statut"
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value)}
                  fullWidth
                >
                  {Object.entries(TICKET_STATUT_LABELS).map(([v, l]) => (
                    <MenuItem key={v} value={v}>{l}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  onClick={() => void handleStatutChange()}
                  disabled={submitting || newStatut === ticket.statut}
                >
                  Appliquer le statut
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le ticket</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Titre" value={editForm.titre} onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })} required fullWidth />
          <TextField label="Description" multiline rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required fullWidth />
          {isStaff && (
            <TextField select label="Priorité" value={editForm.priorite} onChange={(e) => setEditForm({ ...editForm, priorite: e.target.value })} fullWidth>
              {Object.entries(TICKET_PRIORITE_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleEdit()} disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
