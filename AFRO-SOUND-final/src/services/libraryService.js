/**
 * libraryService.js
 * Titres likés + historique d'écoute — tout via Supabase.
 */
import { supabase } from '../supabaseClient';

// ══════════════════════════════════════════
//  LIKED SONGS
// ══════════════════════════════════════════

/** Récupère tous les titres likés par l'utilisateur */
export const getLikedSongs = async (userId) => {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('id, song_id, song_data, liked_at')
    .eq('user_id', userId)
    .order('liked_at', { ascending: false });
  if (error) throw error;

  // Retourne les track objects directement
  return data.map((row) => ({ ...row.song_data, likedRowId: row.id }));
};

/** Like un titre (idempotent grâce au UNIQUE(user_id, song_id)) */
export const likeSong = async (userId, track) => {
  const { data, error } = await supabase
    .from('liked_songs')
    .upsert(
      {
        user_id:   userId,
        song_id:   track.id,
        song_data: {
          id:       track.id,
          title:    track.title,
          artist:   track.artist,
          audioUrl: track.audioUrl,
          cover:    track.cover || track.cover_url || null,
          duration: track.duration || 30,
          source:   track.source || 'external',
        },
      },
      { onConflict: 'user_id,song_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Unlike un titre */
export const unlikeSong = async (userId, songId) => {
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId);
  if (error) throw error;
};

/** Vérifie si un titre est liké */
export const isSongLiked = async (userId, songId) => {
  const { data } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .maybeSingle();
  return !!data;
};

// ══════════════════════════════════════════
//  HISTORIQUE D'ÉCOUTE
// ══════════════════════════════════════════

/** Enregistre une écoute */
export const recordListen = async (userId, track) => {
  const { error } = await supabase
    .from('listening_history')
    .insert({
      user_id:  userId,
      song_id:  track.id,
      song_data: {
        id:       track.id,
        title:    track.title,
        artist:   track.artist,
        audioUrl: track.audioUrl,
        cover:    track.cover || track.cover_url || null,
        duration: track.duration || 30,
        source:   track.source || 'external',
      },
    });
  if (error) console.warn('[history] Erreur:', error.message);
};

/** Récupère l'historique récent (max 50) */
export const getListeningHistory = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('listening_history')
    .select('song_data, listened_at')
    .eq('user_id', userId)
    .order('listened_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => row.song_data);
};
