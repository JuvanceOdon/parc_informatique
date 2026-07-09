import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { maintenancesApi } from '../../api/services';
import { MAINTENANCE_STATUT_LABELS, MAINTENANCE_TYPE_LABELS } from '../../constants/labels';
import { useAuth } from '../../contexts/AuthContext';
import { useLookupOptions } from '../../hooks/useLookupOptions';
import type { Maintenance, MaintenanceFormData } from '../../types/entities';
import { getErrorMessage } from '../../utils/errors';

const emptyForm = (technicienId?: number): MaintenanceFormData => ({
  materielId: '',
  ticketId: '',
  type: 'CORRECTIVE',
  titre: '',
  description: '',
  diagnostic: '',
  technicienId: technicienId ?? '',
  datePlanifiee: '',
  cout: '',
  demarrer: false,
});

const toLocalDatetime = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromMaintenance = (m: Maintenance): MaintenanceFormData => ({
  materielId: m.materiel?.id ?? '',
  ticketId: m.ticket?.id ?? '',
  type: m.type,
  titre: m.titre,
  description: m.description ?? '',
  diagnostic: m.diagnostic ?? '',
  technicienId: m.technicien?.id ?? '',
  datePlanifiee: toLocalDatetime(m.datePlanifiee),
  cout: m.cout != null ? String(m.cout) : '',
  demarrer: false,
});

const canEditDiagnostic = (statut: string) => statut === 'EN_COURS' || statut === 'DIAGNOSTIC';

interface MaintenanceFormDialogProps {
  open: boolean;
  maintenance?: Maintenance | null;
  onClose: () => void;
  onSaved: () => void;
}

export const MaintenanceFormDialog = ({ open, maintenance, onClose, onSaved }: MaintenanceFormDialogProps) => {
  const isEdit = maintenance != null;
  const { user, hasRole } = useAuth();
  const { materiels, utilisateurs, canPickUsers, loading: lookupLoading } = useLookupOptions();
  const [form, setForm] = useState<MaintenanceFormData>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const defaultTech = hasRole('TECHNICIEN') && user ? user.id : undefined;
      setForm(maintenance ? fromMaintenance(maintenance) : emptyForm(defaultTech));
      setError(null);
    }
  }, [open, maintenance, hasRole, user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && maintenance) {
        const body: Record<string, unknown> = {
          titre: form.titre,
          description: form.description || null,
          technicienId: form.technicienId || null,
          datePlanifiee: form.datePlanifiee ? new Date(form.datePlanifiee).toISOString() : null,
          cout: form.cout ? Number(form.cout) : null,
        };
        if (canEditDiagnostic(maintenance.statut)) {
          body.diagnostic = form.diagnostic.trim() || null;
        }
        await maintenancesApi.update(maintenance.id, body);
      } else {
        await maintenancesApi.create({
          materielId: form.materielId,
          ticketId: form.ticketId || null,
          type: form.type,
          titre: form.titre,
          description: form.description || null,
          technicienId: form.technicienId || null,
          datePlanifiee: form.datePlanifiee ? new Date(form.datePlanifiee).toISOString() : null,
          cout: form.cout ? Number(form.cout) : null,
          demarrer: form.demarrer,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const showDiagnostic = isEdit && maintenance && canEditDiagnostic(maintenance.statut);
  const diagnosticInvalid = showDiagnostic && form.diagnostic.trim().length > 0 && form.diagnostic.trim().length < 10;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
        {isEdit && maintenance && (
          <Chip
            label={MAINTENANCE_STATUT_LABELS[maintenance.statut] ?? maintenance.statut}
            size="small"
            color="primary"
            className="ml-2"
          />
        )}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2">
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          select
          label="Matériel"
          value={form.materielId}
          onChange={(e) => setForm({ ...form, materielId: Number(e.target.value) })}
          required
          fullWidth
          disabled={lookupLoading || isEdit}
        >
          {materiels.map((m) => (
            <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
          fullWidth
          disabled={isEdit}
        >
          {Object.entries(MAINTENANCE_TYPE_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l as string}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Titre"
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          multiline
          rows={3}
          fullWidth
        />

        {showDiagnostic && (
          <TextField
            label="Diagnostic"
            value={form.diagnostic}
            onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
            multiline
            rows={3}
            fullWidth
            error={diagnosticInvalid}
            helperText={diagnosticInvalid ? 'Minimum 10 caractères si renseigné' : 'Modifiable à tout moment'}
          />
        )}

        {canPickUsers ? (
          <TextField
            select
            label="Technicien"
            value={form.technicienId}
            onChange={(e) => setForm({ ...form, technicienId: e.target.value ? Number(e.target.value) : '' })}
            fullWidth
          >
            <MenuItem value="">— Non assigné —</MenuItem>
            {utilisateurs.map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.label}</MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            label="ID technicien"
            type="number"
            value={form.technicienId}
            onChange={(e) => setForm({ ...form, technicienId: Number(e.target.value) })}
            fullWidth
            helperText="Par défaut : votre compte si vous êtes technicien"
          />
        )}

        {!isEdit && (
          <TextField
            label="ID ticket (optionnel)"
            type="number"
            value={form.ticketId}
            onChange={(e) => setForm({ ...form, ticketId: e.target.value ? Number(e.target.value) : '' })}
            fullWidth
          />
        )}

        <TextField
          label="Date planifiée"
          type="datetime-local"
          value={form.datePlanifiee}
          onChange={(e) => setForm({ ...form, datePlanifiee: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <TextField
          label="Coût estimé (Ar)"
          type="number"
          value={form.cout}
          onChange={(e) => setForm({ ...form, cout: e.target.value })}
          fullWidth
        />

        {!isEdit && (
          <FormControlLabel
            control={
              <Checkbox
                checked={form.demarrer}
                onChange={(e) => setForm({ ...form, demarrer: e.target.checked })}
              />
            }
            label="Démarrer immédiatement"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || (!isEdit && !form.materielId) || !form.titre || diagnosticInvalid}
        >
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
