import React from "react";
import Cell from "./Cell";
import { ROWS, COLS } from "../utils/gameLogic";

const Board = ({
  board,
  onColumnClick,
  winningCells,
  animatingCell,
  disabled = false,
}) => {
  const isWinningCell = (row, col) => {
    return winningCells.some((cell) => cell.row === row && cell.col === col);
  };

  const isAnimatingCell = (row, col) => {
    return (
      animatingCell && animatingCell.row === row && animatingCell.col === col
    );
  };

  const handleColumnClick = (col) => {
    if (disabled) return;
    onColumnClick(col);
  };

  return (
    <div className="board">
      <div className="board-grid">
        {Array(ROWS)
          .fill(null)
          .map((_, row) => (
            <div key={row} className="board-row">
              {Array(COLS)
                .fill(null)
                .map((_, col) => (
                  <Cell
                    key={`${row}-${col}`}
                    value={board[row][col]}
                    row={row}
                    col={col}
                    isWinning={isWinningCell(row, col)}
                    animating={isAnimatingCell(row, col)}
                  />
                ))}
            </div>
          ))}
      </div>

      <div className="column-buttons">
        {Array(COLS)
          .fill(null)
          .map((_, col) => (
            <button
              key={col}
              className="column-button"
              onClick={() => handleColumnClick(col)}
              disabled={board[0][col] !== 0}
            >
              ↓
            </button>
          ))}
      </div>
    </div>
  );
};

export default Board;
