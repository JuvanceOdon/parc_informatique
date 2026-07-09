# Architecture Backend — Parc Informatique MFA

## Vue d'ensemble

Application API REST modulaire construite avec **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL** et **Drizzle ORM**.

## Structure des dossiers

```
backend/
├── src/
│   ├── config/           # Configuration centralisée et variables d'environnement
│   ├── database/         # Connexion PostgreSQL, schémas Drizzle, seeds
│   ├── middlewares/      # Middlewares Express globaux
│   ├── modules/          # Modules métier (Controller, Service, Repository, Routes...)
│   ├── shared/           # Code partagé (errors, types, validation, constants)
│   ├── utils/            # Utilitaires (logger, réponses API, async handler)
│   ├── app.ts            # Configuration Express
│   └── server.ts         # Point d'entrée et démarrage
├── uploads/              # Fichiers uploadés (Sprint 6+)
├── logs/                 # Journaux applicatifs
├── docs/                 # Documentation technique
├── drizzle.config.ts     # Configuration Drizzle Kit
├── package.json
└── tsconfig.json
```

## Principes architecturaux

### Séparation des responsabilités

| Couche       | Responsabilité                                      |
|--------------|-----------------------------------------------------|
| Controller   | Réception des requêtes, appel du service, réponse   |
| Service      | Logique métier                                      |
| Repository   | Accès aux données (Drizzle ORM)                     |
| Validation   | Schémas Zod pour body, query, params                |
| Routes       | Définition des endpoints REST                       |

### Réponses API homogènes

**Succès :**
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 },
  "timestamp": "2026-07-09T00:00:00.000Z"
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Email invalide" }],
  "timestamp": "2026-07-09T00:00:00.000Z",
  "path": "/api/v1/..."
}
```

### Gestion des erreurs

- `AppError` : erreurs opérationnelles contrôlées
- `ZodError` : erreurs de validation automatiquement interceptées
- Middleware `errorHandler` centralisé
- Codes d'erreur standardisés (`ErrorCode`)

### Sécurité (infrastructure Sprint 1)

- Helmet (headers HTTP sécurisés)
- CORS configurable
- Rate limiting
- Validation stricte des variables d'environnement (Zod)
- Compression des réponses

## Modules

| Sprint | Module          | Statut      |
|--------|-----------------|-------------|
| 1      | Infrastructure  | ✅ Terminé  |
| 2      | Authentification| ✅ Terminé  |
| 3      | Utilisateurs    | ✅ Terminé  |
| 4      | Services        | ✅ Terminé  |
| 5      | Catégories      | ✅ Terminé  |
| 6      | Matériels       | ✅ Terminé  |
| 7      | Affectations    | ✅ Terminé  |
| 8      | Tickets         | ✅ Terminé  |
| 9      | Maintenances    | ✅ Terminé  |
| 10     | Notifications   | ✅ Terminé  |
| 11     | Dashboard       | ✅ Terminé  |
| 12     | Rapports        | ✅ Terminé  |
| 13     | Journal d'audit | ✅ Terminé  |
| 14     | Frontend        | ✅ Terminé  |
| 14+    | Frontend avancé | ✅ Terminé  |
| 15     | Tests backend   | ✅ Terminé  |
| 16     | Optimisation    | ⏳ À venir  |

## Scripts npm

| Commande         | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Démarrage en mode développement|
| `npm run build`  | Compilation TypeScript         |
| `npm start`      | Démarrage production           |
| `npm run typecheck` | Vérification des types      |
| `npm run db:generate` | Génération migrations Drizzle |
| `npm run db:migrate`  | Exécution des migrations    |
| `npm run db:push`     | Push schéma vers PostgreSQL |
| `npm run db:studio`   | Interface Drizzle Studio    |
