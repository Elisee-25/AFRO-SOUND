import React from 'react';
import {View, ActivityIndicator, StyleSheet, Image, Text} from 'react-native';
import {Colors} from '../theme';

export default function Loading() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.brand}>AFRO SOUND</Text>
      <Text style={styles.tagline}>Écoute tes racines</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 24,
    marginBottom: 16,
  },
  brand: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: 10,
  },
});
