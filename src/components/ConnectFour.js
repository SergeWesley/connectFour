import React, { useState, useCallback } from "react";
import Board from "./Board";
import {
  createEmptyBoard,
  dropPiece,
  checkWin,
  isBoardFull,
  isValidMove,
  PLAYER1,
  PLAYER2,
} from "../utils/gameLogic";

const ConnectFour = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [animatingCell, setAnimatingCell] = useState(null);

  const findWinningCells = (board, row, col, player) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal /
      [1, -1], // diagonal \
    ];

    for (let [deltaRow, deltaCol] of directions) {
      const cells = [{ row, col }];

      // Check in one direction
      let r = row + deltaRow;
      let c = col + deltaCol;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        cells.push({ row: r, col: c });
        r += deltaRow;
        c += deltaCol;
      }

      // Check in opposite direction
      r = row - deltaRow;
      c = col - deltaCol;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        cells.push({ row: r, col: c });
        r -= deltaRow;
        c -= deltaCol;
      }

      if (cells.length >= 4) {
        return cells;
      }
    }

    return [];
  };

  const handleColumnClick = useCallback(
    (col) => {
      if (gameOver || !isValidMove(board, col)) return;

      const result = dropPiece(board, col, currentPlayer);
      if (!result) return;

      const { board: newBoard, row } = result;

      // Set animation
      setAnimatingCell({ row, col });

      setTimeout(() => {
        setBoard(newBoard);
        setAnimatingCell(null);

        // Check for win
        if (checkWin(newBoard, row, col, currentPlayer)) {
          const winCells = findWinningCells(newBoard, row, col, currentPlayer);
          setWinningCells(winCells);
          setWinner(currentPlayer);
          setGameOver(true);
        } else if (isBoardFull(newBoard)) {
          setGameOver(true);
        } else {
          setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1);
        }
      }, 300);
    },
    [board, currentPlayer, gameOver],
  );

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setAnimatingCell(null);
  };

  const getStatusMessage = () => {
    if (winner) {
      return `Joueur ${winner === PLAYER1 ? "Rouge" : "Jaune"} gagne !`;
    }
    if (gameOver) {
      return "Match nul !";
    }
    return `Tour du joueur ${currentPlayer === PLAYER1 ? "Rouge" : "Jaune"}`;
  };

  return (
    <div className="connect-four">
      <div className="game-header">
        <h1>Puissance 4</h1>
        <div className={`game-status ${gameOver ? "game-over" : ""}`}>
          {getStatusMessage()}
        </div>
        <div className="current-player">
          <div
            className={`player-indicator ${currentPlayer === PLAYER1 ? "player1" : "player2"}`}
          >
            <div className="piece"></div>
          </div>
        </div>
      </div>

      <Board
        board={board}
        onColumnClick={handleColumnClick}
        winningCells={winningCells}
        animatingCell={animatingCell}
      />

      <div className="game-controls">
        <button className="reset-button" onClick={resetGame}>
          Nouvelle Partie
        </button>
      </div>
    </div>
  );
};

export default ConnectFour;
