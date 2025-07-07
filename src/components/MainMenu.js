import React, { useState } from "react";
import ConnectFour from "./ConnectFour";
import P2PConnectFour from "./P2PConnectFour";

const GAME_MODES = {
  MENU: "menu",
  SOLO: "solo",
  MULTIPLAYER: "multiplayer",
};

const MainMenu = () => {
  const [gameMode, setGameMode] = useState(GAME_MODES.MENU);

  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleBackToMenu = () => {
    setGameMode(GAME_MODES.MENU);
  };

  if (gameMode === GAME_MODES.SOLO) {
    return (
      <div>
        <button className="back-to-menu-btn" onClick={handleBackToMenu}>
          ← Retour au menu
        </button>
        <ConnectFour />
      </div>
    );
  }

  if (gameMode === GAME_MODES.MULTIPLAYER) {
    return (
      <div>
        <button className="back-to-menu-btn" onClick={handleBackToMenu}>
          ← Retour au menu
        </button>
        <P2PConnectFour />
      </div>
    );
  }

  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="main-title">Puissance 4</h1>
        <p className="menu-subtitle">Choisissez votre mode de jeu</p>

        <div className="menu-options">
          <div className="game-mode-card">
            <h3>Mode Solo</h3>
            <p>Jouez localement avec un ami sur le même ordinateur</p>
            <button
              className="mode-button solo-mode"
              onClick={() => handleModeSelect(GAME_MODES.SOLO)}
            >
              Jouer en Solo
            </button>
          </div>

          <div className="game-mode-card">
            <h3>Mode Multijoueur</h3>
            <p>Jouez à distance avec un ami via connexion P2P directe</p>
            <button
              className="mode-button multiplayer-mode"
              onClick={() => handleModeSelect(GAME_MODES.MULTIPLAYER)}
            >
              Jouer en Ligne
            </button>
          </div>
        </div>

        <div className="info-section">
          <h4>À propos du mode multijoueur</h4>
          <p>
            Le mode multijoueur utilise une connexion P2P (peer-to-peer) directe
            entre les navigateurs. Aucun serveur central n'est requis - vos
            données restent privées !
          </p>
          <ul>
            <li>✅ Connexion directe et sécurisée</li>
            <li>✅ Pas de serveur central</li>
            <li>✅ Latence minimale</li>
            <li>✅ Données privées</li>
          </ul>

          <div className="troubleshooting">
            <h5>En cas de problème de connexion :</h5>
            <ul>
              <li>🔄 Actualisez la page et réessayez</li>
              <li>���� Essayez depuis un autre réseau (mobile, autre WiFi)</li>
              <li>⏰ Patientez jusqu'à 45 secondes pour la connexion</li>
              <li>🔒 Vérifiez que votre firewall autorise WebRTC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
