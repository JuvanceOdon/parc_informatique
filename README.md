# Système d'Information de Gestion du Parc Informatique

Application professionnelle pour le **Ministère des Forces Armées**.

## Structure du projet

```
parcInformatique/
├── backend/     # API REST (Node.js + Express + TypeScript)
└── frontend/    # Interface React (Sprint 14)
```

## Lancement (racine)

Depuis la racine du projet :

```bash
# 1ère fois : installer les dépendances
npm run install:all
npm install

# Démarrer backend + frontend
npm run dev
```

Sous Windows, tu peux aussi :

- double-cliquer sur `start.bat`
- ou exécuter `.\start.ps1` (ajoute `-Install` pour réinstaller les deps)

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

Documentation complète : [`docs/GUIDE_COMPLET.md`](docs/GUIDE_COMPLET.md)

## Stack technique

- **Backend** : Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM, JWT, Zod
- **Frontend** : React, Vite, Material UI, Tailwind CSS (Sprint 14)
