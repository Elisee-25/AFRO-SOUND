require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialisation sécurisée
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchAndImport() {
  const query = process.argv[2]; // Récupère l'argument de recherche
  if (!query) {
    console.error("Veuillez fournir un terme de recherche. Exemple : node scripts/search_and_import.js 'burna boy'");
    return;
  }

  try {
    console.log(`Recherche Jamendo pour : ${query}...`);
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 10,
        namesearch: query
      }
    });

    const tracks = response.data.results;
    if (tracks.length === 0) { console.log("Aucun résultat."); return; }

    for (const track of tracks) {
      console.log(`Importation : ${track.name}`);
      // Insertion dans Supabase
      const { error } = await supabase.from('songs').insert([
        {
          title: track.name,
          artist: track.artist_name,
          audio_url: track.audio,
          cover_url: track.album_image,
          duration: track.duration
        }
      ]);
      if (error) console.error("Erreur insertion:", error.message);
    }
    console.log("Recherche et import terminés !");
  } catch (err) {
    console.error("Erreur:", err.message);
  }
}

searchAndImport();
