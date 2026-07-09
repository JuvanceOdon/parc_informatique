# Module Journal d'audit — Documentation

## Description

Module Sprint 13 — Traçabilité des connexions, modifications, suppressions et exports.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/journal-audit` | ADMIN, CHEF_SERVICE | Liste paginée + filtres |
| GET | `/api/v1/journal-audit/:id` | ADMIN, CHEF_SERVICE | Détail entrée |
| GET | `/api/v1/journal-audit/export` | ADMIN, CHEF_SERVICE | Export CSV/Excel |

## Actions tracées

| Action | Exemples |
|--------|----------|
| `CONNEXION` | Login réussi |
| `DECONNEXION` | Logout |
| `CREATION` | Utilisateur, catégorie, matériel |
| `MODIFICATION` | Mise à jour entités |
| `SUPPRESSION` | Suppression catégorie, pièce jointe, désactivation |
| `EXPORT` | Rapports, journal d'audit |

## Filtres

- `action`, `categorie`, `utilisateurId`
- `dateDebut`, `dateFin` (ISO 8601)
- `search` (description, utilisateur, IP)

## Export

```
GET /api/v1/journal-audit/export?format=csv
GET /api/v1/journal-audit/export?format=excel&action=CONNEXION
```
