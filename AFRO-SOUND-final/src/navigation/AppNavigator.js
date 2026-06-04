/**
 * AppNavigator.js — AFRO SOUND
 * Navigation principale + redirection auto selon l'état auth.
 */
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

import GetStarted    from '../screens/GetStarted';
import Home          from '../screens/Home';
import NowPlaying    from '../screens/NowPlaying';
import ChooseMode    from '../screens/ChooseMode';
import Loading       from '../screens/Loading';
import Lyrics        from '../screens/Lyrics';
import Register      from '../screens/Register';
import MusicPage     from '../screens/MusicPage';
import Search        from '../screens/Search';
import Library       from '../screens/Library';
import SearchResults from '../screens/SearchResults';
import CreatePlaylist from '../screens/CreatePlaylist';
import PlayerBar     from '../components/PlayerBar';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: Colors.border,
            height: 62,
            paddingBottom: 8,
          },
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.muted,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              'Accueil':      focused ? 'home'    : 'home-outline',
              'Rechercher':   focused ? 'search'  : 'search-outline',
              'Créer':        focused ? 'add-circle' : 'add-circle-outline',
              'Bibliothèque': focused ? 'library' : 'library-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}>
        <Tab.Screen name="Accueil"      component={Home} />
        <Tab.Screen name="Rechercher"   component={Search} />
        <Tab.Screen name="Créer"        component={CreatePlaylist} />
        <Tab.Screen name="Bibliothèque" component={Library} />
      </Tab.Navigator>

      {/* PlayerBar flottante au-dessus de la tab bar */}
      <View style={{ position: 'absolute', bottom: 62, left: 0, right: 0 }}>
        <PlayerBar />
      </View>
    </View>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  // Affiche un écran vide le temps que la session soit chargée
  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted"    component={GetStarted} />
        <Stack.Screen name="ChooseMode"    component={ChooseMode} />
        <Stack.Screen name="Loading"       component={Loading} />
        <Stack.Screen name="Register"      component={Register} />
        <Stack.Screen name="Home"          component={MainTabs} />
        <Stack.Screen name="MusicPage"     component={MusicPage} />
        <Stack.Screen name="NowPlaying"    component={NowPlaying} />
        <Stack.Screen name="Lyrics"        component={Lyrics} />
        <Stack.Screen name="SearchResults" component={SearchResults} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
