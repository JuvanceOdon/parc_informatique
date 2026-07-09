import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Alert,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { affectationsApi } from '../../api/services';
import { useLookupOptions } from '../../hooks/useLookupOptions';
import type { Affectation, AffectationFormData } from '../../types/entities';
import { getErrorMessage } from '../../utils/errors';

type FormMode = 'create' | 'edit' | 'transfer' | 'terminer';

const emptyForm = (): AffectationFormData => ({
  materielId: '',
  utilisateurId: '',
  serviceId: '',
  localisation: '',
  motif: '',
});

const fromAffectation = (a: Affectation): AffectationFormData => ({
  materielId: a.materiel?.id ?? '',
  utilisateurId: a.utilisateur?.id ?? '',
  serviceId: a.service?.id ?? '',
  localisation: a.localisation ?? '',
  motif: a.motif ?? '',
});

interface AffectationFormDialogProps {
  open: boolean;
  mode: FormMode;
  affectation?: Affectation | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AffectationFormDialog = ({
  open,
  mode,
  affectation,
  onClose,
  onSaved,
}: AffectationFormDialogProps) => {
  const { materiels, services, utilisateurs, canPickUsers, loading: lookupLoading } = useLookupOptions();
  const [form, setForm] = useState<AffectationFormData>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(mode === 'create' || !affectation ? emptyForm() : fromAffectation(affectation));
      setError(null);
    }
  }, [open, mode, affectation]);

  const titles: Record<FormMode, string> = {
    create: 'Nouvelle affectation',
    edit: 'Modifier l\'affectation',
    transfer: 'Transférer l\'affectation',
    terminer: 'Terminer l\'affectation',
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (mode === 'create') {
        await affectationsApi.create({
          materielId: form.materielId,
          utilisateurId: form.utilisateurId,
          serviceId: form.serviceId || null,
          localisation: form.localisation || null,
          motif: form.motif || null,
        });
      } else if (mode === 'edit' && affectation) {
        await affectationsApi.update(affectation.id, {
          serviceId: form.serviceId || null,
          localisation: form.localisation || null,
          motif: form.motif || null,
        });
      } else if (mode === 'transfer' && affectation) {
        await affectationsApi.transfer(affectation.id, {
          nouvelUtilisateurId: form.utilisateurId,
          serviceId: form.serviceId || null,
          localisation: form.localisation || null,
          motif: form.motif || null,
        });
      } else if (mode === 'terminer' && affectation) {
        await affectationsApi.terminer(affectation.id, { motif: form.motif || null });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{titles[mode]}</DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2">
        {error && <Alert severity="error">{error}</Alert>}

        {mode === 'edit' && affectation && (
          <>
            <Typography variant="body2" color="text.secondary">
              Matériel : {affectation.materiel?.codeMateriel} — {affectation.materiel?.designation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utilisateur : {affectation.utilisateur?.prenom} {affectation.utilisateur?.nom}
            </Typography>
          </>
        )}

        {mode === 'create' && (
          <TextField
            select
            label="Matériel"
            value={form.materielId}
            onChange={(e) => setForm({ ...form, materielId: Number(e.target.value) })}
            required
            fullWidth
            disabled={lookupLoading}
          >
            {materiels.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
            ))}
          </TextField>
        )}

        {(mode === 'create' || mode === 'transfer') && (
          canPickUsers ? (
            <TextField
              select
              label={mode === 'transfer' ? 'Nouvel utilisateur' : 'Utilisateur'}
              value={form.utilisateurId}
              onChange={(e) => setForm({ ...form, utilisateurId: Number(e.target.value) })}
              required
              fullWidth
            >
              {utilisateurs.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.label}</MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="ID utilisateur"
              type="number"
              value={form.utilisateurId}
              onChange={(e) => setForm({ ...form, utilisateurId: Number(e.target.value) })}
              required
              fullWidth
              helperText="Liste utilisateurs réservée à l'administrateur — saisir l'ID utilisateur"
            />
          )
        )}

        {mode !== 'terminer' && services.length > 0 && (
          <TextField
            select
            label="Service"
            value={form.serviceId}
            onChange={(e) => setForm({ ...form, serviceId: e.target.value ? Number(e.target.value) : '' })}
            fullWidth
          >
            <MenuItem value="">— Aucun —</MenuItem>
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
          </TextField>
        )}

        {mode !== 'terminer' && (
          <TextField
            label="Localisation"
            value={form.localisation}
            onChange={(e) => setForm({ ...form, localisation: e.target.value })}
            fullWidth
          />
        )}

        <TextField
          label="Motif"
          value={form.motif}
          onChange={(e) => setForm({ ...form, motif: e.target.value })}
          multiline
          rows={2}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={
            saving ||
            (mode === 'create' && (!form.materielId || !form.utilisateurId)) ||
            (mode === 'transfer' && !form.utilisateurId)
          }
        >
          {saving ? 'Enregistrement...' : mode === 'edit' ? 'Enregistrer' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
