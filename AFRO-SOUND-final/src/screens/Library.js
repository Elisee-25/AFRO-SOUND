/**
 * Library.js — AFRO SOUND
 * Bibliothèque personnelle : playlists Supabase, titres likés, historique.
 * Playlists persistées en base (plus de state local éphémère).
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Image, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { getMyPlaylists, deletePlaylist } from '../services/playlistService';
import { getLikedSongs, getListeningHistory } from '../services/libraryService';

const TABS = ['Playlists', 'Likés', 'Historique'];

export default function Library({ navigation }) {
  const { user, profile, isLoggedIn } = useAuth();
  const { playTrack }                 = usePlayer();

  const [activeTab, setActiveTab]   = useState('Playlists');
  const [playlists, setPlaylists]   = useState([]);
  const [liked, setLiked]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    setLoading(true);
    try {
      const [pl, lk, hist] = await Promise.all([
        getMyPlaylists(user.id),
        getLikedSongs(user.id),
        getListeningHistory(user.id, 30),
      ]);
      setPlaylists(pl);
      setLiked(lk);
      setHistory(hist);
    } catch (e) {
      console.warn('[Library]', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isLoggedIn]);

  useEffect(() => { loadData(); }, [loadData]);

  // Recharge quand on revient sur l'écran (nouvelle playlist créée)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const handleDeletePlaylist = (id, name) => {
    Alert.alert('Supprimer', `Supprimer la playlist "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await deletePlaylist(id).catch(() => {});
          setPlaylists((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  // ── Écran non connecté ──────────────────────────────────
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bibliothèque</Text>
        <View style={styles.loginPrompt}>
          <Ionicons name="musical-notes-outline" size={64} color={Colors.muted} />
          <Text style={styles.promptText}>
            Connecte-toi pour accéder à tes playlists, titres likés et historique.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Contenu selon l'onglet actif ────────────────────────
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />;

    if (activeTab === 'Playlists') {
      return playlists.length === 0 ? (
        <Text style={styles.emptyText}>Aucune playlist. Crée-en une !</Text>
      ) : playlists.map((pl) => (
        <TouchableOpacity
          key={pl.id}
          style={styles.row}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MusicPage', { playlist: pl })}
          onLongPress={() => handleDeletePlaylist(pl.id, pl.name)}>
          <View style={styles.coverPlaceholder}>
            {pl.cover_url
              ? <Image source={{ uri: pl.cover_url }} style={styles.cover} />
              : <Ionicons name="musical-notes" size={28} color={Colors.primary} />
            }
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>{pl.name}</Text>
            <Text style={styles.rowSub}>
              Playlist • {pl.playlist_songs?.[0]?.count ?? 0} titre(s)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
        </TouchableOpacity>
      ));
    }

    if (activeTab === 'Likés') {
      return liked.length === 0 ? (
        <Text style={styles.emptyText}>Aucun titre liké pour l'instant.</Text>
      ) : liked.map((t, i) => (
        <TouchableOpacity
          key={t.id || i}
          style={styles.row}
          activeOpacity={0.8}
          onPress={() => playTrack(t, liked)}>
          <Image
            source={t.cover ? { uri: t.cover } : require('../../assets/images/logo.png')}
            style={styles.cover}
          />
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>{t.artist}</Text>
          </View>
          <Ionicons name="heart" size={18} color="#EF4444" />
        </TouchableOpacity>
      ));
    }

    // Historique
    return history.length === 0 ? (
      <Text style={styles.emptyText}>Aucune écoute enregistrée.</Text>
    ) : history.map((t, i) => (
      <TouchableOpacity
        key={i}
        style={styles.row}
        activeOpacity={0.8}
        onPress={() => playTrack(t, history)}>
        <Image
          source={t.cover ? { uri: t.cover } : require('../../assets/images/logo.png')}
          style={styles.cover}
        />
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
          <Text style={styles.rowSub} numberOfLines={1}>{t.artist}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bibliothèque</Text>
          {profile && <Text style={styles.username}>@{profile.username}</Text>}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Rechercher')}>
            <Ionicons name="search-outline" size={26} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 20 }}
            onPress={() => navigation.navigate('Créer')}>
            <Ionicons name="add-outline" size={30} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={Colors.primary}
          />
        }>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 56, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:   { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  username:{ color: Colors.muted, fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

  tabs: { flexDirection: 'row', marginBottom: 20 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: Colors.surface, marginRight: 8,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText:   { color: Colors.muted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: Colors.background },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  coverPlaceholder: {
    width: 60, height: 60, borderRadius: 6,
    backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  cover:   { width: 60, height: 60, borderRadius: 6, backgroundColor: Colors.surface },
  rowInfo: { flex: 1, marginLeft: 14 },
  rowTitle:{ color: Colors.text, fontSize: 15, fontWeight: '600' },
  rowSub:  { color: Colors.muted, fontSize: 13, marginTop: 2 },

  emptyText: { color: Colors.muted, textAlign: 'center', marginTop: 40, fontSize: 15 },

  loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  promptText:  { color: Colors.muted, textAlign: 'center', fontSize: 15, marginVertical: 24 },
  loginBtn:    { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  loginBtnText:{ color: Colors.background, fontWeight: '700', fontSize: 16 },
});
