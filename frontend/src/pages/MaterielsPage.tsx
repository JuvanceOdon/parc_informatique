import { Alert, Box, Button, Card, TextField } from '@mui/material';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materielsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MaterielFormDialog } from '../components/forms/MaterielFormDialog';
import { PageHeader } from '../components/PageHeader';
import { MATERIEL_ETAT_LABELS, MATERIEL_STATUT_LABELS } from '../constants/labels';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedList } from '../hooks/usePaginatedList';
import type { Materiel } from '../types/entities';
import { getErrorMessage } from '../utils/errors';

interface MaterielRow {
  id: number;
  codeMateriel: string;
  designation: string;
  marque: string | null;
  modele: string | null;
  statut: string;
  etat: string;
  actif: boolean;
  categorie?: { libelle: string };
}

export const MaterielsPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) =>
      materielsApi.list(params) as Promise<{ data: MaterielRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch, reload } =
    usePaginatedList<MaterielRow>(fetcher);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMateriel, setEditMateriel] = useState<Materiel | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<MaterielRow | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openEdit = async (id: number) => {
    setEditLoading(true);
    setActionError(null);
    try {
      const detail = await materielsApi.getById(id);
      setEditMateriel(detail);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await materielsApi.deactivate(deactivateTarget.id);
      setDeactivateTarget(null);
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setDeactivateTarget(null);
    } finally {
      setDeactivating(false);
    }
  };

  const columns: GridColDef<MaterielRow>[] = [
    { field: 'codeMateriel', headerName: 'Code', flex: 1, minWidth: 120 },
    { field: 'designation', headerName: 'Désignation', flex: 1.5, minWidth: 160 },
    { field: 'marque', headerName: 'Marque', flex: 1, minWidth: 100 },
    { field: 'modele', headerName: 'Modèle', flex: 1, minWidth: 100 },
    {
      field: 'categorie',
      headerName: 'Catégorie',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => row.categorie?.libelle ?? '—',
    },
    {
      field: 'statut',
      headerName: 'Statut',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => MATERIEL_STATUT_LABELS[row.statut] ?? row.statut,
    },
    {
      field: 'etat',
      headerName: 'État',
      width: 110,
      valueGetter: (_, row) => MATERIEL_ETAT_LABELS[row.etat] ?? row.etat,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: isStaff ? 130 : 80,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="Voir"
            onClick={() => navigate(`/materiels/${params.id}`)}
          />,
        ];
        if (isStaff) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="Modifier"
              onClick={() => void openEdit(Number(params.id))}
              disabled={editLoading}
            />,
          );
          if (params.row.actif) {
            actions.push(
              <GridActionsCellItem
                key="deactivate"
                icon={<BlockIcon />}
                label="Désactiver"
                onClick={() => setDeactivateTarget(params.row)}
              />,
            );
          }
        }
        return actions;
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Matériels"
        subtitle="Inventaire du parc informatique"
        action={
          isStaff ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Nouveau matériel
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
            onRowDoubleClick={(params) => navigate(`/materiels/${params.id}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Card>

      <MaterielFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => void reload()}
      />

      <MaterielFormDialog
        open={editMateriel !== null}
        materiel={editMateriel}
        onClose={() => setEditMateriel(null)}
        onSaved={() => {
          setEditMateriel(null);
          void reload();
        }}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        title="Désactiver le matériel"
        message={`Confirmer la désactivation de « ${deactivateTarget?.codeMateriel ?? ''} » ?`}
        confirmLabel="Désactiver"
        confirmColor="warning"
        loading={deactivating}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => void handleDeactivate()}
      />
    </Box>
  );
};
