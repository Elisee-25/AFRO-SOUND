/**
 * playlistService.js
 * CRUD playlists et chansons de playlist — tout via Supabase.
 */
import { supabase } from '../supabaseClient';

// ─── Lire les playlists de l'utilisateur ──────────────────
export const getMyPlaylists = async (userId) => {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id,
      name,
      cover_url,
      created_at,
      playlist_songs (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// ─── Créer une playlist ────────────────────────────────────
export const createPlaylist = async (userId, name, coverUrl = null) => {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name, cover_url: coverUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── Supprimer une playlist ────────────────────────────────
export const deletePlaylist = async (playlistId) => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);
  if (error) throw error;
};

// ─── Chansons d'une playlist ───────────────────────────────
export const getPlaylistSongs = async (playlistId) => {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select(`
      id,
      position,
      songs (
        id, title, artist, album, audio_url, cover_url, duration, source
      )
    `)
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });
  if (error) throw error;

  // Aplatit pour avoir un tableau de tracks normalisés
  return data.map((row) => ({
    ...row.songs,
    audioUrl: row.songs.audio_url,
    cover:    row.songs.cover_url,
    playlistSongId: row.id,
    position: row.position,
  }));
};

// ─── Ajouter une chanson à une playlist ───────────────────
export const addSongToPlaylist = async (playlistId, songId, position = 0) => {
  const { data, error } = await supabase
    .from('playlist_songs')
    .insert({ playlist_id: playlistId, song_id: songId, position })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── Retirer une chanson d'une playlist ───────────────────
export const removeSongFromPlaylist = async (playlistSongId) => {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('id', playlistSongId);
  if (error) throw error;
};
