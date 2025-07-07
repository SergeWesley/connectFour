# Guide de Démarrage Rapide - Puissance 4 Multijoueur

## 🚀 Démarrage rapide en 5 minutes

### 1. Configuration Supabase (2 minutes)

1. **Créez un compte** sur [Supabase](https://app.supabase.com/)
2. **Créez un nouveau projet**
3. **Copiez vos identifiants** :
   - Allez dans `Settings` → `API`
   - Copiez l'`URL` et la `anon/public key`

### 2. Configuration du projet (1 minute)

1. **Créez un fichier `.env`** à la racine du projet :

```env
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre_cle_publique_ici
```

2. **Remplacez** les valeurs par vos vraies données Supabase

### 3. Configuration de la base de données (2 minutes)

1. **Ouvrez l'éditeur SQL** dans votre dashboard Supabase
2. **Copiez et exécutez** le contenu du fichier `supabase_setup.sql`
3. **Vérifiez** que la table `games` a été créée

### 4. Testez l'application

```bash
npm start
```

1. **Sélectionnez** "Jouer en Ligne"
2. **Créez une partie** - vous obtiendrez un ID numérique
3. **Partagez l'ID** avec un ami
4. **Votre ami rejoint** avec cet ID
5. **Jouez !** 🎮

---

## ⚠️ Problèmes courants

### L'application affiche "Configuration Supabase manquante"

- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `REACT_APP_`
- Redémarrez le serveur de développement

### "Erreur lors de la création du jeu"

- Vérifiez que la table `games` existe dans Supabase
- Vérifiez que RLS (Row Level Security) est configuré
- Regardez les logs dans le dashboard Supabase

### Les coups ne se synchronisent pas

- Vérifiez que Realtime est activé pour la table `games`
- Vérifiez votre connexion internet

---

## 📋 Structure de la table games

```sql
id: BIGINT (auto-incrémenté)
created_at: TIMESTAMP
board: JSON (plateau 6x7)
turn: INTEGER (1 ou 2)
winner: INTEGER (1, 2, NULL, ou 0 pour nul)
```

---

## 🎯 Vous êtes prêt !

Une fois configuré, le jeu fonctionne de manière fluide :

- **Connexion stable** via Supabase
- **Synchronisation temps réel**
- **Pas de problème de réseau** comme avec P2P
- **IDs simples** à partager (juste un numéro)

Amusez-vous bien ! 🎉
