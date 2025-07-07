import React, { useState } from "react";

const SupabaseLobby = ({
  gameState,
  gameId,
  errorMessage,
  onCreateGame,
  onJoinGame,
  onLeaveGame,
}) => {
  const [gameIdToJoin, setGameIdToJoin] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateGame = async () => {
    const createdGameId = await onCreateGame();
    if (createdGameId) {
      console.log("Game created with ID:", createdGameId);
    }
  };

  const handleJoinGame = async () => {
    if (!gameIdToJoin.trim()) return;

    try {
      await onJoinGame(parseInt(gameIdToJoin.trim()));
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const renderLobbyScreen = () => (
    <div className="lobby-screen">
      <h2>Puissance 4 Multijoueur</h2>
      <p>Jouez en temps réel avec Supabase Realtime</p>

      <div className="lobby-actions">
        <button
          className="primary-button create-room-btn"
          onClick={handleCreateGame}
        >
          Créer une partie
        </button>

        <div className="divider">
          <span>ou</span>
        </div>

        <button
          className="secondary-button join-room-btn"
          onClick={() => setShowJoinForm(!showJoinForm)}
        >
          Rejoindre une partie
        </button>
      </div>

      {showJoinForm && (
        <div className="join-form">
          <h3>Rejoindre une partie</h3>
          <input
            type="number"
            value={gameIdToJoin}
            onChange={(e) => setGameIdToJoin(e.target.value)}
            placeholder="Entrez l'ID du jeu"
            className="connection-input"
          />
          <button
            className="primary-button"
            onClick={handleJoinGame}
            disabled={!gameIdToJoin.trim()}
          >
            Rejoindre
          </button>
        </div>
      )}
    </div>
  );

  const renderWaitingScreen = () => (
    <div className="waiting-screen">
      <h2>En attente d'un joueur...</h2>
      <p>Partagez cet ID de jeu avec votre adversaire :</p>

      <div className="game-id-container">
        <div className="game-id-display">
          <span className="game-id-label">ID du jeu :</span>
          <span className="game-id-value">{gameId}</span>
        </div>
        <button className="copy-button" onClick={() => copyToClipboard(gameId)}>
          Copier
        </button>
      </div>

      <p className="help-text">
        L'autre joueur doit entrer cet ID dans "Rejoindre une partie"
      </p>

      <button className="secondary-button" onClick={onLeaveGame}>
        Annuler
      </button>
    </div>
  );

  const renderCreatingScreen = () => (
    <div className="connecting-screen">
      <h2>Création du jeu...</h2>
      <div className="loading-spinner"></div>
      <p>Configuration de la partie sur Supabase...</p>

      <button className="secondary-button" onClick={onLeaveGame}>
        Annuler
      </button>
    </div>
  );

  const renderJoiningScreen = () => (
    <div className="connecting-screen">
      <h2>Connexion au jeu...</h2>
      <div className="loading-spinner"></div>
      <p>Récupération des données de la partie...</p>

      <button className="secondary-button" onClick={onLeaveGame}>
        Annuler
      </button>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="error-screen">
      <h2>Configuration Requise</h2>
      <p className="error-text">{errorMessage}</p>

      {errorMessage.includes("Configuration Supabase manquante") && (
        <div className="config-help">
          <h3>Configuration Supabase</h3>
          <div className="config-steps">
            <h4>Étapes à suivre :</h4>
            <ol>
              <li>
                Créez un compte sur{" "}
                <a
                  href="https://app.supabase.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase
                </a>
              </li>
              <li>Créez un nouveau projet</li>
              <li>Allez dans Settings → API</li>
              <li>Copiez l'URL et la clé publique</li>
              <li>
                Créez un fichier <code>.env</code> à la racine du projet
              </li>
              <li>Ajoutez vos variables :</li>
            </ol>
            <div className="env-example">
              <code>
                REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
                <br />
                REACT_APP_SUPABASE_ANON_KEY=votre_cle_publique
              </code>
            </div>
            <p>
              Ensuite, exécutez le script SQL <code>supabase_setup.sql</code>{" "}
              dans l'éditeur SQL de Supabase.
            </p>
          </div>
        </div>
      )}

      <button className="primary-button" onClick={onLeaveGame}>
        Retourner au menu principal
      </button>
    </div>
  );

  return (
    <div className="game-lobby">
      {errorMessage && gameState !== "error" && (
        <div className="error-message">{errorMessage}</div>
      )}

      {gameState === "lobby" && renderLobbyScreen()}
      {gameState === "creating" && renderCreatingScreen()}
      {gameState === "joining" && renderJoiningScreen()}
      {gameState === "waiting_for_player" && renderWaitingScreen()}
      {gameState === "error" && renderErrorScreen()}
    </div>
  );
};

export default SupabaseLobby;
