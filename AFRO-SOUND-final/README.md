# AFRO SOUND — Guide d'installation (nouveau serveur Supabase)

## 1. Installer les dépendances

```bash
npm install @supabase/supabase-js react-native-url-polyfill
npm install @react-native-async-storage/async-storage
```

> `react-native-url-polyfill` est requis par le client Supabase en React Native.

Ajouter dans `index.js` (tout en haut, avant tout) :
```js
import 'react-native-url-polyfill/auto';
```
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
