/**
 * Register.js — AFRO SOUND
 * Écran unique Inscription / Connexion.
 * Utilise authService (plus d'appel direct à supabase ici).
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import theme, { Colors } from '../theme';
import { signUp, signIn } from '../services/authService';

export default function Register({ navigation }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'signup' && !username)) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp({ email, password, username });
        Alert.alert('Compte créé !', 'Vérifie ta boîte mail pour confirmer ton compte.', [
          { text: 'OK', onPress: () => navigation.replace('Home') },
        ]);
      } else {
        await signIn({ email, password });
        navigation.replace('Home');
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={theme.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo / Titre */}
        <Text style={styles.logo}>🎵 AFRO SOUND</Text>
        <Text style={styles.tagline}>Ta musique africaine, partout.</Text>

        {/* Onglets Login / Inscription */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}>
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => setMode('signup')}>
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* Champs */}
        {mode === 'signup' && (
          <TextInput
            placeholder="Nom d'utilisateur"
            placeholderTextColor={Colors.muted}
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          placeholder="Adresse email"
          placeholderTextColor={Colors.muted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={Colors.muted}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Bouton principal */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}>
          {loading
            ? <ActivityIndicator color={Colors.background} />
            : <Text style={styles.buttonText}>
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </Text>
          }
        </TouchableOpacity>

        {/* Continuer sans compte */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.replace('Home')}>
          <Text style={styles.skipText}>Continuer sans compte</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 48,
  },
  logo:    { color: Colors.primary, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  tagline: { color: Colors.muted, fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 40 },

  tabs: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 12, padding: 4, marginBottom: 28,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary },
  tabText:   { color: Colors.muted, fontWeight: '600' },
  tabTextActive: { color: Colors.background },

  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: Colors.background, fontSize: 16, fontWeight: '700' },

  skipBtn: { marginTop: 24, alignItems: 'center' },
  skipText: { color: Colors.muted, fontSize: 14 },
});
