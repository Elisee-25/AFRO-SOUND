/**
 * App.tsx — AFRO SOUND
 * Point d'entrée. AuthProvider en dehors de PlayerProvider car
 * PlayerContext a besoin du user pour l'historique.
 */
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppNavigator />
      </PlayerProvider>
    </AuthProvider>
  );
}
