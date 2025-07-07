import React, { useState } from "react";
import ConnectFour from "./ConnectFour";
import SupabaseConnectFour from "./SupabaseConnectFour";

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
        <SupabaseConnectFour />
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
            <p>Jouez à distance avec un ami via Supabase Realtime</p>
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
            Le mode multijoueur utilise Supabase Realtime pour synchroniser les
            parties en temps réel. Architecture serveur robuste et fiable !
          </p>
          <ul>
            <li>✅ Synchronisation en temps réel</li>
            <li>✅ Infrastructure serveur fiable</li>
            <li>✅ Connexion stable</li>
            <li>✅ Pas de problème de firewall</li>
          </ul>

          <div className="troubleshooting">
            <h5>Configuration requise :</h5>
            <ul>
              <li>🌐 Connexion internet stable</li>
              <li>🔧 Variables d'environnement Supabase configurées</li>
              <li>📊 Table 'games' créée dans la base de données</li>
              <li>⚡ Abonnements temps réel activés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
