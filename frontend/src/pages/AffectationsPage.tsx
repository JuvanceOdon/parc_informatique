import { Alert, Box, Button, IconButton, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useMemo, useState } from 'react';
import { affectationsApi } from '../api/services';
import { AffectationFormDialog } from '../components/forms/AffectationFormDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ListPanel } from '../components/ListPanel';
import { PageHeader } from '../components/PageHeader';
import { AFFECTATION_STATUT_LABELS } from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import type { Affectation } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

interface AffectationRow {
  id: number;
  statut: string;
  dateDebut: string;
  dateFin: string | null;
  localisation: string | null;
  motif: string | null;
  materiel?: { codeMateriel: string; designation: string };
  utilisateur?: { nom: string; prenom: string };
  service?: { libelle: string };
}

type DialogMode = 'create' | 'edit' | 'transfer' | 'terminer';

export const AffectationsPage = () => {
  const { isStaff } = useAuth();
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) =>
      affectationsApi.list(params) as Promise<{ data: AffectationRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<AffectationRow>(fetcher);

  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selected, setSelected] = useState<Affectation | null>(null);
  const [terminerTarget, setTerminerTarget] = useState<AffectationRow | null>(null);
  const [terminating, setTerminating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openDialog = async (id: number, mode: DialogMode) => {
    setActionError(null);
    try {
      const detail = await affectationsApi.get(id);
      setSelected(detail);
      setDialogMode(mode);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleTerminer = async () => {
    if (!terminerTarget) return;
    setTerminating(true);
    setActionError(null);
    try {
      await affectationsApi.terminer(terminerTarget.id);
      setTerminerTarget(null);
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setTerminerTarget(null);
    } finally {
      setTerminating(false);
    }
  };

  const columns = useMemo<GridColDef<AffectationRow>[]>(() => {
    const base: GridColDef<AffectationRow>[] = [
      {
        field: 'materiel',
        headerName: 'Matériel',
        flex: 1.2,
        minWidth: 140,
        valueGetter: (_, row) =>
          row.materiel ? `${row.materiel.codeMateriel} — ${row.materiel.designation}` : '—',
      },
      {
        field: 'utilisateur',
        headerName: 'Utilisateur',
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) => row.utilisateur ? `${row.utilisateur.prenom} ${row.utilisateur.nom}` : '—',
      },
      {
        field: 'service',
        headerName: 'Service',
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.service?.libelle ?? '—',
      },
      {
        field: 'statut',
        headerName: 'Statut',
        width: 120,
        valueGetter: (_, row) => AFFECTATION_STATUT_LABELS[row.statut] ?? row.statut,
      },
      {
        field: 'dateDebut',
        headerName: 'Début',
        width: 120,
        valueGetter: (_, row) => new Date(row.dateDebut).toLocaleDateString('fr-FR'),
      },
      {
        field: 'dateFin',
        headerName: 'Fin',
        width: 120,
        valueGetter: (_, row) => row.dateFin ? new Date(row.dateFin).toLocaleDateString('fr-FR') : '—',
      },
    ];

    if (isStaff) {
      base.push({
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          if (row.statut !== 'ACTIVE') return null;
          return (
            <Box className="flex h-full items-center gap-1">
              <Tooltip title="Modifier">
                <IconButton size="small" color="primary" onClick={() => void openDialog(row.id, 'edit')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Transférer">
                <IconButton size="small" color="secondary" onClick={() => void openDialog(row.id, 'transfer')}>
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Terminer">
                <IconButton size="small" color="warning" onClick={() => setTerminerTarget(row)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      });
    }

    return base;
  }, [isStaff]);

  return (
    <Box>
      <PageHeader
        title="Affectations"
        subtitle="Attribution des matériels aux utilisateurs"
        action={
          isStaff ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogMode('create')}>
              Nouvelle affectation
            </Button>
          ) : undefined
        }
      />
      {(error || actionError) && <Alert severity="error" className="mb-4">{error ?? actionError}</Alert>}
      <ListPanel
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Rechercher une affectation…"
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
          onRowDoubleClick={
            isStaff
              ? (params: GridRowParams<AffectationRow>) => {
                  if (params.row.statut === 'ACTIVE') void openDialog(params.row.id, 'edit');
                }
              : undefined
          }
          pageSizeOptions={[10, 25, 50]}
          sx={{ height: '100%', ...(isStaff ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}) }}
        />
      </ListPanel>

      {dialogMode === 'create' && (
        <AffectationFormDialog
          open
          mode="create"
          onClose={() => setDialogMode(null)}
          onSaved={() => void reload()}
        />
      )}

      {dialogMode && dialogMode !== 'create' && (
        <AffectationFormDialog
          open
          mode={dialogMode}
          affectation={selected}
          onClose={() => { setDialogMode(null); setSelected(null); }}
          onSaved={() => void reload()}
        />
      )}

      <ConfirmDialog
        open={terminerTarget !== null}
        title="Terminer l'affectation"
        message={`Confirmer la fin de l'affectation du matériel « ${terminerTarget?.materiel?.codeMateriel ?? ''} » ? Le matériel sera restitué.`}
        confirmLabel="Terminer"
        confirmColor="warning"
        loading={terminating}
        onClose={() => setTerminerTarget(null)}
        onConfirm={() => void handleTerminer()}
      />
    </Box>
  );
};
