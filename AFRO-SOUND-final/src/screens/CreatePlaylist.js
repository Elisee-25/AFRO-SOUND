/**
 * CreatePlaylist.js — AFRO SOUND
 * Crée une playlist persistée dans Supabase.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { createPlaylist } from '../services/playlistService';

export default function CreatePlaylist({ navigation }) {
  const { user, isLoggedIn } = useAuth();
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Oups !', 'Donne un nom à ta playlist.');
      return;
    }
    if (!isLoggedIn) {
      Alert.alert('Connexion requise', 'Tu dois être connecté pour créer une playlist.', [
        { text: 'Se connecter', onPress: () => navigation.navigate('Register') },
        { text: 'Annuler', style: 'cancel' },
      ]);
      return;
    }

    setLoading(true);
    try {
      await createPlaylist(user.id, name.trim());
      setName('');
      Alert.alert('✅ Créée !', `La playlist "${name.trim()}" est prête.`, [
        { text: 'OK', onPress: () => navigation.navigate('Bibliothèque') },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <Text style={styles.title}>Nouvelle Playlist</Text>
      <Text style={styles.subtitle}>Partagez vos sons préférés avec le monde.</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : Ma playlist Afrobeats..."
        placeholderTextColor={Colors.muted}
        value={name}
        onChangeText={setName}
        returnKeyType="done"
        onSubmitEditing={handleCreate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={loading}
        activeOpacity={0.8}>
        {loading
          ? <ActivityIndicator color={Colors.background} />
          : <Text style={styles.buttonText}>Créer</Text>
        }
      </TouchableOpacity>

      {!isLoggedIn && (
        <Text style={styles.notice}>
          ⚠️ Tu dois être connecté pour sauvegarder une playlist.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  title:    { color: Colors.text, fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: Colors.muted, fontSize: 15, textAlign: 'center', marginBottom: 36 },
  input: {
    width: '100%', backgroundColor: Colors.surface,
    color: Colors.text, paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 10, fontSize: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary, paddingVertical: 16,
    paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center',
  },
  buttonText: { color: Colors.background, fontSize: 18, fontWeight: 'bold' },
  notice: { color: Colors.accent, fontSize: 13, textAlign: 'center', marginTop: 20 },
});
