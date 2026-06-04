/**
 * supabaseClient.js
 * Point d'entrée unique pour Supabase dans toute l'app.
 *
 * ⚠️  Remplace les deux valeurs ci-dessous par celles de ton projet :
 *      Supabase Dashboard > Settings > API
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://tsolrtjxbrjnbxgxbjah.supabase.co';
const SUPABASE_ANON = 'sb_publishable_Z9Z9z5obxb310YjELjGFLg_Ilhe8UN7';   // clé "anon public" uniquement

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,       // session gardée entre les lancements
    autoRefreshToken: true,     // rafraîchit le token silencieusement
    detectSessionInUrl: false,  // pas de redirect URL dans React Native
  },
});
