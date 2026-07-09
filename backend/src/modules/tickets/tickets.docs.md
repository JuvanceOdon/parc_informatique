# Module Tickets — Documentation

## Description

Module Sprint 8 — Gestion des tickets d'intervention : création, priorité, affectation, statuts, commentaires, pièces jointes et historique.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/tickets` | Auth | Liste paginée + filtres |
| GET | `/api/v1/tickets/:id` | Auth | Détail complet |
| POST | `/api/v1/tickets` | Auth | Création |
| PUT | `/api/v1/tickets/:id` | Auth | Mise à jour |
| PATCH | `/api/v1/tickets/:id/statut` | ADMIN, CHEF_SERVICE, TECHNICIEN | Changement statut |
| PATCH | `/api/v1/tickets/:id/priorite` | ADMIN, CHEF_SERVICE, TECHNICIEN | Changement priorité |
| PATCH | `/api/v1/tickets/:id/assigner` | ADMIN, CHEF_SERVICE, TECHNICIEN | Affectation technicien |
| GET | `/api/v1/tickets/:id/commentaires` | Auth | Liste commentaires |
| POST | `/api/v1/tickets/:id/commentaires` | Auth | Ajouter commentaire |
| POST | `/api/v1/tickets/:id/pieces-jointes` | Auth | Upload pièce jointe |
| DELETE | `/api/v1/tickets/:id/pieces-jointes/:pieceId` | Auth | Supprimer pièce jointe |
| GET | `/api/v1/tickets/:id/historique` | Auth | Historique complet |

## Priorités

- `BASSE`, `MOYENNE`, `HAUTE`, `CRITIQUE`

## Statuts

- `OUVERT` — Ticket créé
- `EN_COURS` — Prise en charge (assignation requise)
- `EN_ATTENTE` — En attente d'information
- `RESOLU` — Problème résolu
- `FERME` — Ticket clôturé
- `ANNULE` — Ticket annulé

## Règles métier

- Code auto `TKT-YYYY-NNNNN`
- UTILISATEUR : voit uniquement ses tickets (demandeur ou assigné)
- Staff : accès à tous les tickets
- Demandeur peut modifier tant que statut `OUVERT` ou `EN_ATTENTE`
- Assignation réservée au staff (technicien, chef de service, admin)
- Passage `EN_COURS` nécessite un assigné
- Historique complet dans `ticket_historique`

## Formats pièces jointes

JPEG, PNG, WebP, PDF, DOC, DOCX, TXT (taille max configurée via `UPLOAD_MAX_SIZE_MB`)
