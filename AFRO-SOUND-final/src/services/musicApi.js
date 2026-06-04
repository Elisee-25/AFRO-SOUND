/**
 * musicApi.js — AFRO SOUND
 * Sources : Deezer (API publique), iTunes (API publique), Supabase (chansons maison)
 * Plus besoin de backend Express intermédiaire.
 */
import { supabase } from '../supabaseClient';

const DEEZER_BASE = 'https://api.deezer.com';
const ITUNES_BASE = 'https://itunes.apple.com';

// ──────────────────────────────────────────────
//  Normalisation
// ──────────────────────────────────────────────

const normalizeDeezer = (t) => ({
  id:       `deezer_${t.id}`,
  title:    t.title,
  artist:   t.artist?.name || 'Artiste inconnu',
  album:    t.album?.title || '',
  audioUrl: t.preview,
  cover:    t.album?.cover_xl || t.album?.cover_medium || null,
  source:   'deezer',
  duration: t.duration || 30,
});

const normalizeItunes = (t) => ({
  id:       `itunes_${t.trackId}`,
  title:    t.trackName,
  artist:   t.artistName,
  album:    t.collectionName || '',
  audioUrl: t.previewUrl,
  cover:    t.artworkUrl100?.replace('100x100', '600x600') || null,
  source:   'itunes',
  duration: 30,
});

const normalizeSupabase = (t) => ({
  id:       t.id,
  title:    t.title,
  artist:   t.artist,
  album:    t.album || '',
  audioUrl: t.audio_url,
  cover:    t.cover_url || null,
  source:   'supabase',
  duration: t.duration || 30,
});

// ──────────────────────────────────────────────
//  DEEZER
// ──────────────────────────────────────────────

export const searchDeezer = async (query, limit = 20) => {
  try {
    const res  = await fetch(`${DEEZER_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    return (data.data || []).filter((t) => t.preview).map(normalizeDeezer);
  } catch (e) {
    console.warn('[Deezer search]', e.message);
    return [];
  }
};

export const getDeezerAfrobeats = async (limit = 20) => {
  try {
    const res  = await fetch(`${DEEZER_BASE}/chart/116/tracks?limit=${limit}`);
    const data = await res.json();
    return (data.data || []).filter((t) => t.preview).map(normalizeDeezer);
  } catch (e) {
    console.warn('[Deezer afrobeats]', e.message);
    return [];
  }
};

export const getDeezerTopGlobal = async (limit = 20) => {
  try {
    const res  = await fetch(`${DEEZER_BASE}/chart/0/tracks?limit=${limit}`);
    const data = await res.json();
    return (data.data || []).filter((t) => t.preview).map(normalizeDeezer);
  } catch (e) {
    console.warn('[Deezer top]', e.message);
    return [];
  }
};

// ──────────────────────────────────────────────
//  ITUNES
// ──────────────────────────────────────────────

export const searchItunes = async (query, limit = 20) => {
  try {
    const res  = await fetch(
      `${ITUNES_BASE}/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}&entity=song`
    );
    const data = await res.json();
    return (data.results || []).filter((t) => t.previewUrl).map(normalizeItunes);
  } catch (e) {
    console.warn('[iTunes search]', e.message);
    return [];
  }
};

export const getItunesAfrobeats = async (limit = 20) =>
  searchItunes('afrobeats 2024', limit);

// ──────────────────────────────────────────────
//  SUPABASE (chansons maison — sans backend)
// ──────────────────────────────────────────────

/** Toutes les chansons uploadées dans Supabase */
export const getSupabaseSongs = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(normalizeSupabase);
  } catch (e) {
    console.warn('[Supabase songs]', e.message);
    return [];
  }
};

/** Upload une chanson dans Storage + enregistrement en base */
export const uploadSong = async ({ title, artist, album, audioFile, coverFile, userId, duration }) => {
  const timestamp = Date.now();

  // 1. Upload fichier audio
  const audioExt  = audioFile.name.split('.').pop();
  const audioPath = `${userId}/audio_${timestamp}.${audioExt}`;
  const { error: audioError } = await supabase.storage
    .from('afrosound-media')
    .upload(audioPath, audioFile, { contentType: audioFile.type });
  if (audioError) throw audioError;

  const { data: audioData } = supabase.storage
    .from('afrosound-media')
    .getPublicUrl(audioPath);

  // 2. Upload pochette (optionnel)
  let coverPublicUrl = null;
  if (coverFile) {
    const coverExt  = coverFile.name.split('.').pop();
    const coverPath = `${userId}/cover_${timestamp}.${coverExt}`;
    await supabase.storage
      .from('afrosound-media')
      .upload(coverPath, coverFile, { contentType: coverFile.type });
    const { data: coverData } = supabase.storage
      .from('afrosound-media')
      .getPublicUrl(coverPath);
    coverPublicUrl = coverData.publicUrl;
  }

  // 3. Insérer en base
  const { data, error } = await supabase
    .from('songs')
    .insert({
      title,
      artist,
      album:       album || null,
      audio_url:   audioData.publicUrl,
      cover_url:   coverPublicUrl,
      duration:    duration || 30,
      uploaded_by: userId,
      source:      'supabase',
    })
    .select()
    .single();
  if (error) throw error;
  return normalizeSupabase(data);
};

// ──────────────────────────────────────────────
//  RECHERCHE COMBINÉE (Deezer + iTunes + Supabase)
// ──────────────────────────────────────────────

export const searchAll = async (query, limit = 10) => {
  const [deezer, itunes, supa] = await Promise.all([
    searchDeezer(query, limit),
    searchItunes(query, limit),
    getSupabaseSongs(20),
  ]);

  // Filtre Supabase sur le query
  const supaFiltered = supa.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase())
  );

  // Intercale les résultats
  const combined = [];
  const maxLen   = Math.max(deezer.length, itunes.length, supaFiltered.length);
  for (let i = 0; i < maxLen; i++) {
    if (deezer[i])       combined.push(deezer[i]);
    if (supaFiltered[i]) combined.push(supaFiltered[i]);
    if (itunes[i])       combined.push(itunes[i]);
  }
  return combined;
};

// ──────────────────────────────────────────────
//  PAGE D'ACCUEIL
// ──────────────────────────────────────────────

export const getHomeData = async () => {
  const [afrobeats, topGlobal, itunesAfro, customSongs] = await Promise.all([
    getDeezerAfrobeats(10),
    getDeezerTopGlobal(10),
    getItunesAfrobeats(8),
    getSupabaseSongs(10),
  ]);

  return {
    afrobeats,
    topGlobal,
    itunesAfro,
    customSongs,
    recentTracks: [...afrobeats.slice(0, 4), ...customSongs.slice(0, 2)],
  };
};
