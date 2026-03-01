import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import type { ViewController as ViewControllerType } from "./spritekit";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.lg}>Testing NativeScript in Expo macOS:</Text>
      <Text style={styles.md}>{chineseToLatin("你好世界")}</Text>
      <Button
        title="Start SpriteKit game"
        onPress={() => {
          // Lazy-load this, because otherwise the objc.import commands happen
          // too early.
          const { ViewController } = require("./spritekit") as {
            ViewController: typeof ViewControllerType;
          };
          const {
            mainWindow: { contentViewController },
          } = NSApplication.sharedApplication;

          // Problem: we can't do any UI work until the thread-safety PR is
          // implemented. Well, unless we use React Native Worklets.
          contentViewController.presentViewControllerAsModalWindow(
            ViewController.new(),
          );
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

function chineseToLatin(chineseText: string) {
  const mutableString = NSMutableString.stringWithString(chineseText);

  CFStringTransform(mutableString, null, kCFStringTransformToLatin, 0);

  return mutableString.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lg: { fontSize: 36, fontWeight: "bold", color: "white" },
  md: { fontSize: 36, color: "white" },
});
