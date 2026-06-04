-- ============================================================
--  AFRO SOUND — Schéma Supabase complet
--  À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. TABLE PROFILES (liée à auth.users)
-- Créée automatiquement après inscription
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE SONGS
-- Les chansons uploadées (stockées dans Supabase Storage)
CREATE TABLE IF NOT EXISTS public.songs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  artist      TEXT NOT NULL,
  album       TEXT,
  audio_url   TEXT NOT NULL,   -- URL du fichier audio dans Storage
  cover_url   TEXT,            -- URL de la pochette dans Storage
  duration    INTEGER DEFAULT 30,
  source      TEXT DEFAULT 'supabase',
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE PLAYLISTS
CREATE TABLE IF NOT EXISTS public.playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE PLAYLIST_SONGS (relation N-N)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id     UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- 5. TABLE LIKED_SONGS
CREATE TABLE IF NOT EXISTS public.liked_songs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id    UUID NOT NULL,          -- peut être un ID externe (deezer_, itunes_)
  song_data  JSONB NOT NULL,         -- on stocke le track complet (titre, artist, audioUrl, cover…)
  liked_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- 6. TABLE LISTENING_HISTORY
CREATE TABLE IF NOT EXISTS public.listening_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id    TEXT NOT NULL,
  song_data  JSONB NOT NULL,
  listened_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  TRIGGER : créer un profil automatiquement après inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

-- PROFILES : lecture publique, écriture par le propriétaire
CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- SONGS : lecture publique, upload par utilisateur connecté
CREATE POLICY "songs_public_read"     ON public.songs FOR SELECT USING (true);
CREATE POLICY "songs_auth_insert"     ON public.songs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "songs_own_delete"      ON public.songs FOR DELETE USING (auth.uid() = uploaded_by);

-- PLAYLISTS : lecture par le propriétaire, CRUD complet
CREATE POLICY "playlists_own_all"     ON public.playlists FOR ALL USING (auth.uid() = user_id);

-- PLAYLIST_SONGS : via la playlist du propriétaire
CREATE POLICY "playlist_songs_own"    ON public.playlist_songs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
  );

-- LIKED_SONGS : par l'utilisateur connecté
CREATE POLICY "liked_songs_own"       ON public.liked_songs FOR ALL USING (auth.uid() = user_id);

-- LISTENING_HISTORY : par l'utilisateur connecté
CREATE POLICY "history_own"           ON public.listening_history FOR ALL USING (auth.uid() = user_id);

-- ============================================================
--  STORAGE BUCKET (à créer dans le Dashboard Supabase)
--  Bucket name : "afrosound-media"
--  Public : OUI
-- ============================================================
-- Exécuter dans le Dashboard > Storage > New Bucket :
--   Nom      : afrosound-media
--   Public   : activé
-- Puis ajouter cette policy Storage :
INSERT INTO storage.buckets (id, name, public)
VALUES ('afrosound-media', 'afrosound-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'afrosound-media');

CREATE POLICY "storage_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'afrosound-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_own_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'afrosound-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
--  DONNÉES DE TEST (optionnel, pour vérifier que tout fonctionne)
-- ============================================================
-- INSERT INTO public.songs (title, artist, audio_url, cover_url, source)
-- VALUES
--   ('Test Afrobeat', 'Artiste Test', 'https://...mp3', 'https://...jpg', 'supabase');
