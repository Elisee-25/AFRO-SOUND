/**
 * AuthContext.js
 * Gestion globale de la session Supabase dans toute l'app.
 * Écoute onAuthStateChange → met à jour user + profile automatiquement.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // 1. Récupère la session existante au démarrage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      else setLoading(false);
    });

    // 2. Écoute les changements d'état (login / logout / token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const prof = await getProfile(userId);
      setProfile(prof);
    } catch (e) {
      console.warn('[AuthContext] loadProfile:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    if (session?.user) loadProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user:    session?.user ?? null,
        profile,
        loading,
        isLoggedIn: !!session,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
