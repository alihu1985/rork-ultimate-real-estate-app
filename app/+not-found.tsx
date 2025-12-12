import { useRouter, type Href } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import Colors from "@/constants/Colors";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الصفحة غير موجودة</Text>
      <Text style={styles.subtitle}>عذراً، لم نتمكن من العثور على هذه الصفحة</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push("/" as Href)}
      >
        <Text style={styles.buttonText}>العودة للرئيسية</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
