# Guide complet — Parc Informatique MFA

**Système d'Information de Gestion du Parc Informatique et de Suivi des Interventions Techniques**  
Ministère des Forces Armées — Madagascar

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Démarrage](#5-démarrage)
6. [Comptes et rôles](#6-comptes-et-rôles)
7. [Architecture](#7-architecture)
8. [Backend — API REST](#8-backend--api-rest)
9. [Frontend — Interface React](#9-frontend--interface-react)
10. [Base de données](#10-base-de-données)
11. [Tests](#11-tests)
12. [Dépannage](#12-dépannage)
13. [Production](#13-production)
14. [Feuille de route](#14-feuille-de-route)

---

## 1. Vue d'ensemble

Application full-stack pour gérer :

- L'inventaire du parc informatique (matériels, catégories, services)
- Les affectations matériel ↔ utilisateur
- Les tickets d'intervention technique
- Les maintenances préventives et correctives
- Les notifications, rapports PDF/Excel et journal d'audit

```
parcInformatique/
├── backend/          # API REST (Node.js + Express + TypeScript + PostgreSQL)
├── frontend/         # Interface React (Vite + MUI + Tailwind)
└── docs/             # Documentation (ce guide)
```

---

## 2. Prérequis

| Outil        | Version minimale |
|--------------|------------------|
| Node.js      | 20+              |
| npm          | 10+              |
| PostgreSQL   | 14+              |
| Git          | (optionnel)      |

---

## 3. Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

### Frontend

```bash
cd frontend
npm install
```

Le fichier `frontend/.env` contient déjà :

```
VITE_API_URL=/api/v1
```

Le proxy Vite redirige `/api` vers `http://localhost:3000`.

---

## 4. Configuration

### Backend (`backend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port API | `3000` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `postgres` |
| `DB_NAME` | Nom de la base | `parc_informatique` |
| `JWT_SECRET` | Secret JWT (≥ 32 car.) | *(voir .env.example)* |
| `JWT_EXPIRES_IN` | Durée access token | `8h` |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token | `7d` |
| `CORS_ORIGIN` | URL frontend | `http://localhost:5173` |

### Créer la base PostgreSQL

```sql
CREATE DATABASE parc_informatique;
```

Puis initialiser le schéma et les données :

```bash
cd backend
npm run db:setup
```

Cette commande exécute : `db:generate` → `db:migrate` → `db:seed`.

---

## 5. Démarrage

**Terminal 1 — Backend :**

```bash
cd backend
npm run dev
```

→ API : http://localhost:3000/api/v1/health

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

→ Application : http://localhost:5173

---

## 6. Comptes et rôles

### Compte administrateur (seed)

| Champ | Valeur |
|-------|--------|
| Matricule | `ADMIN001` |
| Email | `admin@mfar.gov.mg` |
| Mot de passe | `Admin@123456` |

### Rôles

| Code | Libellé | Droits principaux |
|------|---------|-------------------|
| `ADMIN` | Administrateur | Accès complet, utilisateurs, audit |
| `CHEF_SERVICE` | Chef de service | Services, rapports, gestion opérationnelle |
| `TECHNICIEN` | Technicien | Matériels, tickets, maintenances, rapports |
| `UTILISATEUR` | Utilisateur | Consultation, création de tickets |

### Matrice d'accès frontend

| Module | ADMIN | CHEF_SERVICE | TECHNICIEN | UTILISATEUR |
|--------|:-----:|:------------:|:----------:|:-----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Matériels | ✅ | ✅ | ✅ | ✅ (lecture) |
| Tickets | ✅ | ✅ | ✅ | ✅ |
| Affectations | ✅ | ✅ | ✅ | ✅ (lecture) |
| Maintenances | ✅ | ✅ | ✅ | ❌ |
| Rapports | ✅ | ✅ | ✅ | ❌ |
| Services | ✅ | ✅ | ❌ | ❌ |
| Utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Journal audit | ✅ | ❌ | ❌ | ❌ |

---

## 7. Architecture

### Backend — couches

```
Requête HTTP
    ↓
Routes → Validation (Zod) → Controller → Service → Repository → PostgreSQL
    ↓
Middlewares : auth, authorize, errorHandler, rateLimit, helmet, CORS
```

### Frontend — structure

```
src/
├── api/              # Client Axios + services par module
├── components/       # UI réutilisable + formulaires avancés
├── contexts/         # AuthContext (JWT + refresh)
├── hooks/            # usePaginatedList, useLookupOptions
├── layout/           # Sidebar, TopBar, AppLayout
├── pages/            # Pages par module + pages détail
├── theme/            # Thème MUI (bleu marine / or)
└── types/            # Types TypeScript
```

### Authentification

1. `POST /auth/login` → access + refresh tokens (localStorage)
2. Intercepteur Axios ajoute `Authorization: Bearer <token>`
3. Sur 401 → refresh automatique via `POST /auth/refresh`
4. Échec refresh → redirection `/login`

---

## 8. Backend — API REST

Base URL : **`http://localhost:3000/api/v1`**

### Format de réponse

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
  "message": "Description",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Email invalide" }]
}
```

### Modules disponibles

| Préfixe | Description |
|---------|-------------|
| `/health` | Santé de l'API |
| `/auth` | Login, logout, refresh, profil |
| `/utilisateurs` | CRUD utilisateurs (ADMIN) |
| `/services` | Gestion des services |
| `/categories` | Catégories de matériels |
| `/materiels` | Inventaire + historique + QR |
| `/affectations` | Affectation, transfert, restitution |
| `/tickets` | Tickets + commentaires + historique |
| `/maintenances` | Interventions techniques |
| `/notifications` | Alertes utilisateur |
| `/dashboard` | KPI et graphiques |
| `/rapports` | PDF / Excel mensuel et annuel |
| `/journal-audit` | Traçabilité (ADMIN) |

### Pagination (listes)

Query params communs : `page`, `limit` (max 100), `search`, `sortBy`, `sortOrder`.

---

## 9. Frontend — Interface React

### Pages principales

| Route | Page | Fonctionnalités |
|-------|------|-----------------|
| `/login` | Connexion | Authentification JWT |
| `/` | Dashboard | KPI + graphiques Recharts |
| `/materiels` | Liste matériels | Recherche, création (staff), lien détail |
| `/materiels/:id` | Détail matériel | Infos, garantie, historique, édition |
| `/tickets` | Liste tickets | Création, lien détail |
| `/tickets/:id` | Détail ticket | Commentaires, historique, changement statut |
| `/affectations` | Affectations | Création, transfert, restitution |
| `/maintenances` | Maintenances | Création avec planification |
| `/rapports` | Rapports | Téléchargement PDF/Excel |
| `/parametres` | Paramètres | Profil + déconnexion |

### Formulaires avancés

- **Matériel** : désignation, catégorie, service, statut, état, dates garantie
- **Affectation** : matériel, utilisateur, service, localisation, motif
- **Maintenance** : type, technicien, ticket lié, date planifiée, démarrage immédiat

### Code-splitting

Les pages sont chargées en **lazy loading** (`React.lazy` + `Suspense`). Chaque module est un chunk séparé (~2–5 Ko par page, dashboard ~400 Ko avec Recharts).

### Scripts frontend

```bash
npm run dev        # Développement (port 5173)
npm run build      # Build production
npm run preview    # Prévisualiser le build
npm run test       # Tests Vitest
npm run test:watch # Tests en mode watch
```

---

## 10. Base de données

### Scripts backend

| Commande | Action |
|--------|--------|
| `npm run db:setup` | Generate + migrate + seed |
| `npm run db:generate` | Générer migrations Drizzle |
| `npm run db:migrate` | Appliquer migrations |
| `npm run db:seed` | Insérer données initiales |
| `npm run db:studio` | Interface Drizzle Studio |

### Tables principales

`roles`, `utilisateurs`, `services`, `categories`, `materiels`, `affectations`, `tickets`, `maintenances`, `notifications`, `journal_audit`

---

## 11. Tests

### Backend (Vitest + Supertest)

```bash
cd backend
npm run test
```

Tests couverts :
- **Unitaires** : `response.util`, `ticket.constants`
- **Auth** : login, profil, refresh, logout
- **Health** : `/`, `/api/v1/health`
- **CRUD** : catégories, services, utilisateurs
- **Métier** : matériels (+ historique, QR), tickets (+ commentaires, assignation, statut), affectations (+ transfert/restitution), maintenances
- **Transverse** : notifications, dashboard, journal audit, rapports PDF/Excel

**69 tests** — exécution séquentielle (base PostgreSQL requise).

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm run test
```

Tests couverts :
- `getErrorMessage` — extraction erreurs API
- `PageHeader` — rendu composant
- `LoginPage` — formulaire de connexion

### Backend

```bash
cd backend
npm run typecheck   # Vérification TypeScript
npm run test        # Tests Vitest + Supertest (69 tests)
npm run test:watch  # Mode watch
```

---

## 12. Dépannage

| Problème | Solution |
|----------|----------|
| `ECONNREFUSED` API | Vérifier que le backend tourne sur le port 3000 |
| Erreur CORS | `CORS_ORIGIN=http://localhost:5173` dans `backend/.env` |
| Login échoue | Exécuter `npm run db:setup` pour recréer l'admin |
| Page blanche | Ouvrir la console navigateur, vérifier `npm run build` |
| Liste utilisateurs vide (affectation) | Seuls les ADMIN voient la liste ; les autres saisissent l'ID utilisateur |
| Token expiré | Se reconnecter ; le refresh automatique gère la plupart des cas |

---

## 13. Production

### Backend

```bash
cd backend
npm run build
NODE_ENV=production npm start
```

Variables à adapter : `JWT_SECRET` fort, `DB_*` production, `CORS_ORIGIN` = URL frontend déployée.

### Frontend

```bash
cd frontend
npm run build
```

Servir le dossier `frontend/dist/` via Nginx, Apache ou un CDN. Configurer le reverse proxy :

```
/api → http://backend:3000/api
/    → frontend/dist (SPA)
```

---

## 14. Feuille de route

| Sprint | Module | Statut |
|--------|--------|--------|
| 1–13 | Backend complet | ✅ |
| 14 | Frontend base | ✅ |
| 14+ | Formulaires avancés, pages détail, tests, code-splitting | ✅ |
| 15 | Tests backend (Vitest/Supertest) | ✅ |
| 16 | Optimisation et déploiement | ⏳ |

---

## Ressources

- Architecture backend : [`backend/docs/ARCHITECTURE.md`](../backend/docs/ARCHITECTURE.md)
- README backend : [`backend/README.md`](../backend/README.md)
- README frontend : [`frontend/README.md`](../frontend/README.md)

---

*Document généré pour le projet Parc Informatique MFA — 2026*
