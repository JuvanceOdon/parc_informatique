import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { dashboardApi } from '../api/services';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import type { DashboardData } from '../types';
import { getErrorMessage } from '../utils/errors';

const COLORS = ['#1a365d', '#2c5282', '#c9a227', '#38a169', '#e53e3e', '#805ad5'];

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await dashboardApi.get());
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return <Alert severity="error">{error ?? 'Données indisponibles'}</Alert>;
  }

  const { kpi } = data;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble du parc informatique et des interventions"
      />

      <Grid container spacing={2} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Matériels total"
            value={kpi.totalMateriels}
            icon={<DevicesIcon sx={{ color: '#1a365d', opacity: 0.5 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tickets ouverts"
            value={kpi.ticketsOuverts}
            icon={<ConfirmationNumberIcon sx={{ color: '#e53e3e', opacity: 0.6 }} />}
            color="#e53e3e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Maintenances en cours"
            value={kpi.maintenancesEnCours}
            icon={<BuildIcon sx={{ color: '#c9a227', opacity: 0.7 }} />}
            color="#c9a227"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Taux disponibilité"
            value={`${kpi.tauxDisponibilite}%`}
            icon={<TrendingUpIcon sx={{ color: '#38a169', opacity: 0.7 }} />}
            color="#38a169"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="rounded-xl bg-white p-4 shadow-sm">
            <Typography variant="h6" color="primary.dark" className="mb-2">
              Répartition par statut
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.repartitionMateriels.parStatut}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.repartitionMateriels.parStatut.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="rounded-xl bg-white p-4 shadow-sm">
            <Typography variant="h6" color="primary.dark" className="mb-2">
              Tickets par priorité
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.repartitionTickets.parPriorite}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1a365d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box className="rounded-xl bg-white p-4 shadow-sm">
            <Typography variant="h6" color="primary.dark" className="mb-2">
              Évolution des tickets (12 mois)
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.graphiques.ticketsParMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="crees" stroke="#1a365d" strokeWidth={2} name="Créés" />
                <Line type="monotone" dataKey="resolus" stroke="#38a169" strokeWidth={2} name="Résolus" />
                <Line type="monotone" dataKey="fermes" stroke="#c9a227" strokeWidth={2} name="Fermés" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box className="rounded-xl bg-white p-4 shadow-sm">
            <Typography variant="h6" color="primary.dark" className="mb-2">
              Interventions mensuelles
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.interventionsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="preventive" stackId="a" fill="#2c5282" name="Préventive" />
                <Bar dataKey="corrective" stackId="a" fill="#c9a227" name="Corrective" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
