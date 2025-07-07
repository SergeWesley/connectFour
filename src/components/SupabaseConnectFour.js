import React from "react";
import Board from "./Board";
import SupabaseLobby from "./SupabaseLobby";
import { useSupabaseGame, GAME_STATES } from "../hooks/useSupabaseGame";
import { PLAYER1, PLAYER2 } from "../utils/gameLogic";

const SupabaseConnectFour = () => {
  const {
    gameState,
    gameId,
    board,
    currentPlayer,
    myPlayer,
    gameOver,
    winner,
    winningCells,
    animatingCell,
    errorMessage,
    isHost,
    createGame,
    joinGame,
    makeMove,
    resetGame,
    leaveGame,
  } = useSupabaseGame();

  const getStatusMessage = () => {
    if (winner !== null && winner !== 0) {
      if (winner === myPlayer) {
        return "Vous avez gagné ! 🎉";
      } else {
        return "Votre adversaire a gagné ! 😢";
      }
    }
    if (gameOver) {
      return "Match nul !";
    }
    if (myPlayer === PLAYER2 && currentPlayer === PLAYER1) {
      return "En attente du premier joueur...";
    }
    if (myPlayer === PLAYER1 && !gameOver) {
      return currentPlayer === myPlayer
        ? "À votre tour ! (Partie accessible avec l'ID: " + gameId + ")"
        : "Tour de votre adversaire...";
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
      return `Jaune ${!isHost ? "(Vous)" : myPlayer === null ? "(En attente)" : "(Adversaire)"}`;
    }
  };

  const isMyTurn = () => {
    return currentPlayer === myPlayer && !gameOver;
  };

  // Show lobby when not playing
  if (gameState !== GAME_STATES.PLAYING && gameState !== GAME_STATES.FINISHED) {
    return (
      <div className="connect-four">
        <SupabaseLobby
          gameState={gameState}
          gameId={gameId}
          errorMessage={errorMessage}
          onCreateGame={createGame}
          onJoinGame={joinGame}
          onLeaveGame={leaveGame}
        />
      </div>
    );
  }

  return (
    <div className="connect-four">
      <div className="game-header">
        <h1>Puissance 4 - Multijoueur</h1>

        <div className="game-info">
          <div className="game-id-info">
            <span>
              ID du jeu: <strong>{gameId}</strong>
            </span>
          </div>
        </div>

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
          <span className="connection-indicator connected">
            🟢 Connecté via Supabase
          </span>
        </div>
      </div>

      <Board
        board={board}
        onColumnClick={makeMove}
        winningCells={winningCells}
        animatingCell={animatingCell}
        disabled={!isMyTurn()}
      />

      <div className="game-controls">
        {gameState === GAME_STATES.FINISHED && (
          <button className="reset-button" onClick={resetGame}>
            Nouvelle Partie
          </button>
        )}

        <button className="lobby-button" onClick={leaveGame}>
          Quitter la partie
        </button>
      </div>

      {errorMessage && (
        <div className="error-overlay">
          <div className="error-message-overlay">
            <h3>Erreur</h3>
            <p>{errorMessage}</p>
            <button className="primary-button" onClick={leaveGame}>
              Retourner au Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectFour;
