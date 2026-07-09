import { Box, Divider, Typography } from '@mui/material';

interface HistoryEntry {
  id: number;
  action: string;
  description: string | null;
  createdAt: string;
  utilisateur?: { prenom: string; nom: string; matricule?: string } | null;
}

interface HistoryTimelineProps {
  entries: HistoryEntry[];
  actionLabels?: Record<string, string>;
}

export const HistoryTimeline = ({ entries, actionLabels = {} }: HistoryTimelineProps) => {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun historique disponible.
      </Typography>
    );
  }

  return (
    <Box className="flex flex-col gap-0">
      {entries.map((entry, index) => (
        <Box key={entry.id}>
          <Box className="flex gap-4 py-3">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mt: 0.6,
                flexShrink: 0,
              }}
            />
            <Box className="flex-1">
              <Typography variant="subtitle2">
                {actionLabels[entry.action] ?? entry.action}
              </Typography>
              {entry.description && (
                <Typography variant="body2" color="text.secondary">
                  {entry.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {entry.utilisateur
                  ? `${entry.utilisateur.prenom} ${entry.utilisateur.nom}`
                  : 'Système'}{' '}
                — {new Date(entry.createdAt).toLocaleString('fr-FR')}
              </Typography>
            </Box>
          </Box>
          {index < entries.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
};
