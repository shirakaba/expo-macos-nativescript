import { registerRootComponent } from 'expo';
import { requireNodeAddon } from "react-native-node-api";

import App from './App';

// We gave up `module:react-native-node-api/babel-plugin` as it was
// complaining about ESM for some reason.
const { init } = requireNodeAddon("macos-node-api--NativeScript");
init();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
