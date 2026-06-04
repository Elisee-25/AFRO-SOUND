/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return () => (
    <View>
      <Text>AFRO SOUND</Text>
    </View>
  );
});

it('renders correctly', () => {
  renderer.create(<App />);
});
