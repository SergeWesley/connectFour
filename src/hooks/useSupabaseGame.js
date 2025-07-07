import { useState, useCallback, useRef, useEffect } from "react";
import { gamesAPI, supabase } from "../utils/supabase";
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
  CREATING: "creating",
  JOINING: "joining",
  WAITING_FOR_PLAYER: "waiting_for_player",
  PLAYING: "playing",
  FINISHED: "finished",
  ERROR: "error",
};

export const useSupabaseGame = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LOBBY);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
  const [myPlayer, setMyPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [animatingCell, setAnimatingCell] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHost, setIsHost] = useState(false);

  const subscription = useRef(null);

  // Check if Supabase is configured
  useEffect(() => {
    if (!supabase) {
      setErrorMessage(
        "Configuration Supabase manquante. Veuillez configurer vos variables d'environnement pour utiliser le mode multijoueur.",
      );
      setGameState(GAME_STATES.ERROR);
    }
  }, []);

  // Find winning cells (copied from original ConnectFour.js)
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

  // Handle game updates from Supabase
  const handleGameUpdate = useCallback((payload) => {
    console.log("Game update received:", payload);

    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === "UPDATE" && newRecord) {
      const gameData = newRecord;

      // Update local state with server data
      setBoard(gameData.board);
      setCurrentPlayer(gameData.turn);
      setWinner(gameData.winner);

      if (gameData.winner) {
        setGameOver(true);
        setGameState(GAME_STATES.FINISHED);

        // Find winning cells if there's a winner
        if (gameData.winner !== 0) {
          // We need to find the last move to highlight winning cells
          // For now, we'll just mark the game as finished
          // TODO: Store last move position to highlight winning cells
        }
      } else if (isBoardFull(gameData.board)) {
        setGameOver(true);
        setGameState(GAME_STATES.FINISHED);
      } else {
        setGameState(GAME_STATES.PLAYING);
      }
    }
  }, []);

  // Create a new game
  const createGame = useCallback(async () => {
    try {
      setGameState(GAME_STATES.CREATING);
      setErrorMessage("");

      const game = await gamesAPI.createGame();
      setGameId(game.id);
      setBoard(game.board);
      setCurrentPlayer(game.turn);
      setMyPlayer(PLAYER1); // Host is always player 1
      setIsHost(true);
      setGameState(GAME_STATES.WAITING_FOR_PLAYER);

      // Subscribe to game updates
      subscription.current = gamesAPI.subscribeToGame(
        game.id,
        handleGameUpdate,
      );

      return game.id;
    } catch (error) {
      console.error("Error creating game:", error);
      setErrorMessage("Erreur lors de la création du jeu");
      setGameState(GAME_STATES.ERROR);
    }
  }, [handleGameUpdate]);

  // Join an existing game
  const joinGame = useCallback(
    async (gameIdToJoin) => {
      try {
        setGameState(GAME_STATES.JOINING);
        setErrorMessage("");

        const game = await gamesAPI.getGame(gameIdToJoin);
        setGameId(game.id);
        setBoard(game.board);
        setCurrentPlayer(game.turn);
        setMyPlayer(PLAYER2); // Joiner is always player 2
        setIsHost(false);

        if (game.winner !== null) {
          setWinner(game.winner);
          setGameOver(true);
          setGameState(GAME_STATES.FINISHED);
        } else {
          setGameState(GAME_STATES.PLAYING);
        }

        // Subscribe to game updates
        subscription.current = gamesAPI.subscribeToGame(
          game.id,
          handleGameUpdate,
        );
      } catch (error) {
        console.error("Error joining game:", error);
        setErrorMessage(
          "Erreur lors de la connexion au jeu. Vérifiez l'ID du jeu.",
        );
        setGameState(GAME_STATES.ERROR);
      }
    },
    [handleGameUpdate],
  );

  // Make a move
  const makeMove = useCallback(
    async (col) => {
      if (
        gameState !== GAME_STATES.PLAYING ||
        gameOver ||
        currentPlayer !== myPlayer ||
        !isValidMove(board, col)
      ) {
        return false;
      }

      try {
        const result = dropPiece(board, col, myPlayer);
        if (!result) return false;

        const { board: newBoard, row } = result;

        // Set animation locally first for immediate feedback
        setAnimatingCell({ row, col });

        // Check for win
        let winner = null;
        let winCells = [];

        if (checkWin(newBoard, row, col, myPlayer)) {
          winner = myPlayer;
          winCells = findWinningCells(newBoard, row, col, myPlayer);
          setWinningCells(winCells);
        } else if (isBoardFull(newBoard)) {
          winner = 0; // Draw
        }

        // Update the game on the server
        const nextPlayer = myPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        await gamesAPI.makeMove(
          gameId,
          newBoard,
          winner ? currentPlayer : nextPlayer,
          winner,
        );

        // Clear animation after a delay
        setTimeout(() => {
          setAnimatingCell(null);
        }, 300);

        return true;
      } catch (error) {
        console.error("Error making move:", error);
        setErrorMessage("Erreur lors du coup");
        return false;
      }
    },
    [board, currentPlayer, myPlayer, gameOver, gameState, gameId],
  );

  // Reset game
  const resetGame = useCallback(async () => {
    if (!gameId) return;

    try {
      await gamesAPI.resetGame(gameId);
      setWinningCells([]);
      setAnimatingCell(null);
      setGameOver(false);
      setWinner(null);
      // Board and turn will be updated via the subscription
    } catch (error) {
      console.error("Error resetting game:", error);
      setErrorMessage("Erreur lors de la réinitialisation");
    }
  }, [gameId]);

  // Leave game and return to lobby
  const leaveGame = useCallback(() => {
    if (subscription.current) {
      gamesAPI.unsubscribeFromGame(subscription.current);
      subscription.current = null;
    }

    // Reset all state
    setGameState(GAME_STATES.LOBBY);
    setGameId(null);
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setMyPlayer(null);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setAnimatingCell(null);
    setErrorMessage("");
    setIsHost(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscription.current) {
        gamesAPI.unsubscribeFromGame(subscription.current);
      }
    };
  }, []);

  return {
    // Game state
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

    // Actions
    createGame,
    joinGame,
    makeMove,
    resetGame,
    leaveGame,
  };
};

export default useSupabaseGame;
