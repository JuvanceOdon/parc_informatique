import { Alert, Box, Button, Card, IconButton, TextField, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useMemo, useState } from 'react';
import { maintenancesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MaintenanceFormDialog } from '../components/forms/MaintenanceFormDialog';
import { MaintenanceStatutDialog } from '../components/forms/MaintenanceStatutDialog';
import { PageHeader } from '../components/PageHeader';
import {
  isMaintenanceTerminal,
  MAINTENANCE_STATUT_LABELS,
  MAINTENANCE_TYPE_LABELS,
} from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import type { Maintenance } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

interface MaintenanceRow {
  id: number;
  numeroMaintenance: string;
  titre: string;
  type: string;
  statut: string;
  dateDebut: string | null;
  materiel?: { codeMateriel: string };
}

export const MaintenancesPage = () => {
  const { isStaff } = useAuth();
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) =>
      maintenancesApi.list(params) as Promise<{ data: MaintenanceRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<MaintenanceRow>(fetcher);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMaintenance, setEditMaintenance] = useState<Maintenance | null>(null);
  const [statutMaintenance, setStatutMaintenance] = useState<Maintenance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRow | null>(null);
  const [annulerTarget, setAnnulerTarget] = useState<MaintenanceRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [annulant, setAnnulant] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openEdit = async (id: number) => {
    setActionError(null);
    try {
      const detail = await maintenancesApi.get(id);
      if (isMaintenanceTerminal(detail.statut)) {
        setActionError('Une maintenance clôturée ne peut plus être modifiée');
        return;
      }
      setEditMaintenance(detail);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const openStatut = async (id: number) => {
    setActionError(null);
    try {
      const detail = await maintenancesApi.get(id);
      setStatutMaintenance(detail);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await maintenancesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleAnnuler = async () => {
    if (!annulerTarget) return;
    setAnnulant(true);
    setActionError(null);
    try {
      await maintenancesApi.annuler(annulerTarget.id);
      setAnnulerTarget(null);
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setAnnulerTarget(null);
    } finally {
      setAnnulant(false);
    }
  };

  const columns = useMemo<GridColDef<MaintenanceRow>[]>(() => {
    const base: GridColDef<MaintenanceRow>[] = [
      { field: 'numeroMaintenance', headerName: 'N°', width: 120 },
      { field: 'titre', headerName: 'Titre', flex: 1.5, minWidth: 180 },
      {
        field: 'type',
        headerName: 'Type',
        width: 120,
        valueGetter: (_, row) => MAINTENANCE_TYPE_LABELS[row.type] ?? row.type,
      },
      {
        field: 'statut',
        headerName: 'Statut',
        width: 120,
        valueGetter: (_, row) => MAINTENANCE_STATUT_LABELS[row.statut] ?? row.statut,
      },
      {
        field: 'materiel',
        headerName: 'Matériel',
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.materiel?.codeMateriel ?? '—',
      },
      {
        field: 'dateDebut',
        headerName: 'Début',
        width: 120,
        valueGetter: (_, row) => row.dateDebut ? new Date(row.dateDebut).toLocaleDateString('fr-FR') : '—',
      },
    ];

    if (isStaff) {
      base.push({
        field: 'actions',
        headerName: 'Actions',
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Box className="flex h-full items-center gap-1">
            {!isMaintenanceTerminal(row.statut) && (
              <Tooltip title="Modifier">
                <IconButton size="small" color="primary" onClick={() => void openEdit(row.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!isMaintenanceTerminal(row.statut) && (
              <Tooltip title="Changer le statut">
                <IconButton size="small" color="secondary" onClick={() => void openStatut(row.id)}>
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {row.statut === 'PLANIFIEE' && (
              <Tooltip title="Supprimer">
                <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {(row.statut === 'EN_COURS' || row.statut === 'DIAGNOSTIC') && (
              <Tooltip title="Annuler">
                <IconButton size="small" color="warning" onClick={() => setAnnulerTarget(row)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      });
    }

    return base;
  }, [isStaff]);

  return (
    <Box>
      <PageHeader
        title="Maintenances"
        subtitle="Suivi des interventions préventives et correctives"
        action={
          isStaff ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Nouvelle maintenance
            </Button>
          ) : undefined
        }
      />
      {(error || actionError) && <Alert severity="error" className="mb-4">{error ?? actionError}</Alert>}
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
            onRowDoubleClick={
              isStaff
                ? (params: GridRowParams<MaintenanceRow>) => {
                    if (!isMaintenanceTerminal(params.row.statut)) void openEdit(params.row.id);
                  }
                : undefined
            }
            pageSizeOptions={[10, 25, 50]}
            sx={isStaff ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : undefined}
          />
        </Box>
      </Card>

      <MaintenanceFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => void reload()}
      />

      <MaintenanceFormDialog
        open={editMaintenance !== null}
        maintenance={editMaintenance}
        onClose={() => setEditMaintenance(null)}
        onSaved={() => {
          setEditMaintenance(null);
          void reload();
        }}
      />

      <MaintenanceStatutDialog
        open={statutMaintenance !== null}
        maintenance={statutMaintenance}
        onClose={() => setStatutMaintenance(null)}
        onSaved={() => {
          setStatutMaintenance(null);
          void reload();
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer la maintenance"
        message={`Confirmer la suppression de « ${deleteTarget?.numeroMaintenance ?? ''} — ${deleteTarget?.titre ?? ''} » ?`}
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={annulerTarget !== null}
        title="Annuler la maintenance"
        message={`Confirmer l'annulation de « ${annulerTarget?.numeroMaintenance ?? ''} — ${annulerTarget?.titre ?? ''} » ?`}
        confirmLabel="Annuler"
        confirmColor="warning"
        loading={annulant}
        onClose={() => setAnnulerTarget(null)}
        onConfirm={() => void handleAnnuler()}
      />
    </Box>
  );
};
