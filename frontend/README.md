# Frontend — Parc Informatique MFA

Interface React (Vite + TypeScript + Material UI + Tailwind CSS).

## Démarrage

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur **http://localhost:5173**. Les appels API sont proxifiés vers le backend (`http://localhost:3000`).

## Comptes de test

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Admin | `ADMIN001` ou `admin@mfar.gov.mg` | `Admin@123456` |

## Structure

```
frontend/src/
├── api/           # Client Axios et services API
├── components/    # Composants réutilisables
├── constants/     # Libellés et constantes UI
├── contexts/      # AuthContext
├── hooks/         # Hooks partagés
├── layout/        # Sidebar, TopBar, AppLayout
├── pages/         # Pages par module
├── theme/         # Thème Material UI
└── types/         # Types TypeScript
```

## Modules disponibles

- Authentification (login / logout / refresh token)
- Tableau de bord (KPI + graphiques Recharts)
- Utilisateurs, Services, Catégories, Matériels (+ détail + historique)
- Affectations (création, transfert, restitution)
- Tickets (+ détail, commentaires, historique)
- Maintenances (formulaire avancé)
- Rapports PDF/Excel, Journal d'audit
- Notifications (TopBar), Paramètres
- Code-splitting (lazy loading par page)
- Tests Vitest + React Testing Library

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build production |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Lancer les tests |
| `npm run test:watch` | Tests en mode watch |
