import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import { downloadReport } from '../api/services';
import { PageHeader } from '../components/PageHeader';
import { getErrorMessage } from '../utils/errors';

export const RapportsPage = () => {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState<'mensuel' | 'annuel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (type: 'mensuel' | 'annuel') => {
    setLoading(type);
    setError(null);
    try {
      const path = type === 'mensuel' ? '/rapports/mensuel' : '/rapports/annuel';
      const params =
        type === 'mensuel'
          ? { mois, annee, format }
          : { annee, format };
      await downloadReport(path, params);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Rapports"
        subtitle="Génération de rapports mensuels et annuels (PDF / Excel)"
      />

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <Typography variant="h6" color="text.primary">
                Rapport mensuel
              </Typography>
              <TextField select label="Mois" value={mois} onChange={(e) => setMois(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('fr-FR', { month: 'long' })}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Année" type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))} />
              <FormatSelect format={format} onChange={setFormat} />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={() => void handleDownload('mensuel')}
                disabled={loading !== null}
              >
                {loading === 'mensuel' ? 'Génération...' : 'Télécharger le rapport mensuel'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <Typography variant="h6" color="text.primary">
                Rapport annuel
              </Typography>
              <TextField label="Année" type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))} />
              <FormatSelect format={format} onChange={setFormat} />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={() => void handleDownload('annuel')}
                disabled={loading !== null}
              >
                {loading === 'annuel' ? 'Génération...' : 'Télécharger le rapport annuel'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const FormatSelect = ({
  format,
  onChange,
}: {
  format: 'pdf' | 'excel';
  onChange: (v: 'pdf' | 'excel') => void;
}) => (
  <TextField select label="Format" value={format} onChange={(e) => onChange(e.target.value as 'pdf' | 'excel')}>
    <MenuItem value="pdf">PDF</MenuItem>
    <MenuItem value="excel">Excel</MenuItem>
  </TextField>
);
