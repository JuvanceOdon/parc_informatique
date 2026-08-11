# Manuel de démonstration — Parc Informatique MFA

**Système de Gestion du Parc Informatique et de Suivi des Interventions**  
Ministère des Forces Armées (MFA) — Madagascar

Ce document sert de **script de démo** et de **manuel utilisateur** pour présenter toutes les fonctionnalités de l’application, avec un focus sur le **tableau de bord (poste de pilotage)**.

---

## Table des matières

1. [Avant la démo](#1-avant-la-démo)
2. [Connexion et interface](#2-connexion-et-interface)
3. [Dashboard — contenu et explications](#3-dashboard--contenu-et-explications)
4. [Modules fonctionnels](#4-modules-fonctionnels)
5. [Scénario de démo (20–25 min)](#5-scénario-de-démo-20–25-min)
6. [Scénario court (8–10 min)](#6-scénario-court-8–10-min)
7. [Ce que chaque rôle voit](#7-ce-que-chaque-rôle-voit)
8. [Checklist présentateur](#8-checklist-présentateur)
9. [Messages clés pour le public](#9-messages-clés-pour-le-public)

---

## 1. Avant la démo

### URLs

| Élément | Adresse |
|---------|---------|
| Application | http://localhost:5173 |
| API (santé) | http://localhost:3000/api/v1/health |

### Préparer les données

Dans `backend` :

```bash
npm run db:demo
```

Puis démarrer backend et frontend (`npm run dev` dans chaque dossier).

### Comptes à avoir sous la main

| Persona | Matricule | Mot de passe | Pour montrer… |
|---------|-----------|--------------|---------------|
| Administrateur | `ADMIN001` | `Admin@123456` | Tout + utilisateurs + audit |
| Resp. Informatique | `RESP001` | `Demo@123456` | Pilotage IT, rapports, affectations |
| Technicien | `TECH001` | `Demo@123456` | Ma charge, tickets, maintenances |
| Agent RH | `USER001` | `Demo@123456` | Vue utilisateur, création ticket |

Détail complet des comptes : [`COMPTES_DEMO.md`](./COMPTES_DEMO.md).

---

## 2. Connexion et interface

### Écran de connexion

1. Ouvrir http://localhost:5173 → redirection vers `/login` si non connecté.
2. Saisir le **matricule** (ex. `ADMIN001`) ou l’**email**.
3. Mot de passe, puis **Se connecter**.
4. Option thème clair / sombre (icône en haut à droite).

**À dire en démo :** « Accès réservé au personnel MFA, authentification par matricule. »

### Après connexion

| Zone | Rôle |
|------|------|
| **Sidebar** (navy) | Navigation selon le rôle |
| **En-tête** | Titre app, thème, notifications, **profil** |
| **Zone centrale** | Contenu de la page |

### Profil (popup)

Cliquer sur le **nom / avatar** en haut à droite :

- Identité (matricule, rôle)
- Email, téléphone, dernière connexion
- Bascule mode sombre
- Déconnexion

Il n’y a plus de page « Paramètres » séparée : tout passe par ce popup.

### Notifications

Icône cloche → liste des alertes récentes, marquage lu / tout marquer lu.

---

## 3. Dashboard — contenu et explications

Page d’accueil `/` — **cœur de la démo** pour un établissement public avec **techniciens internes**.

### 3.1 En-tête personnalisé

- Message du type **« Bonjour, [Prénom] »**
- Sous-titre : pilotage du parc et des interventions

### 3.2 Cartes KPI (ligne du haut)

Quatre indicateurs synthétiques :

| Carte | Signification | Comment le lire en démo |
|-------|---------------|-------------------------|
| **Matériels** | Nombre d’équipements actifs du parc | « Taille du parc inventorié » |
| **Tickets ouverts** | Demandes non terminées (ouverts / en cours / en attente côté KPI) | « Charge d’intervention ouverte » |
| **Maintenances** | Interventions actives (planifiées + en cours + diagnostic) | « Travaux techniques en cours » |
| **Respect SLA** *(staff)* ou **Disponibilité** *(utilisateur)* | % de tickets encore dans les délais d’engagement / taux de matériels disponibles | « Engagement de service interne » ou « santé du parc » |

Pour un **admin / chef / technicien**, la 4ᵉ carte met en avant le **respect des SLA**.  
Pour un **utilisateur**, elle affiche la **disponibilité** du parc.

### 3.3 Poste de pilotage (bloc central)

Trois colonnes actionnables. Les lignes sont **cliquables** (vers ticket, maintenance ou fiche matériel).

#### A. À traiter aujourd’hui

File de décisions pour le service :

| Sous-bloc | Contenu | Pourquoi c’est important |
|-----------|---------|--------------------------|
| **Tickets urgents** | Priorité **Critique** ou **Haute**, encore ouverts | À traiter en premier |
| **SLA dépassés** | Tickets dont le délai d’engagement est dépassé | Alerte de retard (chip rouge `SLA +Xh`) |
| **Maintenances en retard** *(staff)* | Planification dépassée, ou intervention ouverte depuis plus de 7 jours | Suivi terrain / atelier |
| **Garanties &lt; 30 jours** *(staff)* | Matériels dont la garantie expire bientôt | Anticiper renouvellement / SAV |

**Utilisateur simple :** voit surtout *ses* tickets urgents / SLA, pas la file globale ni les garanties.

#### B. Ma charge / Mes demandes

| Rôle | Titre du bloc | Contenu |
|------|---------------|---------|
| Staff (admin, chef, technicien) | **Ma charge** | Tickets **assignés à moi** + maintenances où **je suis technicien** |
| Utilisateur | **Mes demandes** | Tickets que **j’ai créés** et qui sont encore ouverts |

**À dire :** « Chaque technicien MFA voit sa propre file — pas un dispatch vers des prestataires externes. »

#### C. Engagements SLA

Indicateur de **qualité de service interne** :

- **Pourcentage** de tickets ouverts encore dans les délais
- Compteurs : dans les délais / dépassés
- **Règles affichées** (engagements du service informatique MFA) :

| Priorité | Délai d’engagement |
|----------|--------------------|
| Critique | 24 heures |
| Haute | 48 heures |
| Moyenne | 72 heures |
| Basse | 7 jours (168 h) |

Ce ne sont **pas** des pénalités contractuelles de sous-traitance : ce sont des **délais d’engagement** pour les techniciens du MFA.

### 3.4 Indicateurs graphiques (bas de page)

Section **« Indicateurs »** — vision analytique après le pilotage opérationnel :

| Graphique | Lecture |
|-----------|---------|
| **Répartition du parc** (donut) | Matériels par statut (stock, service, maintenance, HS…) |
| **Tickets par priorité** (barres) | Répartition de la charge actuelle |
| **Évolution des tickets** (courbes) | Créés / résolus / fermés sur 12 mois |
| **Interventions** (barres empilées) | Préventives vs correctives par mois |

**Ordre de présentation recommandé :** KPI → Poste de pilotage → Graphiques.

---

## 4. Modules fonctionnels

### 4.1 Matériels

**Menu :** Matériels  
**Qui :** lecture pour tous ; création / édition / désactivation pour le staff

| Action | Comment la montrer |
|--------|-------------------|
| Liste + recherche | Filtrer par code ou désignation |
| Nouveau matériel | Formulaire (catégorie, statut, garantie…) |
| Fiche détail | Double-clic ou icône œil → historique, garantie, édition |
| Désactivation | Retrait logique sans supprimer l’historique |

**Données démo utiles :** `PC-RH-001`, `IMP-RH-001` (en maintenance), `PC-STOCK-001` (en stock).

### 4.2 Affectations

**Menu :** Affectations  
**Qui :** staff pour créer / modifier / transférer / terminer

| Action | Intérêt démo |
|--------|--------------|
| Nouvelle affectation | Lier `PC-STOCK-001` à un agent |
| Modifier | Changer service / localisation / motif |
| Transférer | Passer le matériel à un autre utilisateur |
| Terminer | Restitution (matériel libre) |

### 4.3 Tickets

**Menu :** Tickets  
**Qui :** tous peuvent créer ; staff assigne et change les statuts

| Action | Intérêt démo |
|--------|--------------|
| Nouveau ticket | Depuis `USER001` (écran qui scintille déjà en démo) |
| Détail | Commentaires, pièces jointes, historique |
| Assigner | Relier à `TECH001` |
| Changer statut | Ouvert → En cours → Résolu → Fermé |
| Priorité | Impacte le **SLA** du dashboard |

**Tickets démo :** `TKT-2026-0001` … `0005` (voir [`COMPTES_DEMO.md`](./COMPTES_DEMO.md)).

### 4.4 Maintenances

**Menu :** Maintenances *(pas visible pour UTILISATEUR)*  
**Qui :** ADMIN, CHEF_SERVICE, TECHNICIEN

| Action | Intérêt démo |
|--------|--------------|
| Nouvelle maintenance | Préventive ou corrective |
| Changer statut | Planifiée → En cours → Diagnostic → Terminée |
| Lier à un ticket | Ex. imprimante RH |
| Éditer / supprimer | Selon règles métier (ex. suppression si planifiée) |

**Démo phare :** `MNT-2026-0001` (rouleau imprimante, TECH002).

### 4.5 Catégories

Classification des matériels (PC, imprimante, serveur…).  
**CRUD :** ADMIN. Lecture : tous.

### 4.6 Services

Organigramme métier (Informatique, RH, Logistique…).  
**Qui :** ADMIN, CHEF_SERVICE.  
Activation / désactivation possibles.

### 4.7 Utilisateurs

**Menu :** Utilisateurs *(ADMIN uniquement)*  
Création, édition, changement de rôle, activation / désactivation.

### 4.8 Rapports

**Menu :** Rapports *(ADMIN, CHEF, TECH)*  
Export **PDF** et **Excel** (mensuel / annuel) pour restitution institutionnelle.

### 4.9 Journal d’audit

**Menu :** Journal d’audit *(ADMIN)*  
Traçabilité des actions sensibles (qui a fait quoi, quand).  
Argument clé pour un **établissement public**.

### 4.10 Thème clair / sombre

Bascule depuis l’en-tête ou le profil — préférence mémorisée sur l’appareil.

---

## 5. Scénario de démo (20–25 min)

### Étape 0 — Intro (1 min)

> « Application MFA pour gérer le parc informatique avec **nos propres techniciens** : inventaire, affectations, tickets, maintenances, pilotage et traçabilité. »

### Étape 1 — Admin + Dashboard (5–6 min) — `ADMIN001`

1. Connexion `ADMIN001` / `Admin@123456`
2. **Dashboard**
   - KPI
   - Poste de pilotage (à traiter, SLA, ma charge)
   - Graphiques
3. Expliquer les **règles SLA**
4. Ouvrir un ticket urgent ou SLA depuis la liste cliquable
5. Sidebar : Utilisateurs (aperçu), Journal d’audit (1–2 lignes)

### Étape 2 — Vue technicien (4–5 min) — `TECH001`

1. Déconnexion → `TECH001` / `Demo@123456`
2. Dashboard : **Ma charge** (tickets assignés + maintenances)
3. Ouvrir `TKT-2026-0001` → commentaire → éventuellement statut
4. Maintenances : montrer `MNT-2026-0002` (préventive planifiée)

### Étape 3 — Intervention corrective (3–4 min) — `TECH002`

1. Connexion `TECH002`
2. Maintenance `MNT-2026-0001` (imprimante RH)
3. Changer / avancer le statut (diagnostic, solution…)
4. Lien avec le ticket imprimante si pertinent

### Étape 4 — Utilisateur métier (3 min) — `USER001`

1. Connexion agent RH
2. Dashboard : **Mes demandes** (pas la file globale staff)
3. Créer un nouveau ticket simple (titre + description)
4. Montrer le suivi dans la liste

### Étape 5 — Responsable IT (3–4 min) — `RESP001`

1. Affectations : vue d’ensemble / transfert éventuel
2. Rapports : générer un PDF mensuel
3. Revenir au dashboard pour concluire sur le **pilotage**

### Étape 6 — Clôture (1 min)

> « Inventaire, interventions, délais internes, preuves (audit) — un outil de **service informatique institutionnel**, pas une plateforme de sous-traitance. »

---

## 6. Scénario court (8–10 min)

| Temps | Compte | Action |
|-------|--------|--------|
| 0–3 min | `ADMIN001` | Login + **Dashboard** (KPI + pilotage + SLA) |
| 3–5 min | `TECH001` | Ma charge + ticket en cours |
| 5–7 min | `USER001` | Création d’un ticket |
| 7–9 min | `RESP001` | Rapport PDF ou affectation |
| 9–10 min | — | Message de clôture |

---

## 7. Ce que chaque rôle voit

| Fonctionnalité | ADMIN | CHEF_SERVICE | TECHNICIEN | UTILISATEUR |
|----------------|:-----:|:------------:|:----------:|:-----------:|
| Dashboard (KPI + graphiques) | ✅ | ✅ | ✅ | ✅ |
| Poste de pilotage (file service) | ✅ | ✅ | ✅ | Partiel* |
| SLA global service | ✅ | ✅ | ✅ | Sur ses tickets |
| Matériels | ✅ | ✅ | ✅ | Lecture |
| Affectations | ✅ | ✅ | ✅ | Lecture |
| Tickets | ✅ | ✅ | ✅ | ✅ (ses créations) |
| Maintenances | ✅ | ✅ | ✅ | ❌ |
| Catégories | ✅ CRUD | Lecture | Lecture | Lecture |
| Services | ✅ | ✅ | ❌ | ❌ |
| Utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Rapports | ✅ | ✅ | ✅ | ❌ |
| Journal d’audit | ✅ | ❌ | ❌ | ❌ |

\*Utilisateur : urgences / SLA **de ses demandes**, pas la file globale ni garanties / retards maintenance.

---

## 8. Checklist présentateur

Avant la séance :

- [ ] `npm run db:demo` exécuté
- [ ] Backend sur le port **3000**
- [ ] Frontend sur le port **5173**
- [ ] Navigateur en navigation privée (éviter un ancien token)
- [ ] Comptes notés : `ADMIN001`, `TECH001`, `USER001`, `RESP001`
- [ ] Onglet health API OK

Pendant :

- [ ] Commencer par le **dashboard** (histoire forte)
- [ ] Cliquer au moins une ligne du pilotage
- [ ] Montrer un parcours **utilisateur → technicien**
- [ ] Mentionner **audit** ou **rapport** (preuve institutionnelle)
- [ ] Rappeler : techniciens **internes** MFA + SLA = engagement de service

---

## 9. Messages clés pour le public

1. **Inventaire vivant** — chaque équipement a un statut, une affectation, un historique.  
2. **Interventions tracées** — tickets et maintenances avec cycle de vie clair.  
3. **Pilotage quotidien** — le dashboard ne se limite pas aux graphiques : il dit *quoi faire aujourd’hui*.  
4. **SLA internes** — délais adaptés à un service public avec ses propres techniciens.  
5. **Gouvernance** — rôles, notifications, rapports, journal d’audit.

---

## Ressources liées

- Comptes & scénario données : [`COMPTES_DEMO.md`](./COMPTES_DEMO.md)
- Guide technique complet : [`GUIDE_COMPLET.md`](./GUIDE_COMPLET.md)

---

*Manuel de démonstration — Parc Informatique MFA — 2026*
