/**
 * PlayerService.js - Service background pour react-native-track-player
 * Ce fichier DOIT être enregistré dans index.js via TrackPlayer.registerPlaybackService
 */
import TrackPlayer, {Event} from 'react-native-track-player';

export async function PlaybackService() {
  // Bouton "Suivant" dans la notification Android
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  // Bouton "Précédent" dans la notification Android
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  // Bouton "Play/Pause" dans la notification Android
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  // Seek (glisser la barre de progression depuis la notification)
  TrackPlayer.addEventListener(Event.RemoteSeek, ({position}) => {
    TrackPlayer.seekTo(position);
  });
}
