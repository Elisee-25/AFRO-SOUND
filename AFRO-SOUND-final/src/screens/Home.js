import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import theme, {Colors} from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getHomeData} from '../services/musicApi';
import {usePlayer} from '../context/PlayerContext';

export default function Home({navigation}) {
  const [sections, setSections] = useState({
    afrobeats: [],
    topGlobal: [],
    itunesAfro: [],
    customSongs: [],
    recentTracks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const {playTrack} = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getHomeData();
      setSections(data);
    } catch (e) {
      console.error('Home fetchData error:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** Lance la lecture et navigue vers NowPlaying */
  const handlePlay = (track, queue) => {
    playTrack(track, queue);
    navigation.navigate('NowPlaying', {track});
  };

  const renderRecentCard = (item, index, queue) => (
    <TouchableOpacity
      key={item.id || index}
      style={styles.recentCard}
      activeOpacity={0.8}
      onPress={() => handlePlay(item, queue)}>
      <Image
        source={
          item.cover
            ? {uri: item.cover}
            : item.cover_url
            ? {uri: item.cover_url}
            : require('../../assets/images/logo.png')
        }
        style={styles.recentImage}
      />
      <Text style={styles.recentTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderTrackCard = (p, index, queue) => (
    <TouchableOpacity
      key={p.id || index}
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handlePlay(p, queue)}>
      <View>
        <Image
          source={
            p.cover
              ? {uri: p.cover}
              : p.cover_url
              ? {uri: p.cover_url}
              : require('../../assets/images/logo.png')
          }
          style={styles.cardImage}
        />
        <View
          style={[
            styles.sourceBadge,
            p.source === 'itunes' && styles.itunesBadge,
            p.source === 'jamendo' && styles.jamendoBadge,
          ]}>
          <Text style={styles.sourceBadgeText}>
            {p.source === 'itunes'
              ? '🍎'
              : p.source === 'deezer'
              ? '🎵'
              : p.source === 'jamendo'
              ? '🎸'
              : '🏠'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {p.title}
      </Text>
      <Text style={styles.cardArtist} numberOfLines={1}>
        {p.artist || p.artist_name || 'Artiste inconnu'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[theme.container, styles.mainContainer]}>
      <ScrollView contentContainerStyle={{paddingBottom: 140}}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Bibliothèque')}
                activeOpacity={0.8}>
                <View style={styles.profilePic} />
              </TouchableOpacity>
              <Text style={styles.greeting}>AFRO SOUND</Text>
            </View>
            <TouchableOpacity onPress={fetchData} activeOpacity={0.8}>
              <Ionicons
                name="refresh-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.filtersRow}>
            <View style={styles.filterPill}>
              <Text style={styles.filterText}>🎵 Deezer</Text>
            </View>
            <View style={[styles.filterPill, {backgroundColor: '#1D1A29'}]}>
              <Text style={styles.filterText}>🍎 iTunes</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{marginTop: 80}}
          />
        ) : (
          <>
            {/* ── Écoutes récentes (grille) ── */}
            <View style={styles.recentGrid}>
              {sections.recentTracks.slice(0, 6).map((item, i) =>
                renderRecentCard(item, i, sections.recentTracks),
              )}
            </View>

            {/* ── Vos titres (Supabase) ── */}
            {sections.customSongs.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, {marginTop: 28}]}>
                  🏠 Vos titres (Supabase)
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingLeft: 16, paddingRight: 8}}>
                  {sections.customSongs.map((p, i) =>
                    renderTrackCard(p, i, sections.customSongs),
                  )}
                </ScrollView>
              </>
            )}

            {/* ── Afrobeats Deezer ── */}
            <Text style={styles.sectionTitle}>🔥 Afrobeats</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingLeft: 16, paddingRight: 8}}>
              {sections.afrobeats.map((p, i) =>
                renderTrackCard(p, i, sections.afrobeats),
              )}
            </ScrollView>

            {/* ── Top Mondial Deezer ── */}
            <Text style={[styles.sectionTitle, {marginTop: 28}]}>
              🌍 Top Mondial
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingLeft: 16, paddingRight: 8}}>
              {sections.topGlobal.map((p, i) =>
                renderTrackCard(p, i, sections.topGlobal),
              )}
            </ScrollView>

            {/* ── Découvertes iTunes ── */}
            <Text style={[styles.sectionTitle, {marginTop: 28}]}>
              🍎 Découvertes iTunes
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingLeft: 16, paddingRight: 8}}>
              {sections.itunesAfro.map((p, i) =>
                renderTrackCard(p, i, sections.itunesAfro),
              )}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {flex: 1, backgroundColor: Colors.background},
  header: {paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16},
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  greeting: {
    color: '#FDFBF7',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  filtersRow: {flexDirection: 'row'},
  filterPill: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {color: '#FDFBF7', fontSize: 13, fontWeight: '500'},
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  recentCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  recentImage: {width: 56, height: 56},
  recentTitle: {
    flex: 1,
    color: '#FDFBF7',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    color: '#FDFBF7',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  card: {width: 150, marginRight: 16, position: 'relative'},
  cardImage: {width: 150, height: 150, borderRadius: 16},
  cardTitle: {
    color: '#FDFBF7',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  cardArtist: {color: Colors.muted, marginTop: 2, fontSize: 12},
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  itunesBadge: {backgroundColor: 'rgba(29,26,41,0.85)'},
  jamendoBadge: {backgroundColor: 'rgba(255,51,51,0.85)'},
  sourceBadgeText: {fontSize: 12},
});
