# Comptes et données de démonstration — Parc Informatique MFA

Ce fichier décrit les **comptes** et le **scénario métier** chargés par le seed de démo.

## Réinitialiser les données

Depuis le dossier `backend` :

```bash
npm run db:demo
```

Cette commande **vide** les tables métier puis réinsère un jeu cohérent (rôles, services, catégories, utilisateurs, matériels, affectations, tickets, maintenances).

Équivalent : `npm run db:seed` (réinitialisation activée par défaut).  
Pour un seed sans truncate : `DEMO_RESET=false npm run db:seed`.

---

## Comptes de connexion

Connexion possible avec le **matricule** ou l’**email**.

| Persona | Matricule | Email | Mot de passe | Rôle | Service |
|---------|-----------|-------|--------------|------|---------|
| Administrateur système | `ADMIN001` | `admin@mfar.gov.mg` | `Admin@123456` | ADMIN | — |
| Responsable informatique | `RESP001` | `responsable.info@mfar.gov.mg` | `Demo@123456` | CHEF_SERVICE | Service Informatique (responsable) |
| Chef RH | `CHEF001` | `chef.rh@mfar.gov.mg` | `Demo@123456` | CHEF_SERVICE | RH (responsable) |
| Chef logistique | `CHEF002` | `chef.log@mfar.gov.mg` | `Demo@123456` | CHEF_SERVICE | Logistique (responsable) |
| Technicien principal | `TECH001` | `technicien@mfar.gov.mg` | `Demo@123456` | TECHNICIEN | Informatique |
| Technicien 2 | `TECH002` | `technicien2@mfar.gov.mg` | `Demo@123456` | TECHNICIEN | Informatique |
| Agent RH | `USER001` | `utilisateur@mfar.gov.mg` | `Demo@123456` | UTILISATEUR | RH |
| Agent magasin | `USER002` | `utilisateur.log@mfar.gov.mg` | `Demo@123456` | UTILISATEUR | Logistique |
| Support N1 | `USER003` | `utilisateur.info@mfar.gov.mg` | `Demo@123456` | UTILISATEUR | Informatique |

> Mot de passe démo standard (tous sauf admin) : **`Demo@123456`**

---

## Qui utiliser pour quelle démo ?

| Objectif | Compte recommandé |
|----------|-------------------|
| Tour complet admin (utilisateurs, audit, tout CRUD) | `ADMIN001` |
| Supervision IT, rapports, affectations | `RESP001` |
| Création de tickets / vue métier RH | `CHEF001` ou `USER001` |
| Traitement tickets & maintenances | `TECH001` ou `TECH002` |
| Demande utilisateur simple | `USER001` / `USER002` |

---

## Scénario métier (données liées)

### Services
- **SVC-INFO** — Service Informatique (resp. Jean Rakoto)
- **SVC-RH** — Ressources Humaines (resp. Marie Rasoanaivo)
- **SVC-LOG** — Logistique (resp. Hery Randrianarisoa)

### Matériels & affectations actives
| Code | Équipement | Statut | Affecté à |
|------|------------|--------|-----------|
| `PC-INFO-001` | Dell Latitude 5540 | En service | RESP001 |
| `PC-RH-001` | HP EliteBook 840 | En service | CHEF001 |
| `PC-RH-002` | Lenovo ThinkPad T14 | En service | USER001 |
| `PC-LOG-001` | Acer Aspire 5 | En service | USER002 |
| `PC-INFO-002` | Dell OptiPlex 7090 | En service | USER003 |
| `IMP-RH-001` | HP LaserJet MFP | **En maintenance** | — (partagée RH) |
| `SRV-INFO-001` | Dell PowerEdge R740 | En service | — |
| `NET-INFO-001` | Cisco Catalyst 9300 | En service | — |
| `PC-STOCK-001` | HP ProBook 450 | **En stock** | — (prêt à affecter) |
| `PC-HS-001` | ThinkPad E14 ancien | Hors service | — |

### Tickets (exemples)
| N° | Titre | Demandeur | Assigné | Statut |
|----|-------|-----------|---------|--------|
| `TKT-2026-0001` | Écran portable qui scintille | USER001 | TECH001 | En cours |
| `TKT-2026-0002` | Imprimante RH — bourrage | CHEF001 | TECH002 | En cours (lié maintenance) |
| `TKT-2026-0003` | Accès dossier partagé magasin | USER002 | — | Ouvert |
| `TKT-2026-0004` | Clavier défectueux | USER003 | TECH001 | Résolu |
| `TKT-2026-0005` | Demande nouveau portable | CHEF001 | RESP001 | En attente |

### Maintenances
| N° | Titre | Type | Statut | Technicien |
|----|-------|------|--------|------------|
| `MNT-2026-0001` | Rouleau imprimante RH | Corrective | **En cours** | TECH002 |
| `MNT-2026-0002` | Préventive serveur | Préventive | Planifiée | TECH001 |
| `MNT-2026-0003` | SSD portable logistique | Corrective | Terminée | TECH001 |
| `MNT-2026-0004` | Firmware switch | Préventive | Planifiée | TECH002 |

---

## Parcours de démo suggéré (15–20 min)

> **Manuel détaillé (dashboard, toutes les fonctions, scripts 8–25 min) :** [`MANUEL_DEMO.md`](./MANUEL_DEMO.md)

1. **ADMIN001** — Dashboard (KPI + poste de pilotage + SLA), Utilisateurs, Catégories/Services  
2. **USER001** — Ticket `TKT-2026-0001` (son portable)  
3. **TECH001** — Prise en charge / commentaire, Maintenances planifiées  
4. **TECH002** — Maintenance `MNT-2026-0001` + changer statut  
5. **RESP001** — Affectations, Rapports PDF  
6. **CHEF001** — Ticket demande portable + vue services RH  

URL app : http://localhost:5173  
API health : http://localhost:3000/api/v1/health
