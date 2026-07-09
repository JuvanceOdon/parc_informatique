# Module Authentification — Documentation

## Description

Module Sprint 2 — Gestion de l'authentification JWT, des sessions (refresh tokens) et du profil utilisateur.

## Architecture

```
auth/
├── auth.controller.ts    # Points d'entrée HTTP
├── auth.service.ts       # Logique métier (login, logout, refresh, profil)
├── auth.repository.ts    # Accès base de données
├── auth.routes.ts        # Routes REST
├── auth.validation.ts    # Schémas Zod
├── auth.types.ts         # Types TypeScript
├── auth.interfaces.ts    # Contrats Repository / Service
└── auth.docs.md
```

## Endpoints

| Méthode | Route                    | Auth | Description                    |
|---------|--------------------------|------|--------------------------------|
| POST    | `/api/v1/auth/login`     | Non  | Connexion (matricule ou email) |
| POST    | `/api/v1/auth/refresh`   | Non  | Renouvellement du access token |
| POST    | `/api/v1/auth/logout`    | Oui  | Déconnexion (révocation token) |
| GET     | `/api/v1/auth/profile`   | Oui  | Profil de l'utilisateur connecté |

## Rôles disponibles

| Code           | Libellé          |
|----------------|------------------|
| ADMIN          | Administrateur   |
| CHEF_SERVICE   | Chef de service  |
| TECHNICIEN     | Technicien       |
| UTILISATEUR    | Utilisateur      |

## Middlewares

- `authenticate` — Vérifie le JWT Bearer et charge `req.user`
- `authorize(...roles)` — Contrôle d'accès par rôle

## Exemple — Login

**Requête :**
```json
POST /api/v1/auth/login
{
  "identifiant": "ADMIN001",
  "motDePasse": "Admin@123456"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { "id": 1, "matricule": "ADMIN001", "role": { "code": "ADMIN" } },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "uuid...",
      "expiresIn": "8h"
    }
  }
}
```

## Compte admin par défaut (seed)

| Champ      | Valeur              |
|------------|---------------------|
| Matricule  | ADMIN001            |
| Email      | admin@mfar.gov.mg   |
| Mot de passe | Admin@123456      |
| Rôle       | ADMIN               |
