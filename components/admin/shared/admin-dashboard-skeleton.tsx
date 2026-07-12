import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function SkeletonBlock({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }} className={`rounded-[12px] bg-[#E7EAF0] ${className ?? ""}`} />;
}

export function AdminDashboardSkeleton() {
  return (
    <View className="mt-2">
      <View className="flex-row gap-3">
        <SkeletonBlock className="h-[86px] flex-1" />
        <SkeletonBlock className="h-[86px] flex-1" />
      </View>
      <SkeletonBlock className="mt-4 h-[140px] w-full" />
      <SkeletonBlock className="mt-4 h-[220px] w-full" />
      <SkeletonBlock className="mt-4 h-[210px] w-full" />
    </View>
  );
}
