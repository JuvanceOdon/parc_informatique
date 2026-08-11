import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
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
import { DashboardPilotagePanel } from '../components/DashboardPilotagePanel';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardData } from '../types';
import { getErrorMessage } from '../utils/errors';

export const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primary = theme.palette.mode === 'dark' ? '#adc7f7' : '#1a365d';
  const chartColors = [primary, '#2c5282', '#c9a227', '#059669', '#e11d48', '#7c3aed'];
  const gridStroke = theme.palette.mode === 'dark' ? '#243247' : '#e2e8f0';
  const firstName = user?.prenom?.split(' ')[0] ?? user?.nom ?? 'Agent';
  const isStaff = user?.role.code !== 'UTILISATEUR';

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

  const { kpi, pilotage } = data;

  return (
    <Box>
      <PageHeader
        title={`Bonjour, ${firstName}`}
        subtitle="Pilotage du parc et des interventions du service"
      />

      <Grid container spacing={2.5} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Matériels"
            value={kpi.totalMateriels}
            hint="Parc enregistré"
            icon={<DevicesIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tickets ouverts"
            value={kpi.ticketsOuverts}
            hint="À traiter"
            icon={<ConfirmationNumberIcon />}
            color="#e11d48"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Maintenances"
            value={kpi.maintenancesEnCours}
            hint="En cours"
            icon={<BuildIcon />}
            color="#c9a227"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label={isStaff ? 'Respect SLA' : 'Disponibilité'}
            value={isStaff ? `${pilotage.sla.tauxRespectSla}%` : `${kpi.tauxDisponibilite}%`}
            hint={
              isStaff
                ? `${pilotage.sla.ticketsSlaDepasses} dépassé${pilotage.sla.ticketsSlaDepasses > 1 ? 's' : ''}`
                : 'Taux actuel'
            }
            icon={<TrendingUpIcon />}
            color={
              isStaff && pilotage.sla.ticketsSlaDepasses > 0 ? '#e11d48' : '#059669'
            }
          />
        </Grid>
      </Grid>

      {pilotage && <DashboardPilotagePanel pilotage={pilotage} isStaff={Boolean(isStaff)} />}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.01em' }}>
        Indicateurs
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Répartition du parc
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Matériels par statut
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.repartitionMateriels.parStatut}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data.repartitionMateriels.parStatut.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Tickets par priorité
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Charge actuelle
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.repartitionTickets.parPriorite} barSize={36}>
                  <CartesianGrid strokeDasharray="4 8" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(26,54,93,0.04)' }} />
                  <Bar dataKey="value" fill={primary} radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Évolution des tickets
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                12 derniers mois
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data.graphiques.ticketsParMois}>
                  <CartesianGrid strokeDasharray="4 8" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="crees" stroke={primary} strokeWidth={2.5} dot={false} name="Créés" />
                  <Line type="monotone" dataKey="resolus" stroke="#059669" strokeWidth={2.5} dot={false} name="Résolus" />
                  <Line type="monotone" dataKey="fermes" stroke="#c9a227" strokeWidth={2.5} dot={false} name="Fermés" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Interventions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Préventive vs corrective
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.interventionsMensuelles}>
                  <CartesianGrid strokeDasharray="4 8" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="preventive" stackId="a" fill="#2c5282" name="Préventive" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="corrective" stackId="a" fill="#c9a227" name="Corrective" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
