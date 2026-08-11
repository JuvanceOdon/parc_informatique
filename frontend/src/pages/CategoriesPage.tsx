import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Switch, TextField, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import { categoriesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ListPanel } from '../components/ListPanel';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { getErrorMessage } from '../utils/errors';

interface CategorieRow {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
}

const emptyForm = { code: '', libelle: '', description: '', actif: true };

export const CategoriesPage = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN');
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) => categoriesApi.list(params) as Promise<{ data: CategorieRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<CategorieRow>(fetcher);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<CategorieRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategorieRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditRow(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: CategorieRow) => {
    setEditRow(row);
    setForm({ code: row.code, libelle: row.libelle, description: row.description ?? '', actif: row.actif });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editRow) {
        await categoriesApi.update(editRow.id, form);
      } else {
        const { actif: _, ...createData } = form;
        await categoriesApi.create(createData);
      }
      setDialogOpen(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setFormError(null);
    try {
      await categoriesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<GridColDef<CategorieRow>[]>(() => {
    const base: GridColDef<CategorieRow>[] = [
      { field: 'code', headerName: 'Code', flex: 1, minWidth: 100 },
      { field: 'libelle', headerName: 'Libellé', flex: 1.5, minWidth: 160 },
      { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
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
            <Tooltip title="Supprimer">
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                <DeleteIcon fontSize="small" />
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
        title="Catégories"
        subtitle="Classification des matériels informatiques"
        action={
          canWrite ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nouvelle catégorie
            </Button>
          ) : undefined
        }
      />

      {(error || formError) && <Alert severity="error" className="mb-4">{error ?? formError}</Alert>}

      <ListPanel
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Rechercher une catégorie…"
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
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          onRowDoubleClick={canWrite ? (params: GridRowParams<CategorieRow>) => openEdit(params.row) : undefined}
          pageSizeOptions={[10, 25, 50]}
          sx={{ height: '100%', ...(canWrite ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}) }}
        />
      </ListPanel>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <TextField label="Libellé" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required />
          <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {editRow && (
            <FormControlLabel
              control={<Switch checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />}
              label="Catégorie active"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Enregistrement...' : editRow ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer la catégorie"
        message={`Confirmer la suppression de « ${deleteTarget?.libelle ?? ''} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </Box>
  );
};
