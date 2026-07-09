# Module Rapports — Documentation

## Description

Module Sprint 12 — Génération de rapports mensuels et annuels en PDF et Excel, avec support impression (PDF inline).

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/rapports/mensuel` | ADMIN, CHEF_SERVICE, TECHNICIEN | Rapport mensuel |
| GET | `/api/v1/rapports/annuel` | ADMIN, CHEF_SERVICE, TECHNICIEN | Rapport annuel |

## Query params

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `annee` | number | requis | Année du rapport |
| `mois` | number (1-12) | requis (mensuel) | Mois du rapport |
| `format` | `pdf` \| `excel` | `pdf` | Format de sortie |
| `impression` | boolean | `false` | PDF en inline (impression navigateur) |

## Exemples

```
GET /api/v1/rapports/mensuel?annee=2026&mois=7&format=pdf
GET /api/v1/rapports/mensuel?annee=2026&mois=7&format=excel
GET /api/v1/rapports/mensuel?annee=2026&mois=7&format=pdf&impression=true
GET /api/v1/rapports/annuel?annee=2026&format=excel
```

## Contenu des rapports

1. **Synthèse du parc** — KPI actuels (matériels, disponibilité, tickets, maintenances)
2. **Activité de la période** — tickets, maintenances, affectations
3. **Détail tickets** — liste (jusqu'à 50 entrées)
4. **Détail maintenances** — liste (jusqu'à 50 entrées)

## Formats

- **PDF** — PDFKit, mise en page A4, compatible impression (`impression=true`)
- **Excel** — ExcelJS, onglets Synthèse / Tickets / Maintenances
