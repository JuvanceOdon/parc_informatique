import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../api/services';
import { PageHeader } from '../components/PageHeader';
import { TICKET_PRIORITE_LABELS, TICKET_STATUT_LABELS } from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import type { TicketDetail } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

interface TicketRow {
  id: number;
  numeroTicket: string;
  titre: string;
  statut: string;
  priorite: string;
  createdAt: string;
  demandeur?: { nom: string; prenom: string };
}

export const TicketsPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) => ticketsApi.list(params) as Promise<{ data: TicketRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<TicketRow>(fetcher);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ titre: '', description: '', priorite: 'MOYENNE' });
  const [editTicket, setEditTicket] = useState<TicketDetail | null>(null);
  const [editForm, setEditForm] = useState({ titre: '', description: '', priorite: 'MOYENNE' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = async (id: number) => {
    setSaving(true);
    setFormError(null);
    try {
      const ticket = await ticketsApi.get(id);
      setEditTicket(ticket);
      setEditForm({ titre: ticket.titre, description: ticket.description, priorite: ticket.priorite });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef<TicketRow>[] = [
    { field: 'numeroTicket', headerName: 'N°', width: 120 },
    { field: 'titre', headerName: 'Titre', flex: 1.5, minWidth: 180 },
    {
      field: 'statut',
      headerName: 'Statut',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => TICKET_STATUT_LABELS[row.statut] ?? row.statut,
    },
    {
      field: 'priorite',
      headerName: 'Priorité',
      width: 110,
      valueGetter: (_, row) => TICKET_PRIORITE_LABELS[row.priorite] ?? row.priorite,
    },
    {
      field: 'demandeur',
      headerName: 'Demandeur',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.demandeur ? `${row.demandeur.prenom} ${row.demandeur.nom}` : '—',
    },
    {
      field: 'createdAt',
      headerName: 'Créé le',
      width: 120,
      valueGetter: (_, row) => new Date(row.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Voir"
          onClick={() => navigate(`/tickets/${params.id}`)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Modifier"
          onClick={() => void openEdit(Number(params.id))}
        />,
      ],
    },
  ];

  const handleCreate = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await ticketsApi.create(createForm);
      setCreateOpen(false);
      setCreateForm({ titre: '', description: '', priorite: 'MOYENNE' });
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTicket) return;
    setSaving(true);
    setFormError(null);
    try {
      await ticketsApi.update(editTicket.id, {
        titre: editForm.titre,
        description: editForm.description,
      });
      if (isStaff && editForm.priorite !== editTicket.priorite) {
        await ticketsApi.changePriorite(editTicket.id, { priorite: editForm.priorite });
      }
      setEditTicket(null);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Tickets"
        subtitle="Demandes d'intervention technique"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Nouveau ticket
          </Button>
        }
      />

      {(error || formError) && <Alert severity="error" className="mb-4">{error ?? formError}</Alert>}

      <Card>
        <Box className="p-4">
          <TextField
            size="small"
            label="Rechercher"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="mb-4 w-full max-w-sm"
          />
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            paginationMode="server"
            rowCount={meta.total}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
            onRowDoubleClick={(params) => navigate(`/tickets/${params.id}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau ticket</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Titre" value={createForm.titre} onChange={(e) => setCreateForm({ ...createForm, titre: e.target.value })} required />
          <TextField label="Description" multiline rows={4} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
          <TextField select label="Priorité" value={createForm.priorite} onChange={(e) => setCreateForm({ ...createForm, priorite: e.target.value })}>
            {Object.entries(TICKET_PRIORITE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={saving}>Créer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editTicket !== null} onClose={() => setEditTicket(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le ticket</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Titre" value={editForm.titre} onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })} required />
          <TextField label="Description" multiline rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
          {isStaff && (
            <TextField select label="Priorité" value={editForm.priorite} onChange={(e) => setEditForm({ ...editForm, priorite: e.target.value })}>
              {Object.entries(TICKET_PRIORITE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTicket(null)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleEdit()} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
