import React, { useState } from "react";

const GameLobby = ({
  gameState,
  connectionCode,
  isHost,
  errorMessage,
  opponentConnected,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onReturnToLobby,
}) => {
  const [joinCode, setJoinCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateRoom = () => {
    onCreateRoom();
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;

    try {
      await onJoinRoom(joinCode.trim());
      // Connection will be established automatically
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderLobbyScreen = () => (
    <div className="lobby-screen">
      <h2>Puissance 4 Multijoueur</h2>
      <p>Jouez à distance avec un ami via une connexion directe P2P</p>

      <div className="lobby-actions">
        <button
          className="primary-button create-room-btn"
          onClick={handleCreateRoom}
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
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Collez le code de connexion ici"
            className="connection-input"
          />
          <button
            className="primary-button"
            onClick={handleJoinRoom}
            disabled={!joinCode.trim()}
          >
            Se connecter
          </button>
        </div>
      )}
    </div>
  );

  const renderWaitingScreen = () => (
    <div className="waiting-screen">
      <h2>En attente d'un joueur...</h2>
      <p>Partagez ce code avec votre adversaire :</p>

      <div className="connection-code-container">
        <textarea readOnly value={connectionCode} className="connection-code" />
        <button
          className="copy-button"
          onClick={() => copyToClipboard(connectionCode)}
        >
          Copier
        </button>
      </div>

      <p className="help-text">
        L'autre joueur doit coller ce code dans "Rejoindre une partie"
      </p>

      <button className="secondary-button" onClick={onReturnToLobby}>
        Annuler
      </button>
    </div>
  );

  const renderConnectingScreen = () => (
    <div className="connecting-screen">
      <h2>Connexion en cours...</h2>
      <div className="loading-spinner"></div>

      {answerCode && isHost && (
        <div className="answer-code-section">
          <p>Code reçu de l'autre joueur :</p>
          <textarea
            readOnly
            value={answerCode}
            className="connection-code small"
          />
          <button className="primary-button" onClick={handleCompleteConnection}>
            Finaliser la connexion
          </button>
        </div>
      )}

      {answerCode && !isHost && (
        <div className="answer-code-section">
          <p>Partagez ce code avec le créateur de la partie :</p>
          <textarea readOnly value={answerCode} className="connection-code" />
          <button
            className="copy-button"
            onClick={() => copyToClipboard(answerCode)}
          >
            Copier
          </button>
          <p className="help-text">
            Le créateur doit coller ce code pour finaliser la connexion
          </p>
        </div>
      )}

      <button className="secondary-button" onClick={onReturnToLobby}>
        Annuler
      </button>
    </div>
  );

  const renderReadyScreen = () => (
    <div className="ready-screen">
      <h2>Connexion établie !</h2>
      <p>Vous êtes connecté avec votre adversaire.</p>
      <p>
        Vous êtes le{" "}
        <strong>Joueur {isHost ? "Rouge (1)" : "Jaune (2)"}</strong>
      </p>

      <button className="primary-button start-game-btn" onClick={onStartGame}>
        Commencer la partie
      </button>

      <button className="secondary-button" onClick={onReturnToLobby}>
        Retourner au lobby
      </button>
    </div>
  );

  const renderDisconnectedScreen = () => (
    <div className="disconnected-screen">
      <h2>Connexion perdue</h2>
      <p>La connexion avec votre adversaire a été interrompue.</p>

      <button className="primary-button" onClick={onReturnToLobby}>
        Retourner au lobby
      </button>
    </div>
  );

  return (
    <div className="game-lobby">
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {gameState === "lobby" && renderLobbyScreen()}
      {gameState === "waiting_for_player" && renderWaitingScreen()}
      {gameState === "connecting" && renderConnectingScreen()}
      {gameState === "ready" && renderReadyScreen()}
      {gameState === "disconnected" && renderDisconnectedScreen()}
    </div>
  );
};

export default GameLobby;
