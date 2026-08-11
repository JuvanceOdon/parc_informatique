import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import type {
  DashboardPilotage,
  PilotageGarantieItem,
  PilotageMaintenanceItem,
  PilotageTicketItem,
} from '../types';
import {
  MAINTENANCE_STATUT_LABELS,
  MAINTENANCE_TYPE_LABELS,
  TICKET_PRIORITE_LABELS,
  TICKET_STATUT_LABELS,
} from '../constants/labels';

interface DashboardPilotagePanelProps {
  pilotage: DashboardPilotage;
  isStaff: boolean;
}

const EmptyHint = ({ text }: { text: string }) => (
  <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, px: 0.5 }}>
    {text}
  </Typography>
);

const SectionTitle = ({ title, count }: { title: string; count?: number }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    {typeof count === 'number' && (
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {count}
      </Typography>
    )}
  </Box>
);

const TicketRows = ({ items }: { items: PilotageTicketItem[] }) => {
  if (items.length === 0) return <EmptyHint text="Rien à signaler" />;
  return (
    <List disablePadding dense>
      {items.map((t) => (
        <ListItemButton
          key={t.id}
          component={RouterLink}
          to={`/tickets/${t.id}`}
          sx={{ borderRadius: 1.5, mb: 0.5, alignItems: 'flex-start' }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                  {t.numeroTicket}
                </Typography>
                <Chip size="small" label={TICKET_PRIORITE_LABELS[t.priorite] ?? t.priorite} />
                {t.slaDepasse && (
                  <Chip size="small" color="error" label={`SLA +${t.heuresDepassement}h`} />
                )}
              </Box>
            }
            secondary={`${t.titre} · ${TICKET_STATUT_LABELS[t.statut] ?? t.statut}`}
            slotProps={{ secondary: { sx: { mt: 0.35 } } }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

const MaintenanceRows = ({
  items,
  emptyText = 'Aucune intervention',
}: {
  items: PilotageMaintenanceItem[];
  emptyText?: string;
}) => {
  if (items.length === 0) return <EmptyHint text={emptyText} />;
  return (
    <List disablePadding dense>
      {items.map((m) => (
        <ListItemButton
          key={m.id}
          component={RouterLink}
          to="/maintenances"
          sx={{ borderRadius: 1.5, mb: 0.5, alignItems: 'flex-start' }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                  {m.numeroMaintenance}
                </Typography>
                <Chip size="small" label={MAINTENANCE_TYPE_LABELS[m.type] ?? m.type} />
                {m.motifRetard === 'PLANIFIEE_DEPASSEE' && (
                  <Chip size="small" color="warning" label="Planif. dépassée" />
                )}
                {m.motifRetard === 'INTERVENTION_PROLONGEE' && (
                  <Chip size="small" color="warning" label="Prolongée" />
                )}
              </Box>
            }
            secondary={`${m.titre} · ${MAINTENANCE_STATUT_LABELS[m.statut] ?? m.statut}`}
            slotProps={{ secondary: { sx: { mt: 0.35 } } }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

const GarantieRows = ({ items }: { items: PilotageGarantieItem[] }) => {
  if (items.length === 0) return <EmptyHint text="Aucune garantie à échéance proche" />;
  return (
    <List disablePadding dense>
      {items.map((g) => (
        <ListItemButton
          key={g.id}
          component={RouterLink}
          to={`/materiels/${g.id}`}
          sx={{ borderRadius: 1.5, mb: 0.5 }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                  {g.codeMateriel}
                </Typography>
                <Chip size="small" color="secondary" label={`${g.joursRestants} j`} />
              </Box>
            }
            secondary={g.designation}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

export const DashboardPilotagePanel = ({ pilotage, isStaff }: DashboardPilotagePanelProps) => {
  const { aTraiter, maCharge, sla } = pilotage;
  const aTraiterCount =
    aTraiter.ticketsUrgents.length +
    aTraiter.ticketsSlaDepasses.length +
    aTraiter.maintenancesEnRetard.length +
    aTraiter.garantiesExpirant.length;

  return (
    <Box sx={{ mb: 3.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Poste de pilotage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isStaff
              ? 'Priorités du service, délais d’engagement et charge des techniciens MFA'
              : 'Suivi de vos demandes et délais associés'}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/tickets"
          endIcon={<ArrowForwardIcon />}
          size="small"
          sx={{ fontWeight: 700 }}
        >
          Voir les tickets
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr 0.9fr' },
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <SectionTitle title="À traiter aujourd’hui" count={aTraiterCount} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Urgences, SLA dépassés{isStaff ? ', retards et garanties' : ''}
            </Typography>

            <Typography variant="overline" color="text.secondary">
              Tickets urgents
            </Typography>
            <TicketRows items={aTraiter.ticketsUrgents} />

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="overline" color="text.secondary">
              SLA dépassés
            </Typography>
            <TicketRows items={aTraiter.ticketsSlaDepasses} />

            {isStaff && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" color="text.secondary">
                  Maintenances en retard
                </Typography>
                <MaintenanceRows
                  items={aTraiter.maintenancesEnRetard}
                  emptyText="Aucune intervention en retard"
                />

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" color="text.secondary">
                  Garanties {'<'} 30 jours
                </Typography>
                <GarantieRows items={aTraiter.garantiesExpirant} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <SectionTitle
              title={isStaff ? 'Ma charge' : 'Mes demandes'}
              count={maCharge.tickets.length + maCharge.maintenances.length}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              {isStaff
                ? 'Tickets qui vous sont assignés et interventions en cours'
                : 'Vos tickets encore ouverts'}
            </Typography>

            <Typography variant="overline" color="text.secondary">
              Tickets
            </Typography>
            <TicketRows items={maCharge.tickets} />

            {isStaff && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" color="text.secondary">
                  Maintenances
                </Typography>
                <MaintenanceRows items={maCharge.maintenances} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <SectionTitle title="Engagements SLA" />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Délais internes du service informatique
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: sla.ticketsSlaDepasses > 0 ? 'error.main' : 'success.main',
                }}
              >
                {sla.tauxRespectSla}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                respect des délais sur {sla.ticketsOuverts} ticket{sla.ticketsOuverts > 1 ? 's' : ''} ouvert
                {sla.ticketsOuverts > 1 ? 's' : ''}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <Chip
                label={`${sla.ticketsDansLesDelais} dans les délais`}
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`${sla.ticketsSlaDepasses} dépassé${sla.ticketsSlaDepasses > 1 ? 's' : ''}`}
                color={sla.ticketsSlaDepasses > 0 ? 'error' : 'default'}
                variant="outlined"
                size="small"
              />
            </Stack>

            <Typography variant="overline" color="text.secondary">
              Règles
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {sla.regles.map((r) => (
                <Box
                  key={r.priorite}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    py: 0.75,
                    px: 1.25,
                    borderRadius: 1.5,
                    bgcolor: (t) =>
                      t.palette.mode === 'light' ? 'rgba(26,54,93,0.04)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {TICKET_PRIORITE_LABELS[r.priorite] ?? r.priorite}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.delaiHeures < 48 ? `${r.delaiHeures} h` : `${r.delaiHeures / 24} j`}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
