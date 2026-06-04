/**
 * PlayerContext.js — AFRO SOUND
 * Lecteur audio global avec react-native-track-player.
 * Intègre l'historique d'écoute Supabase automatiquement.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TrackPlayer, {
  Capability,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';
import { useAuth } from './AuthContext';
import { recordListen } from '../services/libraryService';

const PlayerContext = createContext(null);

let playerReady = false;

const setupPlayer = async () => {
  if (playerReady) return;
  try {
    await TrackPlayer.setupPlayer({ maxCacheSize: 1024 * 5 });
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play, Capability.Pause,
        Capability.SkipToNext, Capability.SkipToPrevious,
        Capability.SeekTo, Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      notificationCapabilities: [
        Capability.Play, Capability.Pause,
        Capability.SkipToNext, Capability.SkipToPrevious,
      ],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    playerReady = true;
  } catch {
    playerReady = true;
  }
};

// Convertit un track AFRO SOUND → format TrackPlayer
const toTP = (t) => ({
  id:       t.id,
  url:      t.audioUrl,
  title:    t.title,
  artist:   t.artist,
  album:    t.album || '',
  artwork:  t.cover || t.cover_url || '',
  duration: t.duration || 30,
  // On garde les données originales pour l'historique
  _original: t,
});

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue]               = useState([]);
  const [isSetup, setIsSetup]           = useState(false);

  // Écoute le changement de piste → met à jour l'état + enregistre l'écoute
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.track) {
      setCurrentTrack(event.track);
      // Enregistre dans l'historique si connecté
      if (user && event.track._original) {
        recordListen(user.id, event.track._original).catch(() => {});
      }
    }
  });

  const playTrack = useCallback(async (track, tracks = []) => {
    try {
      if (!isSetup) {
        await setupPlayer();
        setIsSetup(true);
      }

      const trackList = tracks.length > 0 ? tracks : [track];

      await TrackPlayer.reset();
      await TrackPlayer.add(trackList.map(toTP));

      const idx = trackList.findIndex((t) => t.id === track.id);
      if (idx > 0) await TrackPlayer.skip(idx);

      await TrackPlayer.play();
      setCurrentTrack(toTP(track));
      setQueue(trackList);
    } catch (e) {
      console.error('[PlayerContext] playTrack:', e.message);
    }
  }, [isSetup]);

  // Contrôles
  const togglePlayPause = useCallback(async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, []);

  const skipToNext     = useCallback(() => TrackPlayer.skipToNext().catch(() => {}), []);
  const skipToPrevious = useCallback(() => TrackPlayer.skipToPrevious().catch(() => {}), []);
  const seekTo         = useCallback((pos) => TrackPlayer.seekTo(pos), []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      queue,
      playTrack,
      togglePlayPause,
      skipToNext,
      skipToPrevious,
      seekTo,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider');
  return ctx;
};

// Ré-exports pratiques pour les écrans
export { usePlaybackState, useProgress, State };
