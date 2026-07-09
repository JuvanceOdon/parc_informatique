# Configuration PostgreSQL

## Création de la base de données

Exécuter dans PostgreSQL (psql ou pgAdmin) :

```sql
CREATE DATABASE parc_informatique
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'French_France.1252'
  LC_CTYPE = 'French_France.1252'
  TEMPLATE template0;
```

Ou via la ligne de commande :

```bash
psql -U postgres -c "CREATE DATABASE parc_informatique;"
```

## Variables d'environnement

| Variable      | Valeur par défaut   |
|---------------|---------------------|
| `DB_HOST`     | localhost           |
| `DB_PORT`     | 5432                |
| `DB_USER`     | postgres            |
| `DB_PASSWORD` | postgres            |
| `DB_NAME`     | parc_informatique   |

## Vérification de la connexion

1. Configurer les variables `DB_*` dans `.env`
2. Démarrer le serveur : `npm run dev`
3. Appeler : `GET http://localhost:3000/api/v1/health`

## Migrations Drizzle (Sprint 2+)

```bash
npm run db:generate   # Générer les migrations
npm run db:migrate    # Appliquer les migrations
npm run db:push       # Push direct (développement)
npm run db:studio     # Interface visuelle
```
