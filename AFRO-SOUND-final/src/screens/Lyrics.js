import React from 'react';
import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';
import theme from '../theme';

const sampleLyrics =
  'Couplet 1\nVoici les paroles de la chanson...\n\nRefrain\nLa la la...';

export default function Lyrics() {
  return (
    <View style={theme.container}>
      <View style={{alignItems: 'center', paddingTop: 24}}>
        <Image
          source={require('../../assets/images/lyrics.png')}
          style={{width: 120, height: 120, borderRadius: 12}}
        />
      </View>
      <ScrollView style={{padding: 20}}>
        <Text style={styles.title}>Titre de la chanson</Text>
        <Text style={styles.artist}>Artiste</Text>
        <Text style={styles.lyrics}>{sampleLyrics}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {color: '#FDFBF7', fontSize: 20, fontWeight: '700', marginBottom: 4},
  artist: {color: '#C4A484', marginBottom: 12},
  lyrics: {color: '#FDFBF7', lineHeight: 22},
});
