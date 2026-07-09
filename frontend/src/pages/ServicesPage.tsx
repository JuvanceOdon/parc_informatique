import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMemo, useState } from 'react';
import { servicesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { getErrorMessage } from '../utils/errors';

interface ServiceRow {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
}

const emptyForm = { code: '', libelle: '', description: '' };

export const ServicesPage = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN');
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) => servicesApi.list(params) as Promise<{ data: ServiceRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<ServiceRow>(fetcher);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<ServiceRow | null>(null);
  const [toggling, setToggling] = useState(false);

  const openCreate = () => {
    setEditRow(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditRow(row);
    setForm({ code: row.code, libelle: row.libelle, description: row.description ?? '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editRow) {
        await servicesApi.update(editRow.id, form);
      } else {
        await servicesApi.create(form);
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
        await servicesApi.deactivate(toggleTarget.id);
      } else {
        await servicesApi.activate(toggleTarget.id);
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

  const columns = useMemo<GridColDef<ServiceRow>[]>(() => {
    const base: GridColDef<ServiceRow>[] = [
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
        title="Services"
        subtitle="Organisation des services du ministère"
        action={
          canWrite ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nouveau service
            </Button>
          ) : undefined
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
            onRowDoubleClick={canWrite ? (params: GridRowParams<ServiceRow>) => openEdit(params.row) : undefined}
            pageSizeOptions={[10, 25, 50]}
            sx={canWrite ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : undefined}
          />
        </Box>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <TextField label="Libellé" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required />
          <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
        title={toggleTarget?.actif ? 'Désactiver le service' : 'Activer le service'}
        message={`Confirmer ${toggleTarget?.actif ? 'la désactivation' : "l'activation"} de « ${toggleTarget?.libelle ?? ''} » ?`}
        confirmLabel={toggleTarget?.actif ? 'Désactiver' : 'Activer'}
        confirmColor={toggleTarget?.actif ? 'warning' : 'primary'}
        loading={toggling}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => void handleToggleActif()}
      />
    </Box>
  );
};
