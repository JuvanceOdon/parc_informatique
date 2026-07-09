# Module Health — Documentation

## Description

Module d'infrastructure (Sprint 1) permettant de vérifier l'état de l'API et de la connexion PostgreSQL.

Ce module **n'est pas une fonctionnalité métier**. Il sert au monitoring et au déploiement.

## Architecture

```
health/
├── health.controller.ts   # Point d'entrée HTTP
├── health.service.ts      # Vérification état système + DB
├── health.routes.ts       # Route GET /
└── index.ts               # Exports publics
```

## Endpoint

| Méthode | Route              | Auth | Description                    |
|---------|--------------------|------|--------------------------------|
| GET     | `/api/v1/health`   | Non  | Health check API + base PostgreSQL |

## Réponse

- **200** : Système opérationnel, base connectée (`status: "ok"`)
- **503** : Système dégradé, base déconnectée (`status: "degraded"`)

## Exemple de réponse

```json
{
  "success": true,
  "message": "État du système",
  "data": {
    "status": "ok",
    "app": "Parc Informatique MFA",
    "environment": "development",
    "uptime": 120.5,
    "timestamp": "2026-07-09T06:31:26.472Z",
    "database": {
      "status": "connected"
    }
  },
  "timestamp": "2026-07-09T06:31:26.472Z"
}
```
