import { createClient } from "@supabase/supabase-js";

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validation de la configuration
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "YOUR_SUPABASE_URL" ||
  supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY"
) {
  console.warn("⚠️ Configuration Supabase manquante!");
  console.warn(
    "Veuillez configurer REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY dans votre fichier .env",
  );
  console.warn(
    "Le mode multijoueur ne fonctionnera pas sans cette configuration.",
  );
}

// Créer le client Supabase seulement si la configuration est valide
export const supabase =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "YOUR_SUPABASE_URL" &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY"
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// Types pour les jeux
export const GAME_STATUS = {
  WAITING: 1,
  PLAYING: 2,
  FINISHED: 3,
};

// Fonctions utilitaires pour la table games
export const gamesAPI = {
  // Créer un nouveau jeu
  async createGame() {
    if (!supabase) {
      throw new Error(
        "Supabase n'est pas configuré. Veuillez ajouter vos variables d'environnement.",
      );
    }

    const { data, error } = await supabase
      .from("games")
      .insert([
        {
          board: Array(6)
            .fill(null)
            .map(() => Array(7).fill(0)),
          turn: 1,
          winner: null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer un jeu par ID
  async getGame(gameId) {
    if (!supabase) {
      throw new Error(
        "Supabase n'est pas configuré. Veuillez ajouter vos variables d'environnement.",
      );
    }

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un jeu
  async updateGame(gameId, updates) {
    if (!supabase) {
      throw new Error(
        "Supabase n'est pas configuré. Veuillez ajouter vos variables d'environnement.",
      );
    }

    const { data, error } = await supabase
      .from("games")
      .update(updates)
      .eq("id", gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Faire un coup
  async makeMove(gameId, board, turn, winner = null) {
    const { data, error } = await supabase
      .from("games")
      .update({
        board,
        turn,
        winner,
      })
      .eq("id", gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Réinitialiser un jeu
  async resetGame(gameId) {
    const { data, error } = await supabase
      .from("games")
      .update({
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(0)),
        turn: 1,
        winner: null,
      })
      .eq("id", gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // S'abonner aux changements d'un jeu
  subscribeToGame(gameId, callback) {
    return supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        callback,
      )
      .subscribe();
  },

  // Se désabonner
  unsubscribeFromGame(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};

export default supabase;
