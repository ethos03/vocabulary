# Roue de vocabulaire bilingue

## Lancer en local
Node.js 18+ est nécessaire. Dans ce dossier :

```bash
ADMIN_PASSWORD="choisir-un-mot-de-passe" npm start
```

Puis ouvrir http://localhost:3000. Si `ADMIN_PASSWORD` n’est pas définie, la valeur de secours est **admin** : changez-la avant de mettre le site en ligne.

Les mots et les évaluations ajoutés par l’admin sont enregistrés dans `data.json` et donc partagés par tous les visiteurs du même serveur. Les statistiques de réussite sont volontairement individuelles et restent dans le `localStorage` de chaque navigateur.

## Mise en ligne gratuite
Créer un nouveau service web Node sur Render (ou Railway), déposer ces fichiers dans un dépôt GitHub, commande de build `npm install`, commande de démarrage `npm start`, puis ajouter la variable d’environnement `ADMIN_PASSWORD`. Pour une persistance durable sur une plateforme éphémère, prévoir un disque persistant ou remplacer `data.json` par une base de données.

## Compte admin
Les visiteurs n’ont pas besoin de compte. Le bouton **Admin** ouvre une connexion par mot de passe ; seul ce rôle peut ajouter, modifier ou supprimer les mots et publier les évaluations.
