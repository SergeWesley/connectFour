# Puissance 4 - Mode Multijoueur Supabase

Ce projet utilise maintenant **Supabase Realtime** pour le mode multijoueur, offrant une architecture serveur robuste et fiable pour les parties en temps réel.

## Fonctionnalités

### Mode Solo

- Jeu local pour 2 joueurs sur le même ordinateur
- Interface classique du Puissance 4
- Animation des pièces qui tombent
- Détection automatique des victoires

### Mode Multijoueur Supabase

- **Synchronisation temps réel** via Supabase Realtime
- **Infrastructure serveur** robuste et scalable
- **Connexion stable** sans problème de firewall
- **Persistance des données** - les parties sont sauvegardées
- **ID de jeu simple** - partagez juste un numéro
- **Reconnexion automatique** en cas de déconnexion

## Configuration

### 1. Prérequis Supabase

1. Créez un compte sur [Supabase](https://app.supabase.com/)
2. Créez un nouveau projet
3. Notez l'URL et la clé publique de votre projet

### 2. Configuration de la base de données

1. Allez dans l'éditeur SQL de votre dashboard Supabase
2. Copiez et exécutez le contenu du fichier `supabase_setup.sql`
3. Vérifiez que la table `games` a été créée
4. Activez Realtime pour la table `games` si ce n'est pas déjà fait

### 3. Variables d'environnement

1. Copiez `.env.example` vers `.env`
2. Remplissez avec vos vraies valeurs Supabase :

```env
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre_cle_publique_supabase
```

## Comment jouer en multijoueur

### 1. Créer une partie

1. Sélectionnez "Jouer en Ligne" dans le menu principal
2. Cliquez sur "Créer une partie"
3. Partagez l'ID numérique généré avec votre adversaire
4. Attendez que votre adversaire rejoigne

### 2. Rejoindre une partie

1. Sélectionnez "Jouer en Ligne" dans le menu principal
2. Cliquez sur "Rejoindre une partie"
3. Entrez l'ID numérique reçu de votre adversaire
4. La partie commence automatiquement !

## Architecture technique

### Technologies utilisées

- **React** 18 pour l'interface utilisateur
- **Supabase** pour la base de données et Realtime
- **PostgreSQL** comme base de données
- **WebSockets** pour la synchronisation temps réel

### Structure du code Supabase

```
src/
├── hooks/
│   └── useSupabaseGame.js     # Hook pour la gestion du jeu Supabase
├── utils/
│   └── supabase.js            # Client et API Supabase
├── components/
│   ├── SupabaseConnectFour.js # Composant principal du jeu Supabase
│   ├── SupabaseLobby.js       # Interface de connexion
│   └── MainMenu.js            # Menu de sélection de mode
└── styles/
    ├── SupabaseGame.css       # Styles pour le mode Supabase
    └── MainMenu.css           # Styles pour le menu principal
```

### Fonctionnement de la synchronisation

1. **Création de partie** : Un nouveau enregistrement est créé dans la table `games`
2. **Abonnement** : Les joueurs s'abonnent aux changements de cette partie
3. **Synchronisation** : Chaque coup met à jour la base de données
4. **Notification** : Supabase Realtime notifie tous les clients connectés
5. **Mise à jour** : L'interface se met à jour automatiquement

### Structure de la table games

```sql
id: BIGINT (Primary Key, auto-incrémenté)
created_at: TIMESTAMP (Date de création)
board: JSON (État du plateau 6x7)
turn: INTEGER (Joueur actuel: 1 ou 2)
winner: INTEGER (Gagnant: 1, 2, NULL pour en cours, 0 pour nul)
```

## Avantages de Supabase

✅ **Fiabilité** : Infrastructure serveur professionnelle
✅ **Simplicité** : Pas de configuration réseau complexe
✅ **Persistance** : Les parties sont sauvegardées
✅ **Scalabilité** : Support de nombreuses parties simultanées
✅ **Facilité** : ID numérique simple à partager
✅ **Reconnexion** : Récupération automatique des parties

## Installation et développement

```bash
# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs Supabase

# Démarrage du serveur de développement
npm start

# Build de production
npm run build
```

## Utilisation en production

1. **Variables d'environnement** : Configurez les variables Supabase dans votre environnement de production
2. **Sécurité** : Configurez des politiques RLS plus restrictives si nécessaire
3. **Monitoring** : Utilisez le dashboard Supabase pour surveiller l'utilisation

## Dépannage

### La connexion ne fonctionne pas

- Vérifiez que les variables d'environnement sont correctement configurées
- Assurez-vous que la table `games` existe dans votre base Supabase
- Vérifiez que Realtime est activé pour la table `games`

### L'ID de jeu n'est pas trouvé

- Vérifiez que l'ID est correct (nombre uniquement)
- L'ID pourrait être d'une partie terminée ou supprimée
- Créez une nouvelle partie

### Les coups ne se synchronisent pas

- Vérifiez votre connexion internet
- Regardez la console pour les erreurs Supabase
- Vérifiez que les politiques RLS permettent les opérations

## Développement

Pour contribuer au projet :

1. Fork le repository
2. Configurez votre propre projet Supabase
3. Testez vos modifications
4. Soumettez une Pull Request

## Support

En cas de problème :

- Consultez la [documentation Supabase](https://supabase.com/docs)
- Vérifiez les logs dans le dashboard Supabase
- Ouvrez une issue sur GitHub
