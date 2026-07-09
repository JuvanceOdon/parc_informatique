# Module Utilisateurs — Documentation

## Description

Module Sprint 3 — CRUD des utilisateurs, recherche, pagination, désactivation et attribution des rôles.

## Endpoints (ADMIN uniquement)

| Méthode | Route                              | Description                          |
|---------|------------------------------------|--------------------------------------|
| GET     | `/api/v1/utilisateurs`             | Liste paginée + recherche + filtres  |
| GET     | `/api/v1/utilisateurs/:id`         | Détail d'un utilisateur              |
| POST    | `/api/v1/utilisateurs`             | Création                             |
| PUT     | `/api/v1/utilisateurs/:id`         | Mise à jour                          |
| PATCH   | `/api/v1/utilisateurs/:id/desactiver` | Désactivation                     |
| PATCH   | `/api/v1/utilisateurs/:id/activer` | Réactivation                         |
| PATCH   | `/api/v1/utilisateurs/:id/role`    | Attribution d'un rôle                |

## Paramètres de liste (query)

| Paramètre | Type    | Description                              |
|-----------|---------|------------------------------------------|
| `page`    | number  | Page (défaut: 1)                         |
| `limit`   | number  | Éléments par page (défaut: 10, max: 100) |
| `search`  | string  | Recherche nom, prénom, email, matricule  |
| `actif`   | boolean | Filtrer par statut actif                 |
| `roleId`  | number  | Filtrer par rôle                         |
| `sortBy`  | string  | nom, prenom, email, matricule, createdAt  |
| `sortOrder` | string | asc ou desc                            |

## Règles métier

- Email et matricule uniques
- Mot de passe hashé avec bcrypt à la création/modification
- Impossible de désactiver son propre compte
- Impossible de désactiver ou rétrograder le dernier ADMIN actif
- Révocation des refresh tokens lors d'un changement de rôle ou mot de passe
