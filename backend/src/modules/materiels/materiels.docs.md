# Module Matériels — Documentation

## Description

Module Sprint 6 — CRUD matériels, code auto-généré, QR Code, garantie, localisation, images et historique.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/materiels` | Auth | Liste + filtres |
| GET | `/api/v1/materiels/:id` | Auth | Détail |
| GET | `/api/v1/materiels/code/:code` | Auth | Recherche par code (QR) |
| GET | `/api/v1/materiels/:id/historique` | Auth | Historique |
| GET | `/api/v1/materiels/:id/qrcode` | Auth | QR Code (base64) |
| POST | `/api/v1/materiels` | ADMIN, CHEF_SERVICE, TECHNICIEN | Création |
| PUT | `/api/v1/materiels/:id` | ADMIN, CHEF_SERVICE, TECHNICIEN | Mise à jour |
| PATCH | `/api/v1/materiels/:id/desactiver` | ADMIN, CHEF_SERVICE, TECHNICIEN | Désactivation |
| POST | `/api/v1/materiels/:id/images` | ADMIN, CHEF_SERVICE, TECHNICIEN | Upload image |
| DELETE | `/api/v1/materiels/:id/images/:imageId` | ADMIN, CHEF_SERVICE, TECHNICIEN | Supprimer image |

## Code matériel

Format auto-généré : `MAT-YYYY-NNNNN` (ex: `MAT-2026-00001`)

## Filtres

`search`, `categorieId`, `serviceId`, `statut`, `etat`, `actif`, `garantieExpiree`, `garantieExpireBientot`

## Statuts

`EN_STOCK`, `EN_SERVICE`, `EN_MAINTENANCE`, `HORS_SERVICE`, `REFORME`

## États

`NEUF`, `BON`, `MOYEN`, `MAUVAIS`

## Upload images

- Form-data : `image` (fichier), `isPrincipal` (optionnel)
- Formats : jpeg, png, webp
- Accès : `/uploads/materiels/{filename}`
