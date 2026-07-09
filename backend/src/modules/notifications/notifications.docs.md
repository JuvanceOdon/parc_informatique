# Module Notifications — Documentation

## Description

Module Sprint 10 — Notifications utilisateur pour tickets, affectations, interventions, fin de maintenance et alertes système.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/notifications` | Auth | Liste paginée (filtres `type`, `lu`) |
| GET | `/api/v1/notifications/non-lues/count` | Auth | Compteur non lues |
| PATCH | `/api/v1/notifications/:id/lire` | Auth | Marquer comme lue |
| PATCH | `/api/v1/notifications/lire-toutes` | Auth | Tout marquer comme lu |
| DELETE | `/api/v1/notifications/:id` | Auth | Supprimer |
| POST | `/api/v1/notifications/alertes` | ADMIN, CHEF_SERVICE | Créer une alerte |

## Types de notification

| Type | Déclencheur |
|------|-------------|
| `NOUVEAU_TICKET` | Création d'un ticket |
| `AFFECTATION` | Affectation ou transfert de matériel |
| `INTERVENTION` | Démarrage d'une maintenance |
| `FIN_MAINTENANCE` | Clôture d'une maintenance (solution) |
| `ALERTE` | Alerte manuelle (admin/chef de service) |

## Règles métier

- Chaque utilisateur ne voit que ses propres notifications
- Notifications automatiques via `notificationDispatcher`
- Échec d'envoi loggé sans bloquer l'opération métier
- Alertes manuelles ciblent une liste d'utilisateurs actifs
