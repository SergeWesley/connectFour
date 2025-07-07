-- Script SQL pour configurer la base de données Supabase pour le jeu Puissance 4

-- Créer la table games
CREATE TABLE IF NOT EXISTS public.games (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    board JSON NOT NULL DEFAULT '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]',
    turn INTEGER NOT NULL DEFAULT 1,
    winner INTEGER DEFAULT NULL
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre à tous de lire et modifier les jeux
-- Note: En production, vous voudrez probablement des politiques plus restrictives
CREATE POLICY "Allow all operations on games" ON public.games
    FOR ALL USING (true) WITH CHECK (true);

-- Activer les publications pour Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;

-- Commandes à exécuter dans l'éditeur SQL de Supabase :
-- 1. Copiez et collez ce script dans l'éditeur SQL de votre dashboard Supabase
-- 2. Exécutez le script
-- 3. Vérifiez que la table 'games' a été créée dans l'onglet "Table Editor"
-- 4. Vérifiez que Realtime est activé dans l'onglet "Database" > "Replication"

-- Structure de la table games :
-- id: Identifiant unique du jeu (auto-incrémenté)
-- created_at: Date et heure de création du jeu
-- board: État du plateau de jeu au format JSON (6x7 grille)
-- turn: Joueur dont c'est le tour (1 ou 2)
-- winner: Joueur gagnant (1, 2, ou NULL pour match en cours, 0 pour match nul)

-- Exemple d'état initial du plateau :
-- [
--   [0,0,0,0,0,0,0],
--   [0,0,0,0,0,0,0],
--   [0,0,0,0,0,0,0],
--   [0,0,0,0,0,0,0],
--   [0,0,0,0,0,0,0],
--   [0,0,0,0,0,0,0]
-- ]
-- où 0 = case vide, 1 = joueur rouge, 2 = joueur jaune
