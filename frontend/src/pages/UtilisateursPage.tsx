import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import { utilisateursApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ListPanel } from '../components/ListPanel';
import { PageHeader } from '../components/PageHeader';
import { ROLE_LABELS } from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { getErrorMessage } from '../utils/errors';

interface UtilisateurRow {
  id: number;
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: { id: number; code: string; libelle: string };
  actif: boolean;
}

const emptyForm = {
  matricule: '',
  email: '',
  nom: '',
  prenom: '',
  motDePasse: '',
  roleId: 4,
  telephone: '',
};

const ROLE_OPTIONS = [
  { id: 1, label: ROLE_LABELS.ADMIN },
  { id: 2, label: ROLE_LABELS.CHEF_SERVICE },
  { id: 3, label: ROLE_LABELS.TECHNICIEN },
  { id: 4, label: ROLE_LABELS.UTILISATEUR },
];

export const UtilisateursPage = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN');
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) => utilisateursApi.list(params) as Promise<{ data: UtilisateurRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<UtilisateurRow>(fetcher);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<UtilisateurRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<UtilisateurRow | null>(null);
  const [toggling, setToggling] = useState(false);

  const openCreate = () => {
    setEditRow(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: UtilisateurRow) => {
    setEditRow(row);
    setForm({
      matricule: row.matricule,
      email: row.email,
      nom: row.nom,
      prenom: row.prenom,
      motDePasse: '',
      roleId: row.role.id,
      telephone: row.telephone ?? '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editRow) {
        const body: Record<string, unknown> = {
          matricule: form.matricule,
          email: form.email,
          nom: form.nom,
          prenom: form.prenom,
          roleId: form.roleId,
          telephone: form.telephone || null,
        };
        if (form.motDePasse) body.motDePasse = form.motDePasse;
        await utilisateursApi.update(editRow.id, body);
      } else {
        await utilisateursApi.create(form);
      }
      setDialogOpen(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActif = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    setFormError(null);
    try {
      if (toggleTarget.actif) {
        await utilisateursApi.deactivate(toggleTarget.id);
      } else {
        await utilisateursApi.activate(toggleTarget.id);
      }
      setToggleTarget(null);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
      setToggleTarget(null);
    } finally {
      setToggling(false);
    }
  };

  const columns = useMemo<GridColDef<UtilisateurRow>[]>(() => {
    const base: GridColDef<UtilisateurRow>[] = [
      { field: 'matricule', headerName: 'Matricule', flex: 1, minWidth: 120 },
      { field: 'nom', headerName: 'Nom', flex: 1, minWidth: 120 },
      { field: 'prenom', headerName: 'Prénom', flex: 1, minWidth: 120 },
      { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 180 },
      {
        field: 'role',
        headerName: 'Rôle',
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) => ROLE_LABELS[row.role.code] ?? row.role.libelle,
      },
      {
        field: 'actif',
        headerName: 'Statut',
        width: 110,
        valueGetter: (_, row) => (row.actif ? 'Actif' : 'Inactif'),
      },
    ];

    if (canWrite) {
      base.push({
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Box className="flex h-full items-center gap-1">
            <Tooltip title="Modifier">
              <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.actif ? 'Désactiver' : 'Activer'}>
              <IconButton size="small" color={row.actif ? 'warning' : 'success'} onClick={() => setToggleTarget(row)}>
                {row.actif ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        ),
      });
    }

    return base;
  }, [canWrite]);

  return (
    <Box>
      <PageHeader
        title="Utilisateurs"
        subtitle="Gestion des comptes et des rôles"
        action={
          canWrite ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nouvel utilisateur
            </Button>
          ) : undefined
        }
      />

      {(error || formError) && (
        <Alert severity="error" className="mb-4">
          {error ?? formError}
        </Alert>
      )}

      <ListPanel
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        searchPlaceholder="Rechercher un utilisateur…"
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          rowHeight={56}
          paginationMode="server"
          rowCount={meta.total}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          onRowDoubleClick={canWrite ? (params: GridRowParams<UtilisateurRow>) => openEdit(params.row) : undefined}
          pageSizeOptions={[10, 25, 50]}
          sx={{ height: '100%', ...(canWrite ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}) }}
        />
      </ListPanel>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Matricule" value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} required />
          <TextField label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <TextField label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField
            label={editRow ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            type="password"
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            required={!editRow}
          />
          <TextField label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <TextField select label="Rôle" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Enregistrement...' : editRow ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.actif ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'}
        message={`Confirmer ${toggleTarget?.actif ? 'la désactivation' : "l'activation"} de ${toggleTarget?.prenom ?? ''} ${toggleTarget?.nom ?? ''} ?`}
        confirmLabel={toggleTarget?.actif ? 'Désactiver' : 'Activer'}
        confirmColor={toggleTarget?.actif ? 'warning' : 'primary'}
        loading={toggling}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => void handleToggleActif()}
      />
    </Box>
  );
};
