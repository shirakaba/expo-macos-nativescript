import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.lg}>Testing NativeScript in Expo macOS:</Text>
      <Text style={styles.md}>{chineseToLatin("你好世界")}</Text>
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
