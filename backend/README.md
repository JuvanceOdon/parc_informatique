# Backend — Parc Informatique MFA

API REST du **Système d'Information de Gestion du Parc Informatique et de Suivi des Interventions Techniques**.

## Prérequis

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Installation

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables dans .env
```

## Configuration

Copier `.env.example` vers `.env` et adapter :

| Variable    | Description              |
|-------------|--------------------------|
| `PORT`      | Port du serveur (3000)   |
| `DB_*`      | Connexion PostgreSQL     |
| `JWT_SECRET`| Secret JWT (min. 32 car.)|
| `CORS_ORIGIN` | Origine frontend       |

## Démarrage

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## Endpoints disponibles (Sprint 1-3)

| Méthode | Route                              | Auth  | Description                    |
|---------|------------------------------------|-------|--------------------------------|
| GET     | `/`                                | Non   | Infos API                      |
| GET     | `/api/v1/health`                   | Non   | Health check                   |
| POST    | `/api/v1/auth/login`               | Non   | Connexion                      |
| POST    | `/api/v1/auth/refresh`             | Non   | Renouvellement token           |
| POST    | `/api/v1/auth/logout`              | Oui   | Déconnexion                    |
| GET     | `/api/v1/auth/profile`             | Oui   | Profil utilisateur             |
| GET     | `/api/v1/utilisateurs`             | ADMIN | Liste paginée                  |
| GET     | `/api/v1/utilisateurs/:id`         | ADMIN | Détail utilisateur             |
| POST    | `/api/v1/utilisateurs`             | ADMIN | Création                       |
| PUT     | `/api/v1/utilisateurs/:id`         | ADMIN | Mise à jour                    |
| PATCH   | `/api/v1/utilisateurs/:id/desactiver` | ADMIN | Désactivation               |
| PATCH   | `/api/v1/utilisateurs/:id/activer` | ADMIN | Activation                     |
| PATCH   | `/api/v1/utilisateurs/:id/role`    | ADMIN | Attribution rôle               |
| GET     | `/api/v1/services`                 | ADMIN, CHEF_SERVICE | Liste paginée      |
| GET     | `/api/v1/services/:id`             | ADMIN, CHEF_SERVICE | Détail service     |
| POST    | `/api/v1/services`                 | ADMIN | Création service               |
| PUT     | `/api/v1/services/:id`             | ADMIN | Mise à jour service            |
| PATCH   | `/api/v1/services/:id/desactiver`  | ADMIN | Désactivation service          |
| PATCH   | `/api/v1/services/:id/activer`     | ADMIN | Activation service             |
| PATCH   | `/api/v1/services/:id/responsable` | ADMIN | Affectation responsable        |
| DELETE  | `/api/v1/services/:id/responsable` | ADMIN | Retrait responsable            |
| GET     | `/api/v1/categories`               | Auth  | Liste catégories               |
| GET     | `/api/v1/categories/:id`           | Auth  | Détail catégorie               |
| POST    | `/api/v1/categories`               | ADMIN | Création catégorie             |
| PUT     | `/api/v1/categories/:id`           | ADMIN | Mise à jour catégorie          |
| DELETE  | `/api/v1/categories/:id`           | ADMIN | Suppression catégorie          |
| GET     | `/api/v1/materiels`                | Auth  | Liste matériels + filtres      |
| GET     | `/api/v1/materiels/:id`            | Auth  | Détail matériel                |
| GET     | `/api/v1/materiels/code/:code`     | Auth  | Matériel par code (QR)         |
| GET     | `/api/v1/materiels/:id/historique` | Auth  | Historique matériel            |
| GET     | `/api/v1/materiels/:id/qrcode`     | Auth  | QR Code base64                 |
| POST    | `/api/v1/materiels`                | ADMIN, CHEF_SERVICE, TECHNICIEN | Création |
| PUT     | `/api/v1/materiels/:id`            | ADMIN, CHEF_SERVICE, TECHNICIEN | Mise à jour |
| PATCH   | `/api/v1/materiels/:id/desactiver` | ADMIN, CHEF_SERVICE, TECHNICIEN | Désactivation |
| POST    | `/api/v1/materiels/:id/images`     | ADMIN, CHEF_SERVICE, TECHNICIEN | Upload image |
| DELETE  | `/api/v1/materiels/:id/images/:imageId` | ADMIN, CHEF_SERVICE, TECHNICIEN | Suppr. image |
| GET     | `/api/v1/affectations`             | Auth  | Liste affectations             |
| GET     | `/api/v1/affectations/:id`         | Auth  | Détail affectation             |
| GET     | `/api/v1/affectations/materiel/:materielId/active` | Auth | Affectation active |
| GET     | `/api/v1/affectations/materiel/:materielId/historique` | Auth | Historique |
| GET     | `/api/v1/affectations/utilisateur/:utilisateurId` | Auth | Par utilisateur |
| POST    | `/api/v1/affectations`             | ADMIN, CHEF_SERVICE, TECHNICIEN | Affecter |
| POST    | `/api/v1/affectations/:id/transfert` | ADMIN, CHEF_SERVICE, TECHNICIEN | Transfert |
| PATCH   | `/api/v1/affectations/:id/terminer` | ADMIN, CHEF_SERVICE, TECHNICIEN | Restituer |

## Initialisation base de données

```bash
npm run db:setup        # generate + migrate + seed (recommandé)
npm run test            # Tests Vitest + Supertest
npm run test:watch      # Tests en mode watch
# ou étape par étape :
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Documentation

Voir [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) pour l'architecture détaillée.
