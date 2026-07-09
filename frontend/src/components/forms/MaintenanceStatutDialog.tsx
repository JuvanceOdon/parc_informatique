import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { maintenancesApi } from '../../api/services';
import { MAINTENANCE_STATUT_LABELS, MAINTENANCE_STATUT_TRANSITIONS } from '../../constants/labels';
import type { Maintenance } from '../../types/entities';
import { getErrorMessage } from '../../utils/errors';

interface MaintenanceStatutDialogProps {
  open: boolean;
  maintenance: Maintenance | null;
  onClose: () => void;
  onSaved: () => void;
}

const TERMINAL = new Set(['TERMINEE', 'ANNULEE']);

export const MaintenanceStatutDialog = ({
  open,
  maintenance,
  onClose,
  onSaved,
}: MaintenanceStatutDialogProps) => {
  const [newStatut, setNewStatut] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [solution, setSolution] = useState('');
  const [motif, setMotif] = useState('');
  const [cout, setCout] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const transitions = maintenance
    ? (MAINTENANCE_STATUT_TRANSITIONS[maintenance.statut] ?? [])
    : [];

  useEffect(() => {
    if (open && maintenance) {
      const available = MAINTENANCE_STATUT_TRANSITIONS[maintenance.statut] ?? [];
      setNewStatut(available[0] ?? '');
      setDiagnostic('');
      setSolution('');
      setMotif('');
      setCout('');
      setError(null);
    }
  }, [open, maintenance]);

  const handleSave = async () => {
    if (!maintenance || !newStatut) return;
    setSaving(true);
    setError(null);
    try {
      switch (newStatut) {
        case 'EN_COURS':
          if (maintenance.statut === 'PLANIFIEE') {
            await maintenancesApi.demarrer(maintenance.id);
          } else {
            await maintenancesApi.reprendre(maintenance.id);
          }
          break;
        case 'DIAGNOSTIC':
          await maintenancesApi.enregistrerDiagnostic(maintenance.id, { diagnostic: diagnostic.trim() });
          break;
        case 'TERMINEE':
          await maintenancesApi.enregistrerSolution(maintenance.id, {
            solution: solution.trim(),
            cout: cout ? Number(cout) : null,
          });
          break;
        case 'ANNULEE':
          await maintenancesApi.annuler(maintenance.id, { motif: motif.trim() || null });
          break;
        default:
          throw new Error('Transition de statut non supportée');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const needsDiagnostic = newStatut === 'DIAGNOSTIC';
  const needsSolution = newStatut === 'TERMINEE';
  const needsMotif = newStatut === 'ANNULEE';
  const canSubmit =
    newStatut &&
    (!needsDiagnostic || diagnostic.trim().length >= 10) &&
    (!needsSolution || solution.trim().length >= 10);

  if (!maintenance) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Changer le statut</DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2">
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="body2" color="text.secondary">
          Maintenance {maintenance.numeroMaintenance} — {maintenance.titre}
        </Typography>

        <TextField
          label="Statut actuel"
          value={MAINTENANCE_STATUT_LABELS[maintenance.statut] ?? maintenance.statut}
          disabled
          fullWidth
        />

        {TERMINAL.has(maintenance.statut) ? (
          <Alert severity="info">Cette maintenance est clôturée et ne peut plus être modifiée.</Alert>
        ) : (
          <>
            <TextField
              select
              label="Nouveau statut"
              value={newStatut}
              onChange={(e) => setNewStatut(e.target.value)}
              required
              fullWidth
            >
              {transitions.map((s) => (
                <MenuItem key={s} value={s}>
                  {MAINTENANCE_STATUT_LABELS[s] ?? s}
                </MenuItem>
              ))}
            </TextField>

            {needsDiagnostic && (
              <TextField
                label="Diagnostic"
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                multiline
                rows={4}
                required
                fullWidth
                helperText="Minimum 10 caractères"
              />
            )}

            {needsSolution && (
              <>
                <TextField
                  label="Solution appliquée"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  multiline
                  rows={4}
                  required
                  fullWidth
                  helperText="Minimum 10 caractères"
                />
                <TextField
                  label="Coût final (Ar)"
                  type="number"
                  value={cout}
                  onChange={(e) => setCout(e.target.value)}
                  fullWidth
                />
              </>
            )}

            {needsMotif && (
              <TextField
                label="Motif d'annulation (optionnel)"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                multiline
                rows={2}
                fullWidth
              />
            )}

            {newStatut === 'EN_COURS' && maintenance.statut === 'PLANIFIEE' && (
              <Alert severity="info">
                Le matériel passera en statut « En maintenance ».
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {!TERMINAL.has(maintenance.statut) && (
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving || !canSubmit}>
            {saving ? 'Mise à jour...' : 'Appliquer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
