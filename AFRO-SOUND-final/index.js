/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';
import {PlaybackService} from './src/services/PlayerService';

// Enregistre le service de lecture en arrière-plan
TrackPlayer.registerPlaybackService(() => PlaybackService);

AppRegistry.registerComponent(appName, () => App);
