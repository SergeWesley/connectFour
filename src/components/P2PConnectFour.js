import React from "react";
import Board from "./Board";
import GameLobby from "./GameLobby";
import { useP2PGame, GAME_STATES } from "../hooks/useP2PGame";
import { PLAYER1, PLAYER2 } from "../utils/gameLogic";

const P2PConnectFour = () => {
  const {
    gameState,
    board,
    currentPlayer,
    myPlayer,
    gameOver,
    winner,
    winningCells,
    animatingCell,
    connectionCode,
    isHost,
    opponentConnected,
    errorMessage,
    createRoom,
    joinRoom,
    startGame,
    makeMove,
    resetGame,
    returnToLobby,
  } = useP2PGame();

  const getStatusMessage = () => {
    if (winner) {
      if (winner === myPlayer) {
        return "Vous avez gagné ! 🎉";
      } else {
        return "Votre adversaire a gagné ! 😢";
      }
    }
    if (gameOver) {
      return "Match nul !";
    }
    if (currentPlayer === myPlayer) {
      return "À votre tour !";
    }
    return "Tour de votre adversaire...";
  };

  const getPlayerLabel = (player) => {
    if (player === PLAYER1) {
      return `Rouge ${isHost ? "(Vous)" : "(Adversaire)"}`;
    } else {
      return `Jaune ${!isHost ? "(Vous)" : "(Adversaire)"}`;
    }
  };

  const isMyTurn = () => {
    return currentPlayer === myPlayer && !gameOver;
  };

  // Show lobby when not playing
  if (gameState !== GAME_STATES.PLAYING && gameState !== GAME_STATES.FINISHED) {
    return (
      <div className="connect-four">
        <GameLobby
          gameState={gameState}
          connectionCode={connectionCode}
          isHost={isHost}
          errorMessage={errorMessage}
          opponentConnected={opponentConnected}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onStartGame={startGame}
          onReturnToLobby={returnToLobby}
        />
      </div>
    );
  }

  return (
    <div className="connect-four">
      <div className="game-header">
        <h1>Puissance 4 - Multijoueur</h1>

        <div className="players-info">
          <div
            className={`player-info ${currentPlayer === PLAYER1 ? "active" : ""}`}
          >
            <div className="player-indicator player1">
              <div className="piece"></div>
            </div>
            <span>{getPlayerLabel(PLAYER1)}</span>
          </div>

          <div
            className={`player-info ${currentPlayer === PLAYER2 ? "active" : ""}`}
          >
            <div className="player-indicator player2">
              <div className="piece"></div>
            </div>
            <span>{getPlayerLabel(PLAYER2)}</span>
          </div>
        </div>

        <div
          className={`game-status ${gameOver ? "game-over" : ""} ${isMyTurn() ? "my-turn" : ""}`}
        >
          {getStatusMessage()}
        </div>

        <div className="connection-status">
          <span
            className={`connection-indicator ${opponentConnected ? "connected" : "disconnected"}`}
          >
            {opponentConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
          </span>
        </div>
      </div>

      <Board
        board={board}
        onColumnClick={makeMove}
        winningCells={winningCells}
        animatingCell={animatingCell}
        disabled={!isMyTurn() || !opponentConnected}
      />

      <div className="game-controls">
        {gameState === GAME_STATES.FINISHED && (
          <button className="reset-button" onClick={resetGame}>
            Nouvelle Partie
          </button>
        )}

        <button className="lobby-button" onClick={returnToLobby}>
          Retourner au Lobby
        </button>
      </div>

      {!opponentConnected && (
        <div className="disconnect-overlay">
          <div className="disconnect-message">
            <h3>Connexion perdue</h3>
            <p>Votre adversaire s'est déconnecté.</p>
            <button className="primary-button" onClick={returnToLobby}>
              Retourner au Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default P2PConnectFour;
