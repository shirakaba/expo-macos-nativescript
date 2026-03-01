/// <reference types="@nativescript/macos-node-api" />
/// <reference types="@nativescript/macos-node-api/types/CoreFoundation.d.ts" />

import { registerRootComponent } from "expo";
import { requireNodeAddon } from "react-native-node-api";

import App from "./src/App";

// We gave up `module:react-native-node-api/babel-plugin` as it was
// complaining about ESM for some reason.
const { init } = requireNodeAddon("macos-node-api--NativeScript") as {
  init(): void;
};
init();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
