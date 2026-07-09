# Module Maintenances — Documentation

## Description

Module Sprint 9 — Gestion des maintenances préventives et correctives : diagnostic, solution, historique et mise à jour de l'état du matériel.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/maintenances` | Auth | Liste paginée + filtres |
| GET | `/api/v1/maintenances/:id` | Auth | Détail maintenance |
| GET | `/api/v1/maintenances/materiel/:materielId/active` | Auth | Maintenance active |
| GET | `/api/v1/maintenances/materiel/:materielId/historique` | Auth | Historique par matériel |
| GET | `/api/v1/maintenances/:id/historique` | Auth | Historique détaillé |
| POST | `/api/v1/maintenances` | ADMIN, CHEF_SERVICE, TECHNICIEN | Création |
| PUT | `/api/v1/maintenances/:id` | ADMIN, CHEF_SERVICE, TECHNICIEN | Mise à jour (planifiée) |
| PATCH | `/api/v1/maintenances/:id/demarrer` | ADMIN, CHEF_SERVICE, TECHNICIEN | Démarrage |
| PATCH | `/api/v1/maintenances/:id/diagnostic` | ADMIN, CHEF_SERVICE, TECHNICIEN | Enregistrer diagnostic |
| PATCH | `/api/v1/maintenances/:id/solution` | ADMIN, CHEF_SERVICE, TECHNICIEN | Enregistrer solution |
| PATCH | `/api/v1/maintenances/:id/annuler` | ADMIN, CHEF_SERVICE, TECHNICIEN | Annulation |

## Types

- `PREVENTIVE` — Maintenance planifiée
- `CORRECTIVE` — Intervention suite à incident (lien ticket optionnel)

## Statuts

- `PLANIFIEE` — Créée, pas encore démarrée
- `EN_COURS` — Intervention en cours
- `DIAGNOSTIC` — Diagnostic enregistré
- `TERMINEE` — Solution appliquée
- `ANNULEE` — Annulée

## Règles métier

- Code auto `MNT-YYYY-NNNNN`
- Une seule maintenance active par matériel
- Démarrage → matériel passe en `EN_MAINTENANCE`
- Solution → mise à jour `etat` et `statut` du matériel (défaut : `EN_SERVICE` si affecté, sinon `EN_STOCK`)
- Annulation → restauration de l'état matériel avant maintenance
- Historique dans `maintenance_historique` et `materiel_historique`
