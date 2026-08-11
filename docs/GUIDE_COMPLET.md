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
7. [Guide de démonstration](#7-guide-de-démonstration)
8. [Architecture](#8-architecture)
9. [Backend — API REST](#9-backend--api-rest)
10. [Frontend — Interface React](#10-frontend--interface-react)
11. [Base de données](#11-base-de-données)
12. [Tests](#12-tests)
13. [Dépannage](#13-dépannage)
14. [Production](#14-production)
15. [Feuille de route](#15-feuille-de-route)

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

> **Fichier dédié :** [`COMPTES_DEMO.md`](./COMPTES_DEMO.md) — liste complète des comptes, scénario métier et commande de réinitialisation.

Réinitialiser le jeu de démo :

```bash
cd backend
npm run db:demo
```

### Comptes principaux

| Persona | Matricule | Mot de passe | Rôle |
|---------|-----------|--------------|------|
| Administrateur | `ADMIN001` | `Admin@123456` | `ADMIN` |
| Responsable informatique | `RESP001` | `Demo@123456` | `CHEF_SERVICE` |
| Chef RH | `CHEF001` | `Demo@123456` | `CHEF_SERVICE` |
| Chef logistique | `CHEF002` | `Demo@123456` | `CHEF_SERVICE` |
| Technicien | `TECH001` / `TECH002` | `Demo@123456` | `TECHNICIEN` |
| Utilisateur | `USER001` / `USER002` / `USER003` | `Demo@123456` | `UTILISATEUR` |

Connexion possible avec le **matricule** ou l’**email** (voir `COMPTES_DEMO.md`).

> **Note :** le responsable informatique est un **chef de service** rattaché au Service Informatique. L’administrateur (`ADMIN`) conserve l’accès exclusif aux utilisateurs et au journal d’audit.

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

## 7. Guide de démonstration

Scénario recommandé pour présenter l’application de bout en bout (~20–30 min).  
Prérequis : backend + frontend démarrés (section 5) et seed exécuté.

**URL :** http://localhost:5173

### Étape 0 — Préparation

1. Vérifier l’API : http://localhost:3000/api/v1/health
2. Ouvrir l’application dans le navigateur
3. Avoir sous la main les 5 comptes de la section 6

---

### Étape 1 — Connexion administrateur

**Compte :** `ADMIN001` / `Admin@123456`

1. Sur la page de connexion, saisir le matricule `ADMIN001` (ou l’email) et le mot de passe
2. Cliquer sur **Se connecter**
3. Vérifier l’arrivée sur le **Tableau de bord** (KPI, graphiques)
4. Dans la barre latérale, constater les menus exclusifs admin : **Utilisateurs**, **Journal d’audit**

**Points à montrer :** branding MFA, menu complet, identité en bas de la sidebar.

---

### Étape 2 — Administration (utilisateurs & services)

Toujours connecté en **ADMIN**.

#### 2.1 Utilisateurs

1. Aller dans **Utilisateurs**
2. Rechercher `RESP001`, `CHEF001`, `TECH001`, `USER001` pour montrer les comptes seedés
3. (Optionnel) Créer un nouvel utilisateur de test :
   - Matricule, email, nom, prénom, mot de passe, rôle, service
   - Enregistrer puis vérifier qu’il apparaît dans la liste

#### 2.2 Services

1. Aller dans **Services**
2. Présenter les 3 services seedés : Informatique, RH, Logistique
3. Ouvrir le **Service Informatique** et montrer que le responsable est **Rakoto Jean** (`RESP001`)
4. Ouvrir **Ressources Humaines** et montrer le responsable **Rasoanaivo Marie** (`CHEF001`)

#### 2.3 Catégories

1. Aller dans **Catégories**
2. Montrer les catégories seedées (Ordinateur, Imprimante, Serveur, etc.)

#### 2.4 Journal d’audit

1. Aller dans **Journal d’audit**
2. Montrer les traces de connexion / actions déjà enregistrées

---

### Étape 3 — Cycle matériel (responsable informatique)

1. Se déconnecter (**Paramètres** → déconnexion, ou déconnexion depuis le profil)
2. Se connecter avec **`RESP001`** / `Demo@123456`
3. Vérifier : pas de menu **Utilisateurs** ni **Journal d’audit** ; accès **Services**, **Rapports**, etc.

#### 3.1 Créer un matériel

1. Aller dans **Matériels** → **Nouveau** (ou bouton de création)
2. Remplir par exemple :
   - Désignation : `PC Portable Dell Latitude`
   - Catégorie : Ordinateur
   - Service : Service Informatique
   - Statut : En stock
   - État : Neuf
   - Dates de garantie (optionnel)
3. Enregistrer
4. Ouvrir la fiche **détail** : infos, historique, QR code

#### 3.2 Affecter le matériel

1. Aller dans **Affectations** → créer une affectation
2. Choisir le matériel créé, l’utilisateur `USER001` (Sophie Razafy), le service RH
3. Localisation / motif : ex. `Bureau RH - Bureau 12` / `Affectation initiale`
4. Valider
5. Retourner sur le matériel : statut passé en **En service**

**Points à montrer :** lien inventaire ↔ utilisateur, traçabilité.

---

### Étape 4 — Demande d’intervention (utilisateur simple)

1. Se déconnecter, se connecter avec **`USER001`** / `Demo@123456`
2. Montrer un menu restreint (pas de Maintenances / Rapports / Services / Utilisateurs)
3. Aller dans **Tickets** → créer un ticket :
   - Titre : `Écran qui clignote`
   - Description : `Le portable affecté affiche un écran qui clignote depuis ce matin`
   - Priorité : Haute
   - Lier le matériel affecté si proposé
4. Enregistrer et ouvrir le **détail** du ticket (statut **Ouvert**)
5. (Optionnel) Ajouter un commentaire : `Problème récurrent depuis hier`

**Points à montrer :** parcours métier du demandeur, simplicité du formulaire.

---

### Étape 5 — Traitement technique (technicien)

1. Se déconnecter, se connecter avec **`TECH001`** / `Demo@123456`
2. Aller dans **Tickets**, ouvrir le ticket créé
3. **Assigner** le ticket au technicien (soi-même) et passer le statut à **En cours**
4. Ajouter un commentaire technique : `Diagnostic en cours — carte graphique suspectée`
5. Aller dans **Maintenances** → créer une maintenance :
   - Type : Corrective
   - Matériel / ticket lié
   - Technicien : `TECH001`
   - Date planifiée ou démarrage immédiat
6. Enchaîner le cycle :
   - **Démarrer** (si planifiée) → statut En cours
   - Saisir un **diagnostic**
   - Saisir une **solution** puis terminer
7. Revenir au ticket : passer en **Résolu** puis **Fermé**

**Points à montrer :** continuum ticket → maintenance → résolution, historique.

---

### Étape 6 — Vue chef de service (RH)

1. Se déconnecter, se connecter avec **`CHEF001`** / `Demo@123456`
2. Tableau de bord : KPI mis à jour (matériels, tickets)
3. **Services** : consulter son service RH
4. **Affectations** / **Tickets** : vue d’ensemble opérationnelle
5. **Rapports** : télécharger un rapport **mensuel** ou **annuel** (PDF et/ou Excel)

**Points à montrer :** pilotage sans droits d’administration système.

---

### Étape 7 — Synthèse admin (clôture)

1. Se reconnecter en **`ADMIN001`**
2. **Tableau de bord** : synthèse globale
3. **Journal d’audit** : connexions et actions des différents acteurs
4. **Rapports** : export de synthèse pour la présentation

---

### Scénario court (5–8 min)

Si le temps est limité :

| # | Action | Compte |
|---|--------|--------|
| 1 | Login + dashboard + utilisateurs | `ADMIN001` |
| 2 | Créer un matériel + affectation | `RESP001` |
| 3 | Créer un ticket | `USER001` |
| 4 | Traiter le ticket / maintenance | `TECH001` |
| 5 | Télécharger un rapport | `CHEF001` ou `ADMIN001` |

---

### Checklist de démonstration

- [ ] Connexion / déconnexion multi-rôles
- [ ] Différences de menus selon le rôle
- [ ] Création matériel + fiche détail + QR
- [ ] Affectation utilisateur
- [ ] Cycle de vie ticket (ouvert → en cours → résolu → fermé)
- [ ] Maintenance corrective liée
- [ ] Export rapport PDF/Excel
- [ ] Journal d’audit (admin)

---

## 8. Architecture

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

## 9. Backend — API REST

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

## 10. Frontend — Interface React

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

## 11. Base de données

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

## 12. Tests

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

## 13. Dépannage

| Problème | Solution |
|----------|----------|
| `ECONNREFUSED` API | Vérifier que le backend tourne sur le port 3000 |
| Erreur CORS | `CORS_ORIGIN=http://localhost:5173` dans `backend/.env` |
| Login échoue (admin) | Exécuter `npm run db:seed` ; mot de passe admin = `Admin@123456` |
| Login échoue (RESP/CHEF/TECH/USER) | Exécuter `npm run db:seed` ; mot de passe démo = `Demo@123456` |
| Page blanche | Ouvrir la console navigateur, vérifier `npm run build` |
| Liste utilisateurs vide (affectation) | Seuls les ADMIN voient la liste ; les autres saisissent l'ID utilisateur |
| Token expiré | Se reconnecter ; le refresh automatique gère la plupart des cas |

---

## 14. Production

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

## 15. Feuille de route

| Sprint | Module | Statut |
|--------|--------|--------|
| 1–13 | Backend complet | ✅ |
| 14 | Frontend base | ✅ |
| 14+ | Formulaires avancés, pages détail, tests, code-splitting | ✅ |
| 15 | Tests backend (Vitest/Supertest) | ✅ |
| 16 | Optimisation et déploiement | ⏳ |

---

## Ressources

- **Chapitre 5 — Analyse conceptuelle (Scrum / UML)** : [`CHAPITRE_5_ANALYSE_CONCEPTUELLE.md`](./CHAPITRE_5_ANALYSE_CONCEPTUELLE.md)
- **Chronogramme de stage (PlantUML)** : [`CHRONOGRAMME_STAGE.md`](./CHRONOGRAMME_STAGE.md) / [`CHRONOGRAMME_STAGE.puml`](./CHRONOGRAMME_STAGE.puml)
- **Manuel de démonstration** : [`MANUEL_DEMO.md`](./MANUEL_DEMO.md)
- Comptes et données démo : [`COMPTES_DEMO.md`](./COMPTES_DEMO.md)
- Architecture backend : [`backend/docs/ARCHITECTURE.md`](../backend/docs/ARCHITECTURE.md)
- README backend : [`backend/README.md`](../backend/README.md)
- README frontend : [`frontend/README.md`](../frontend/README.md)

---

*Document généré pour le projet Parc Informatique MFA — 2026*
