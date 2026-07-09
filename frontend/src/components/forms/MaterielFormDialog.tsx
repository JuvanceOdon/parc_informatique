import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { materielsApi } from '../../api/services';
import { MATERIEL_ETAT_LABELS, MATERIEL_STATUT_LABELS } from '../../constants/labels';
import { useLookupOptions } from '../../hooks/useLookupOptions';
import type { Materiel, MaterielFormData } from '../../types/entities';
import { getErrorMessage } from '../../utils/errors';

const emptyForm = (): MaterielFormData => ({
  numeroSerie: '',
  designation: '',
  marque: '',
  modele: '',
  categorieId: '',
  serviceId: '',
  localisation: '',
  dateAcquisition: '',
  dateFinGarantie: '',
  statut: 'EN_STOCK',
  etat: 'BON',
  description: '',
});

const fromMateriel = (m: Materiel): MaterielFormData => ({
  numeroSerie: m.numeroSerie ?? '',
  designation: m.designation,
  marque: m.marque ?? '',
  modele: m.modele ?? '',
  categorieId: m.categorie.id,
  serviceId: m.service?.id ?? '',
  localisation: m.localisation ?? '',
  dateAcquisition: m.dateAcquisition?.slice(0, 10) ?? '',
  dateFinGarantie: m.dateFinGarantie?.slice(0, 10) ?? '',
  statut: m.statut,
  etat: m.etat,
  description: m.description ?? '',
});

interface MaterielFormDialogProps {
  open: boolean;
  materiel?: Materiel | null;
  onClose: () => void;
  onSaved: () => void;
}

export const MaterielFormDialog = ({ open, materiel, onClose, onSaved }: MaterielFormDialogProps) => {
  const { categories, services, loading: lookupLoading } = useLookupOptions();
  const [form, setForm] = useState<MaterielFormData>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(materiel ? fromMateriel(materiel) : emptyForm());
      setError(null);
    }
  }, [open, materiel]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const body = {
      numeroSerie: form.numeroSerie || null,
      designation: form.designation,
      marque: form.marque || null,
      modele: form.modele || null,
      categorieId: form.categorieId,
      serviceId: form.serviceId || null,
      localisation: form.localisation || null,
      dateAcquisition: form.dateAcquisition || null,
      dateFinGarantie: form.dateFinGarantie || null,
      statut: form.statut,
      etat: form.etat,
      description: form.description || null,
    };
    try {
      if (materiel) {
        await materielsApi.update(materiel.id, body);
      } else {
        await materielsApi.create(body);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{materiel ? 'Modifier le matériel' : 'Nouveau matériel'}</DialogTitle>
      <DialogContent className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
        {error && (
          <Alert severity="error" className="col-span-full">
            {error}
          </Alert>
        )}
        <TextField
          label="Désignation"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
          required
          fullWidth
        />
        <TextField
          label="N° de série"
          value={form.numeroSerie}
          onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
          fullWidth
        />
        <TextField label="Marque" value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })} fullWidth />
        <TextField label="Modèle" value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} fullWidth />
        <TextField
          select
          label="Catégorie"
          value={form.categorieId}
          onChange={(e) => setForm({ ...form, categorieId: Number(e.target.value) })}
          required
          fullWidth
          disabled={lookupLoading}
        >
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
          ))}
        </TextField>
        {services.length > 0 && (
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
        <TextField
          select
          label="Statut"
          value={form.statut}
          onChange={(e) => setForm({ ...form, statut: e.target.value })}
          fullWidth
        >
          {Object.entries(MATERIEL_STATUT_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l as string}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="État"
          value={form.etat}
          onChange={(e) => setForm({ ...form, etat: e.target.value })}
          fullWidth
        >
          {Object.entries(MATERIEL_ETAT_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l as string}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Localisation"
          value={form.localisation}
          onChange={(e) => setForm({ ...form, localisation: e.target.value })}
          fullWidth
        />
        <TextField
          label="Date d'acquisition"
          type="date"
          value={form.dateAcquisition}
          onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <TextField
          label="Fin de garantie"
          type="date"
          value={form.dateFinGarantie}
          onChange={(e) => setForm({ ...form, dateFinGarantie: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          multiline
          rows={3}
          className="col-span-full"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={saving || !form.designation || !form.categorieId}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
