# AFRO SOUND — Guide d'installation (nouveau serveur Supabase)

## 1. Créer le projet Supabase

1. Aller sur https://supabase.com → "New project"
2. Choisir un nom (ex: `afro-sound`), un mot de passe DB fort, région Europe
3. Attendre la création (~2 min)

---

## 2. Exécuter le schéma SQL

Dans **Supabase Dashboard → SQL Editor → New query**, coller et exécuter le contenu de `supabase/schema.sql`.

Cela crée :
- `profiles` (liée à `auth.users` via trigger automatique)
- `songs` (chansons uploadées)
- `playlists` + `playlist_songs`
- `liked_songs`
- `listening_history`
- Toutes les politiques RLS
- Le bucket Storage `afrosound-media` (public)

---

## 3. Configurer les clés dans l'app

Ouvrir `src/supabaseClient.js` et remplacer :

```js
const SUPABASE_URL  = 'https://VOTRE_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'VOTRE_ANON_KEY';
```

Les valeurs se trouvent dans :
**Dashboard → Settings → API → Project URL** et **anon public**

---

## 4. Configurer l'Auth Supabase

Dans **Dashboard → Authentication → URL Configuration** :
- Site URL : `afrosound://` (deep link React Native)
- Redirect URLs : `afrosound://auth/callback`

Dans **Dashboard → Authentication → Providers** :
- Email : activé ✅
- "Confirm email" : désactiver pendant le dev pour tester rapidement

---

## 5. Installer les dépendances

```bash
npm install @supabase/supabase-js react-native-url-polyfill
npm install @react-native-async-storage/async-storage
```

> `react-native-url-polyfill` est requis par le client Supabase en React Native.

Ajouter dans `index.js` (tout en haut, avant tout) :
```js
import 'react-native-url-polyfill/auto';
```

---

## 6. Remplacer les fichiers

Copier les fichiers générés dans ton projet :

| Fichier généré                        | Destination                      |
|---------------------------------------|----------------------------------|
| `App.tsx`                             | racine du projet                 |
| `src/supabaseClient.js`               | `src/`                           |
| `src/context/AuthContext.js`          | `src/context/`                   |
| `src/context/PlayerContext.js`        | `src/context/`                   |
| `src/services/authService.js`         | `src/services/`                  |
| `src/services/musicApi.js`            | `src/services/`                  |
| `src/services/playlistService.js`     | `src/services/`                  |
| `src/services/libraryService.js`      | `src/services/`                  |
| `src/components/PlayerBar.js`         | `src/components/`                |
| `src/navigation/AppNavigator.js`      | `src/navigation/`                |
| `src/screens/Register.js`             | `src/screens/`                   |
| `src/screens/NowPlaying.js`           | `src/screens/`                   |
| `src/screens/Library.js`             | `src/screens/`                   |
| `src/screens/CreatePlaylist.js`       | `src/screens/`                   |

> Les autres screens (Home, Search, MusicPage, Lyrics, etc.) n'ont **pas changé**.

---

## 7. Supprimer le backend Express

Le dossier `backend/` n'est plus nécessaire.
Tout passe directement par Supabase depuis le client React Native.

---

## Architecture finale

```
App.tsx
└── AuthProvider          ← session Supabase globale
    └── PlayerProvider    ← lecteur audio + historique auto
        └── AppNavigator
            ├── GetStarted / ChooseMode / Loading
            ├── Register   ← Connexion + Inscription
            └── MainTabs (Home | Search | CreatePlaylist | Library)
                └── NowPlaying (modal)
```

## Ce qui a été corrigé

| Problème original                          | Solution                                      |
|--------------------------------------------|-----------------------------------------------|
| Playlists locales (perdues au refresh)     | Persistées dans `playlists` Supabase          |
| Pas de connexion                           | Écran Register avec onglets Login/Inscription |
| Pas de session persistante                 | `AuthContext` + `onAuthStateChange`           |
| Backend Express intermédiaire inutile      | Supprimé, Supabase appelé directement         |
| `setInterval` fictif dans NowPlaying       | `useProgress()` réel de TrackPlayer           |
| PlayerBar avec données en dur              | Connectée au `PlayerContext` + `usePlaybackState` |
| Likes non sauvegardés                      | `liked_songs` dans Supabase                   |
| Pas d'historique                           | `listening_history` auto à chaque changement de piste |
