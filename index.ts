import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Enable HMR
declare const module: {
  hot?: {
    accept: () => void;
  };
};

if (module.hot) {
  module.hot.accept();
}

// Ignore non-critical warnings
LogBox.ignoreLogs([
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount'
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
