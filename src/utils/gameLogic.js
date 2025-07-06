export const ROWS = 6;
export const COLS = 7;
export const PLAYER1 = 1;
export const PLAYER2 = 2;

export const createEmptyBoard = () => {
  return Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));
};

export const dropPiece = (board, col, player) => {
  const newBoard = board.map((row) => [...row]);

  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === 0) {
      newBoard[row][col] = player;
      return { board: newBoard, row };
    }
  }
  return null;
};

export const checkWin = (board, row, col, player) => {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal /
    [1, -1], // diagonal \
  ];

  for (let [deltaRow, deltaCol] of directions) {
    let count = 1; // count the piece we just placed

    // Check in one direction
    let r = row + deltaRow;
    let c = col + deltaCol;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r += deltaRow;
      c += deltaCol;
    }

    // Check in opposite direction
    r = row - deltaRow;
    c = col - deltaCol;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r -= deltaRow;
      c -= deltaCol;
    }

    if (count >= 4) {
      return true;
    }
  }

  return false;
};

export const isBoardFull = (board) => {
  return board[0].every((cell) => cell !== 0);
};

export const isValidMove = (board, col) => {
  return col >= 0 && col < COLS && board[0][col] === 0;
};
