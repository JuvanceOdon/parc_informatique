# Module Catégories — Documentation

## Description

Module Sprint 5 — CRUD des catégories de matériels et recherche.

## Endpoints

| Méthode | Route                      | Rôles                              | Description           |
|---------|----------------------------|------------------------------------|-----------------------|
| GET     | `/api/v1/categories`       | Tous (authentifiés)                | Liste + recherche     |
| GET     | `/api/v1/categories/:id`   | Tous (authentifiés)                | Détail                |
| POST    | `/api/v1/categories`       | ADMIN                              | Création              |
| PUT     | `/api/v1/categories/:id`   | ADMIN                              | Mise à jour           |
| DELETE  | `/api/v1/categories/:id`   | ADMIN                              | Suppression           |

## Paramètres de liste

| Paramètre   | Description                          |
|-------------|--------------------------------------|
| `search`    | Recherche code, libellé, description |
| `actif`     | Filtrer par statut                   |
| `page`      | Pagination                           |
| `limit`     | Taille de page                       |
| `sortBy`    | code, libelle, createdAt             |
| `sortOrder` | asc ou desc                          |

## Règles métier

- Code unique (stocké en majuscules)
- Champ `actif` modifiable via PUT (préparation Sprint 6 matériels)
