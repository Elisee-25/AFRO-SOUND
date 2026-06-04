/**
 * PlayerBar.js — Barre de lecture persistante (bas de l'écran)
 * Connectée au PlayerContext et usePlaybackState réels.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme';
import { usePlayer, usePlaybackState, State } from '../context/PlayerContext';

export default function PlayerBar() {
  const navigation              = useNavigation();
  const { currentTrack, togglePlayPause } = usePlayer();
  const playbackState           = usePlaybackState();
  const isPlaying               = playbackState?.state === State.Playing;

  // Masquer si aucune piste
  if (!currentTrack) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('NowPlaying', { track: currentTrack })}
      activeOpacity={0.9}>

      {/* Pochette */}
      <Image
        source={
          currentTrack.artwork
            ? { uri: currentTrack.artwork }
            : require('../../assets/images/logo.png')
        }
        style={styles.cover}
      />

      {/* Titre + Artiste */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>

      {/* Bouton Play / Pause */}
      <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={22}
          color={Colors.background}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: Colors.surfaceLight,
  },
  info: { flex: 1 },
  title:  { color: Colors.text, fontSize: 14, fontWeight: '600' },
  artist: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  playButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
