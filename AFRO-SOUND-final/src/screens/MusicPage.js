import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import theme, {Colors} from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MusicPage({route, navigation}) {
  // On récupère l'élément passé en paramètre, ou on définit des valeurs par défaut
  const {item} = route.params || {};
  const title = item?.title || 'Titre inconnu';
  const artist = item?.artist || 'Artiste inconnu';
  const image = item?.image || require('../../assets/images/music_page.png');

  return (
    <View style={theme.container}>
      <View style={{paddingTop: 24, paddingHorizontal: 20}}>
        <Text style={{color: '#FDFBF7', fontSize: 22, fontWeight: '700'}}>
          Playlist
        </Text>
      </View>

      <View style={styles.artContainer}>
        <Image source={image} style={styles.art} />
      </View>

      <View style={{paddingHorizontal: 20}}>
        <Text style={styles.trackTitle}>{title}</Text>
        <Text style={styles.trackArtist}>{artist}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() =>
            Alert.alert('Aléatoire', 'Lecture aléatoire activée !')
          }>
          <Ionicons name="shuffle" size={24} color="#FDFBF7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={() => navigation.navigate('NowPlaying')}
          activeOpacity={0.9}>
          <Ionicons
            name="play"
            size={32}
            color="#181411"
            style={{marginLeft: 4}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => Alert.alert('Favoris', 'Ajouté à vos titres likés !')}>
          <Ionicons name="heart-outline" size={24} color="#FDFBF7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  artContainer: {padding: 24, alignItems: 'center'},
  art: {width: 280, height: 280, borderRadius: 24}, // Plus grand et arrondi
  trackTitle: {color: '#FDFBF7', fontSize: 24, fontWeight: '800', marginTop: 12},
  trackArtist: {color: '#C4A484', fontSize: 16, marginTop: 4},
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  smallBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C241E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E67E22',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
