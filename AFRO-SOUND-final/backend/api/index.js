const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialisation Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AfroSound Backend is running' });
});

// Proxy Jamendo
app.get('/api/jamendo/search', async (req, res) => {
  const { query, limit = 10 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: limit,
        namesearch: query,
        include: 'musicinfo'
      }
    });

    const tracks = response.data.results.map(track => ({
      id: `jamendo_${track.id}`,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      audioUrl: track.audio,
      cover: track.album_image,
      source: 'jamendo',
      duration: track.duration
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Jamendo API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Jamendo' });
  }
});

// Route pour récupérer les chansons depuis Supabase
app.get('/api/songs', async (req, res) => {
  try {
    // On essaie d'abord 'songs', sinon 'tracks'
    let { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*, artists(name)')
        .order('created_at', { ascending: false });
      
      if (!tracksError) {
        data = tracksData.map(t => ({
          ...t,
          artist: t.artists?.name || t.artist,
          cover: t.cover_url || t.cover
        }));
      }
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exporter pour Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
