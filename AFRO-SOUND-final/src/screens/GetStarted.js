import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import theme, {Colors} from '../theme';

export default function GetStarted({navigation}) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/get_started.png')}
        style={styles.bg}
        resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>AFRO SOUND,{'\n'}la musique réinventée.</Text>
            <Text style={styles.subtitle}>
              L'essence du son africain et mondial. Sans limite.
            </Text>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.replace('ChooseMode')}>
              <Text style={styles.buttonText}>Commencer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  bg: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Assombrit l'image pour la lisibilité
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    color: '#FDFBF7',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 30, // Bouton en forme de pilule
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {color: Colors.background, fontSize: 18, fontWeight: 'bold'},
});
