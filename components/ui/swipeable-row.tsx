import { Feather } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const SWIPE_WIDTH = 84;
const SWIPE_THRESHOLD = -42;
const SPRING_CONFIG = { damping: 18, stiffness: 180 };

type SwipeableRowProps = {
  children: ReactNode;
  onDelete: () => void;
  borderRadius?: number;
};

export function SwipeableRow({ children, onDelete, borderRadius = 14 }: SwipeableRowProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, Math.max(event.translationX, -SWIPE_WIDTH));
    })
    .onEnd(() => {
      translateX.value = withSpring(
        translateX.value < SWIPE_THRESHOLD ? -SWIPE_WIDTH : 0,
        SPRING_CONFIG,
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ borderRadius, overflow: "hidden" }}>
      <View
        className="absolute bottom-0 right-0 top-0 flex-row items-center justify-end bg-[#BA1A1A]"
        style={{ borderRadius }}
      >
        <Pressable
          onPress={() => {
            translateX.value = withSpring(0, SPRING_CONFIG);
            onDelete();
          }}
          className="h-full items-center justify-center"
          style={{ width: SWIPE_WIDTH }}
        >
          <Feather name="trash-2" size={20} color="white" />
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
