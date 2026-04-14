import { Stack } from "expo-router";

export default function ProductLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="detail" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="write-review" />
    </Stack>
  );
}
