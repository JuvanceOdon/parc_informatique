import { useEffect, useState } from 'react';
import { categoriesApi, materielsApi, servicesApi, utilisateursApi } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import type { LookupItem } from '../types/entities';

export const useLookupOptions = () => {
  const { user } = useAuth();
  const roleCode = user?.role.code;
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [services, setServices] = useState<LookupItem[]>([]);
  const [materiels, setMateriels] = useState<LookupItem[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const requests: Promise<void>[] = [
          categoriesApi.list({ actif: true, limit: 100 }).then((r) => {
            if (!cancelled) {
              setCategories(
                r.data.map((c) => ({
                  id: (c as { id: number; libelle: string }).id,
                  label: (c as { libelle: string }).libelle,
                })),
              );
            }
          }),
          materielsApi.list({ actif: true, limit: 100 }).then((r) => {
            if (!cancelled) {
              setMateriels(
                r.data.map((m) => {
                  const item = m as { id: number; codeMateriel: string; designation: string };
                  return { id: item.id, label: `${item.codeMateriel} — ${item.designation}` };
                }),
              );
            }
          }),
        ];

        if (roleCode === 'ADMIN' || roleCode === 'CHEF_SERVICE') {
          requests.push(
            servicesApi.list({ actif: true, limit: 100 }).then((r) => {
              if (!cancelled) {
                setServices(
                  r.data.map((s) => ({
                    id: (s as { id: number; libelle: string }).id,
                    label: (s as { libelle: string }).libelle,
                  })),
                );
              }
            }),
          );
        }

        if (roleCode === 'ADMIN') {
          requests.push(
            utilisateursApi.list({ actif: true, limit: 100 }).then((r) => {
              if (!cancelled) {
                setUtilisateurs(
                  r.data.map((u) => {
                    const item = u as { id: number; prenom: string; nom: string; matricule: string };
                    return { id: item.id, label: `${item.prenom} ${item.nom} (${item.matricule})` };
                  }),
                );
              }
            }),
          );
        }

        await Promise.all(requests);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, roleCode]);

  return {
    categories,
    services,
    materiels,
    utilisateurs,
    loading,
    canPickUsers: roleCode === 'ADMIN',
  };
};
