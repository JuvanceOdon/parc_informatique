# Module Services — Documentation

## Description

Module Sprint 4 — CRUD des services, recherche, pagination et affectation des responsables.

## Endpoints

| Méthode | Route                              | Rôles              | Description                    |
|---------|------------------------------------|--------------------|--------------------------------|
| GET     | `/api/v1/services`                 | ADMIN, CHEF_SERVICE| Liste paginée + recherche      |
| GET     | `/api/v1/services/:id`             | ADMIN, CHEF_SERVICE| Détail d'un service            |
| POST    | `/api/v1/services`                 | ADMIN              | Création                       |
| PUT     | `/api/v1/services/:id`             | ADMIN              | Mise à jour                    |
| PATCH   | `/api/v1/services/:id/desactiver`  | ADMIN              | Désactivation                  |
| PATCH   | `/api/v1/services/:id/activer`     | ADMIN              | Activation                     |
| PATCH   | `/api/v1/services/:id/responsable` | ADMIN              | Affectation responsable        |
| DELETE  | `/api/v1/services/:id/responsable` | ADMIN              | Retrait du responsable         |

## Paramètres de liste

| Paramètre   | Description                              |
|-------------|------------------------------------------|
| `search`    | Recherche code, libellé, description     |
| `actif`     | Filtrer par statut                       |
| `page`      | Pagination                               |
| `limit`     | Taille de page                           |
| `sortBy`    | code, libelle, createdAt                 |
| `sortOrder` | asc ou desc                              |

## Règles métier

- Code service unique (stocké en majuscules)
- Responsable : utilisateur actif avec rôle `ADMIN` ou `CHEF_SERVICE`
- Affectation responsable → mise à jour du `serviceId` de l'utilisateur
- Impossible d'affecter un responsable à un service inactif

## Modèle

```
services
├── id
├── code (unique)
├── libelle
├── description
├── responsable_id → utilisateurs
├── actif
└── timestamps
```
