import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const recentSearches = [
  'Happier Than Ever',
  'Drake',
  'Mix Pop',
  'Podcasts Humour',
];

export default function Search({navigation}) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // On ne navigue que si le champ n'est pas vide
    if (query.trim().length > 0) {
      navigation.navigate('SearchResults', {query});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rechercher</Text>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={24}
          color="#181411"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Que souhaitez-vous écouter sur AFRO SOUND ?"
          placeholderTextColor="#A69485"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.recentTitle}>Recherches récentes</Text>
      <ScrollView
        style={styles.recentList}
        showsVerticalScrollIndicator={false}>
        {recentSearches.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SearchResults', {query: item})}>
            <Ionicons name="time-outline" size={24} color="#C4A484" />
            <Text style={styles.recentItemText}>{item}</Text>
            <Ionicons name="close-outline" size={24} color="#C4A484" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#181411', padding: 16, paddingTop: 60},
  title: {color: '#FDFBF7', fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  searchBar: {
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {marginRight: 12},
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#181411',
    padding: 0,
    fontWeight: '500',
  },
  recentTitle: {
    color: '#FDFBF7',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
  },
  recentList: {flex: 1},
  recentItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  recentItemText: {flex: 1, color: '#FDFBF7', fontSize: 16, marginLeft: 16},
});
