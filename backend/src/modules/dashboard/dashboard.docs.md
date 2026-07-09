# Module Dashboard — Documentation

## Description

Module Sprint 11 — Tableau de bord avec statistiques, KPI, répartitions et données graphiques.

## Endpoints

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/v1/dashboard` | Auth | Tableau de bord complet |
| GET | `/api/v1/dashboard/kpi` | Auth | KPI uniquement |

## Query params

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `months` | number (3-24) | 12 | Période pour les graphiques mensuels |

## Contenu du tableau de bord

### KPI

- Totaux matériels, tickets, maintenances, affectations, utilisateurs
- **Taux de disponibilité** = (EN_SERVICE + EN_STOCK) / matériels actifs × 100
- Garanties expirant sous 30 jours

### Répartitions

- Matériels : par statut, état, catégorie, service
- Tickets : par statut, priorité

### Graphiques

- Interventions mensuelles (préventive / corrective)
- Tickets par mois (créés, résolus, fermés)

## Notes

- Aucune table supplémentaire — agrégations SQL en lecture seule
- Données recalculées à chaque requête
