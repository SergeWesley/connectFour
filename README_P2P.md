# Puissance 4 - Mode Multijoueur P2P

Ce projet inclut maintenant un mode multijoueur utilisant une connexion P2P (peer-to-peer) directe entre les navigateurs, permettant de jouer à distance sans serveur centralisé.

## Fonctionnalités

### Mode Solo

- Jeu local pour 2 joueurs sur le même ordinateur
- Interface classique du Puissance 4
- Animation des pièces qui tombent
- Détection automatique des victoires

### Mode Multijoueur P2P

- **Connexion directe** entre navigateurs via WebRTC
- **Aucun serveur central** requis
- **Données privées** - tout reste entre les deux joueurs
- **Latence minimale** grâce à la connexion directe
- Synchronisation en temps réel des coups
- Gestion des déconnexions

## Comment jouer en multijoueur

### 1. Créer une partie

1. Sélectionnez "Jouer en Ligne" dans le menu principal
2. Cliquez sur "Créer une partie"
3. Partagez le code de connexion généré avec votre adversaire
4. Attendez que votre adversaire se connecte

### 2. Rejoindre une partie

1. Sélectionnez "Jouer en Ligne" dans le menu principal
2. Cliquez sur "Rejoindre une partie"
3. Collez le code de connexion reçu de votre adversaire
4. Cliquez sur "Se connecter"
5. La connexion s'établit automatiquement !

### 3. C'est tout !

- Aucune étape supplémentaire nécessaire
- Dès que la connexion est établie, vous pouvez commencer à jouer !

## Architecture technique

### Technologies utilisées

- **React** 18 pour l'interface utilisateur
- **WebRTC** pour la communication P2P
- **simple-peer** pour simplifier l'usage de WebRTC
- **Webpack** pour le bundling

### Structure du code P2P

```
src/
├── hooks/
│   └── useP2PGame.js          # Hook pour la gestion du jeu P2P
├── utils/
│   └── p2pConnection.js       # Classe pour la connexion WebRTC
├── components/
│   ├── P2PConnectFour.js      # Composant principal du jeu P2P
│   ├── GameLobby.js           # Interface de connexion P2P
│   └── MainMenu.js            # Menu de sélection de mode
└── styles/
    ├── P2PGame.css            # Styles pour le mode P2P
    └── MainMenu.css           # Styles pour le menu principal
```

### Fonctionnement de la connexion P2P

1. **Initialisation** : Le créateur génère une offre WebRTC
2. **Échange de signaux** : Les codes sont échangés manuellement entre joueurs
3. **Établissement** : La connexion directe P2P est établie
4. **Communication** : Les coups sont synchronisés via messages JSON

### Messages P2P

- `GAME_MOVE` : Envoi d'un coup joué
- `GAME_STATE` : Synchronisation de l'état du jeu
- `GAME_RESET` : Demande de nouvelle partie
- `PLAYER_READY` : Indication qu'un joueur est prêt

## Avantages du P2P

✅ **Pas de serveur** : Aucune infrastructure serveur nécessaire
✅ **Confidentialité** : Les données restent entre les deux joueurs
✅ **Performance** : Latence minimale grâce à la connexion directe
✅ **Fiabilité** : Fonctionne même derrière des firewalls (dans la plupart des cas)
✅ **Économique** : Pas de coûts de serveur

## Limitations

⚠️ **NAT/Firewall** : Peut ne pas fonctionner dans certains réseaux d'entreprise très restrictifs
⚠️ **Échange manuel** : Les codes doivent être échangés manuellement (par chat, email, etc.)
⚠️ **Pas de matchmaking** : Il faut connaître quelqu'un pour jouer

## Installation et développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm start
# ou
npm run dev

# Build de production
npm run build
```

## Utilisation en production

Le mode P2P fonctionne directement en production sans configuration supplémentaire. Assurez-vous simplement que votre site est servi en HTTPS pour que WebRTC fonctionne correctement.

## Troubleshooting

### La connexion ne s'établit pas

- Vérifiez que les deux navigateurs supportent WebRTC
- Essayez depuis un réseau différent
- Assurez-vous que les codes sont copiés entièrement

### Déconnexion fréquente

- Vérifiez la stabilité de la connexion internet
- Évitez de fermer/réduire l'onglet du navigateur

### Le jeu ne se synchronise pas

- Actualisez les deux navigateurs
- Recommencez le processus de connexion
