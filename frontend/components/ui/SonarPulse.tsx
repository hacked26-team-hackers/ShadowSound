import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    cancelAnimation,
} from "react-native-reanimated";

interface SonarPulseProps {
    /** Whether the animation is active */
    active: boolean;
    /** Size of the outer ring diameter */
    size?: number;
    /** Color of the rings */
    color?: string;
}

const RING_COUNT = 3;
const ANIMATION_DURATION = 2400;

/**
 * Animated concentric sonar rings that pulse outward when active.
 * Used as the hero visual on the Monitor screen while listening.
 */
export default function SonarPulse({
    active,
    size = 240,
    color = "#00E5A0",
}: SonarPulseProps) {
    const ring1 = useSharedValue(0);
    const ring2 = useSharedValue(0);
    const ring3 = useSharedValue(0);

    useEffect(() => {
        if (active) {
            ring1.value = withRepeat(
                withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
            ring2.value = withDelay(
                ANIMATION_DURATION / RING_COUNT,
                withRepeat(
                    withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.ease) }),
                    -1,
                    false
                )
            );
            ring3.value = withDelay(
                (ANIMATION_DURATION / RING_COUNT) * 2,
                withRepeat(
                    withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.ease) }),
                    -1,
                    false
                )
            );
        } else {
            cancelAnimation(ring1);
            cancelAnimation(ring2);
            cancelAnimation(ring3);
            ring1.value = withTiming(0, { duration: 400 });
            ring2.value = withTiming(0, { duration: 400 });
            ring3.value = withTiming(0, { duration: 400 });
        }
    }, [active]);

    const makeRingStyle = (progress: Animated.SharedValue<number>) =>
        useAnimatedStyle(() => ({
            transform: [{ scale: 0.3 + progress.value * 0.7 }],
            opacity: (1 - progress.value) * 0.6,
        }));

    const ring1Style = makeRingStyle(ring1);
    const ring2Style = makeRingStyle(ring2);
    const ring3Style = makeRingStyle(ring3);

    const ringBase = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Animated.View style={[styles.ring, ringBase, ring1Style]} />
            <Animated.View style={[styles.ring, ringBase, ring2Style]} />
            <Animated.View style={[styles.ring, ringBase, ring3Style]} />

            {/* Center dot */}
            <View
                style={[
                    styles.centerDot,
                    {
                        backgroundColor: active ? color : "#555",
                        shadowColor: active ? color : "transparent",
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    ring: {
        position: "absolute",
    },
    centerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
    },
});
