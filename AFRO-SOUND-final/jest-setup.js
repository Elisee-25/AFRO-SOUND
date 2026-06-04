import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({children}) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

jest.mock('./src/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({data: [], error: null}),
        order: () => ({
          limit: () => Promise.resolve({data: [], error: null}),
        }),
      }),
    }),
    auth: {
      signUp: jest.fn(() => Promise.resolve({data: {}, error: null})),
    },
  },
}));
