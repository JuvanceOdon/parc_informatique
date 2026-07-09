# Module Affectations — Documentation

## Description

Module Sprint 7 — Affectation de matériels aux utilisateurs, transfert, restitution et historique.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/affectations` | Auth | Liste paginée + filtres |
| GET | `/api/v1/affectations/:id` | Auth | Détail affectation |
| GET | `/api/v1/affectations/materiel/:materielId/active` | Auth | Affectation active |
| GET | `/api/v1/affectations/materiel/:materielId/historique` | Auth | Historique matériel |
| GET | `/api/v1/affectations/utilisateur/:utilisateurId` | Auth | Affectations utilisateur |
| POST | `/api/v1/affectations` | ADMIN, CHEF_SERVICE, TECHNICIEN | Nouvelle affectation |
| POST | `/api/v1/affectations/:id/transfert` | ADMIN, CHEF_SERVICE, TECHNICIEN | Transfert |
| PATCH | `/api/v1/affectations/:id/terminer` | ADMIN, CHEF_SERVICE, TECHNICIEN | Restitution |

## Statuts

- `ACTIVE` — Affectation en cours
- `TRANSFEREE` — Clôturée par transfert
- `TERMINEE` — Restitution du matériel

## Règles métier

- Un seul matériel activement affecté à la fois
- Affectation → matériel passe en `EN_SERVICE`
- Restitution → matériel repasse en `EN_STOCK`
- Transfert → clôture + nouvelle affectation
- Historique enregistré dans `affectations` et `materiel_historique`
