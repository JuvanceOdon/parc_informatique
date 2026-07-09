import { Alert, Box, Card, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { journalAuditApi } from '../api/services';
import { PageHeader } from '../components/PageHeader';
import { usePaginatedList } from '../hooks/usePaginatedList';

interface AuditRow {
  id: number;
  action: string;
  entite: string;
  entiteId: number | null;
  details: string | null;
  createdAt: string;
  utilisateur?: { nom: string; prenom: string; matricule: string };
}

export const JournalAuditPage = () => {
  const fetcher = useMemo(
    () => (params: Record<string, unknown>) => journalAuditApi.list(params) as Promise<{ data: AuditRow[]; meta?: import('../types').PaginationMeta }>,
    [],
  );
  const { rows, meta, loading, error, page, pageSize, search, setPage, setPageSize, setSearch } =
    usePaginatedList<AuditRow>(fetcher);

  const columns: GridColDef<AuditRow>[] = [
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 160,
      valueGetter: (_, row) => new Date(row.createdAt).toLocaleString('fr-FR'),
    },
    { field: 'action', headerName: 'Action', flex: 1, minWidth: 140 },
    { field: 'entite', headerName: 'Entité', width: 120 },
    { field: 'entiteId', headerName: 'ID', width: 80 },
    {
      field: 'utilisateur',
      headerName: 'Utilisateur',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        row.utilisateur ? `${row.utilisateur.prenom} ${row.utilisateur.nom}` : 'Système',
    },
    { field: 'details', headerName: 'Détails', flex: 2, minWidth: 200 },
  ];

  return (
    <Box>
      <PageHeader title="Journal d'audit" subtitle="Traçabilité des actions sensibles du système" />
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
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
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Card>
    </Box>
  );
};
