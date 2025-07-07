import { useState, useCallback, useRef, useEffect } from "react";
import { P2PConnection, MESSAGE_TYPES } from "../utils/p2pConnection";
import {
  createEmptyBoard,
  dropPiece,
  checkWin,
  isBoardFull,
  isValidMove,
  PLAYER1,
  PLAYER2,
} from "../utils/gameLogic";

export const GAME_STATES = {
  LOBBY: "lobby",
  CONNECTING: "connecting",
  WAITING_FOR_PLAYER: "waiting_for_player",
  READY: "ready",
  PLAYING: "playing",
  FINISHED: "finished",
  DISCONNECTED: "disconnected",
};

export const useP2PGame = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LOBBY);
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
  const [myPlayer, setMyPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [animatingCell, setAnimatingCell] = useState(null);
  const [connectionCode, setConnectionCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [opponentConnected, setOpponentConnected] = useState(false);

  const p2pConnection = useRef(null);

  // Initialize P2P connection
  useEffect(() => {
    p2pConnection.current = new P2PConnection();

    p2pConnection.current.setOnConnect(() => {
      setOpponentConnected(true);
      setGameState(GAME_STATES.READY);
      setErrorMessage("");
    });

    p2pConnection.current.setOnDisconnect(() => {
      setOpponentConnected(false);
      setGameState(GAME_STATES.DISCONNECTED);
    });

    p2pConnection.current.setOnError((error) => {
      setErrorMessage(`Erreur de connexion: ${error.message}`);
      setGameState(GAME_STATES.LOBBY);
    });

    p2pConnection.current.setOnMessage(handleP2PMessage);

    return () => {
      if (p2pConnection.current) {
        p2pConnection.current.disconnect();
      }
    };
  }, []);

  // Handle incoming P2P messages
  const handleP2PMessage = useCallback((message) => {
    switch (message.type) {
      case MESSAGE_TYPES.GAME_MOVE:
        handleOpponentMove(message.data);
        break;
      case MESSAGE_TYPES.GAME_STATE:
        handleGameStateSync(message.data);
        break;
      case MESSAGE_TYPES.GAME_RESET:
        handleGameReset();
        break;
      case MESSAGE_TYPES.PLAYER_READY:
        setGameState(GAME_STATES.PLAYING);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }, []);

  // Handle opponent's move
  const handleOpponentMove = useCallback(
    (moveData) => {
      const { col, player } = moveData;
      const result = dropPiece(board, col, player);

      if (result) {
        const { board: newBoard, row } = result;

        setAnimatingCell({ row, col });

        setTimeout(() => {
          setBoard(newBoard);
          setAnimatingCell(null);

          if (checkWin(newBoard, row, col, player)) {
            const winCells = findWinningCells(newBoard, row, col, player);
            setWinningCells(winCells);
            setWinner(player);
            setGameOver(true);
            setGameState(GAME_STATES.FINISHED);
          } else if (isBoardFull(newBoard)) {
            setGameOver(true);
            setGameState(GAME_STATES.FINISHED);
          } else {
            setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1);
          }
        }, 300);
      }
    },
    [board, currentPlayer],
  );

  // Sync game state
  const handleGameStateSync = useCallback((stateData) => {
    setBoard(stateData.board);
    setCurrentPlayer(stateData.currentPlayer);
    setGameOver(stateData.gameOver);
    setWinner(stateData.winner);
    setWinningCells(stateData.winningCells || []);
  }, []);

  // Handle game reset
  const handleGameReset = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setAnimatingCell(null);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  // Find winning cells (copied from ConnectFour.js)
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

  // Create new room (host)
  const createRoom = useCallback(async () => {
    try {
      setGameState(GAME_STATES.CONNECTING);
      setIsHost(true);
      setMyPlayer(PLAYER1);
      const code = await p2pConnection.current.createRoom();
      setConnectionCode(code);
      setGameState(GAME_STATES.WAITING_FOR_PLAYER);
    } catch (error) {
      setErrorMessage(
        `Erreur lors de la création de la salle: ${error.message}`,
      );
      setGameState(GAME_STATES.LOBBY);
    }
  }, []);

  // Join room with code
  const joinRoom = useCallback(async (code) => {
    try {
      setGameState(GAME_STATES.CONNECTING);
      setIsHost(false);
      setMyPlayer(PLAYER2);
      const answerCode = await p2pConnection.current.joinRoom(code);
      return answerCode;
    } catch (error) {
      setErrorMessage(`Erreur lors de la connexion: ${error.message}`);
      setGameState(GAME_STATES.LOBBY);
      throw error;
    }
  }, []);

  // Complete connection (for host)
  const completeConnection = useCallback(async (answerCode) => {
    try {
      await p2pConnection.current.completeConnection(answerCode);
    } catch (error) {
      setErrorMessage(`Erreur lors de la finalisation: ${error.message}`);
      setGameState(GAME_STATES.LOBBY);
    }
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    p2pConnection.current.sendMessage({
      type: MESSAGE_TYPES.PLAYER_READY,
    });
  }, []);

  // Make a move
  const makeMove = useCallback(
    (col) => {
      if (
        gameState !== GAME_STATES.PLAYING ||
        gameOver ||
        currentPlayer !== myPlayer ||
        !isValidMove(board, col)
      ) {
        return false;
      }

      const result = dropPiece(board, col, myPlayer);
      if (!result) return false;

      const { board: newBoard, row } = result;

      // Send move to opponent
      p2pConnection.current.sendMessage({
        type: MESSAGE_TYPES.GAME_MOVE,
        data: { col, player: myPlayer },
      });

      // Update local state
      setAnimatingCell({ row, col });

      setTimeout(() => {
        setBoard(newBoard);
        setAnimatingCell(null);

        // Check for win
        if (checkWin(newBoard, row, col, myPlayer)) {
          const winCells = findWinningCells(newBoard, row, col, myPlayer);
          setWinningCells(winCells);
          setWinner(myPlayer);
          setGameOver(true);
          setGameState(GAME_STATES.FINISHED);
        } else if (isBoardFull(newBoard)) {
          setGameOver(true);
          setGameState(GAME_STATES.FINISHED);
        } else {
          setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1);
        }
      }, 300);

      return true;
    },
    [board, currentPlayer, myPlayer, gameOver, gameState],
  );

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setAnimatingCell(null);
    setGameState(GAME_STATES.PLAYING);

    // Notify opponent
    p2pConnection.current.sendMessage({
      type: MESSAGE_TYPES.GAME_RESET,
    });
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (p2pConnection.current) {
      p2pConnection.current.disconnect();
    }
    setGameState(GAME_STATES.LOBBY);
    setOpponentConnected(false);
    setConnectionCode("");
    setIsHost(false);
    setMyPlayer(null);
    setErrorMessage("");
  }, []);

  // Return to lobby
  const returnToLobby = useCallback(() => {
    disconnect();
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setAnimatingCell(null);
  }, [disconnect]);

  return {
    // Game state
    gameState,
    board,
    currentPlayer,
    myPlayer,
    gameOver,
    winner,
    winningCells,
    animatingCell,

    // Connection state
    connectionCode,
    isHost,
    opponentConnected,
    errorMessage,

    // Actions
    createRoom,
    joinRoom,
    completeConnection,
    startGame,
    makeMove,
    resetGame,
    disconnect,
    returnToLobby,
  };
};

export default useP2PGame;
