import { requireNodeAddon } from "react-native-node-api";

let initialised = false;
if (!initialised) {
  // We gave up `module:react-native-node-api/babel-plugin` as it was
  // complaining about ESM for some reason.
  const { init } = requireNodeAddon("macos-node-api--NativeScript") as {
    init(): void;
  };
  init();
}
