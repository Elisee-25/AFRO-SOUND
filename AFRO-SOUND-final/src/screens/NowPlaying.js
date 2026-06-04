/**
 * NowPlaying.js — AFRO SOUND
 * Lecteur plein écran. Utilise useProgress() réel (pas de setInterval).
 * Like/Unlike persisté dans Supabase.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, Animated, Easing, Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme, { Colors } from '../theme';
import {
  usePlayer, usePlaybackState, useProgress, State,
} from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { likeSong, unlikeSong, isSongLiked } from '../services/libraryService';

const fmt = (secs) => {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
};

export default function NowPlaying({ navigation, route }) {
  const { user }                         = useAuth();
  const { togglePlayPause, skipToNext, skipToPrevious, seekTo, currentTrack } = usePlayer();
  const playbackState                    = usePlaybackState();
  const { position, duration }           = useProgress();
  const isPlaying                        = playbackState?.state === State.Playing;

  // Utilise le track passé en params OU le currentTrack du contexte
  const track = currentTrack || route.params?.track || {};

  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Animation rotation de la pochette
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnim  = useRef(null);

  useEffect(() => {
    spinAnim.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    if (isPlaying) spinAnim.current.start();
    else spinAnim.current.stop();
    return () => spinAnim.current?.stop();
  }, [isPlaying]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Vérifie si le titre est liké
  useEffect(() => {
    if (!user || !track?.id) return;
    isSongLiked(user.id, track.id)
      .then(setIsLiked)
      .catch(() => {});
  }, [user, track?.id]);

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connecte-toi pour liker des titres.');
      return;
    }
    setLikeLoading(true);
    try {
      if (isLiked) {
        await unlikeSong(user.id, track.id);
        setIsLiked(false);
      } else {
        await likeSong(user.id, track);
        setIsLiked(true);
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <View style={theme.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Lecture en cours</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Pochette rotative */}
      <View style={styles.artContainer}>
        <Animated.Image
          source={
            track.artwork || track.cover || track.cover_url
              ? { uri: track.artwork || track.cover || track.cover_url }
              : require('../../assets/images/logo.png')
          }
          style={[styles.art, { transform: [{ rotate: spin }] }]}
        />
      </View>

      {/* Titre + Artiste + Like */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <View style={styles.artistRow}>
          <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          <TouchableOpacity onPress={handleLike} disabled={likeLoading}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#EF4444' : Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de progression (useProgress réel) */}
      <View style={styles.progressSection}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.surfaceLight}
          thumbTintColor={Colors.primary}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{fmt(position)}</Text>
          <Text style={styles.timeText}>{fmt(duration)}</Text>
        </View>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={26} color={Colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn} onPress={skipToPrevious}>
          <Ionicons name="play-skip-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigBtn} onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color={Colors.background}
            style={{ marginLeft: isPlaying ? 0 : 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn} onPress={skipToNext}>
          <Ionicons name="play-skip-forward" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={26} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Actions bas */}
      <View style={styles.bottomActions}>
        {[
          { icon: isLiked ? 'heart' : 'heart-outline', label: 'Like', onPress: handleLike },
          { icon: 'text-outline', label: 'Paroles', onPress: () => navigation.navigate('Lyrics') },
          { icon: 'list-outline', label: 'File', onPress: () => {} },
          { icon: 'share-social-outline', label: 'Partager', onPress: () => {} },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={a.onPress}>
            <Ionicons name={a.icon} size={20} color={Colors.primary} />
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 8,
  },
  headerLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  headerIcon:  { width: 40, alignItems: 'center' },
  artContainer: { paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' },
  art: { width: 300, height: 300, borderRadius: 24 },
  trackInfo: { paddingHorizontal: 24, marginTop: 20, alignItems: 'center' },
  trackTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  artistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  trackArtist: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  progressSection: { paddingHorizontal: 24, marginTop: 16 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  timeText: { color: Colors.muted, fontSize: 12 },
  controls: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingHorizontal: 20,
  },
  smallBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  bigBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, paddingHorizontal: 16 },
  actionBtn: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', minWidth: 72,
  },
  actionLabel: { color: Colors.primary, fontSize: 11, fontWeight: '600', marginTop: 4 },
});
