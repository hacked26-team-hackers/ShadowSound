import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from "react-native-reanimated";

type StatusIndicatorState = "active" | "idle" | "error";

interface StatusIndicatorProps {
    /** Current state controls the dot color and animation */
    state: StatusIndicatorState;
    /** Text shown below the dot */
    label: string;
    /** Optional secondary text below the label */
    subtitle?: string;
}

const DOT_COLORS: Record<StatusIndicatorState, string> = {
    active: "#00E5A0",
    idle: "#555",
    error: "#FF4444",
};

/**
 * An animated status indicator with a pulsing glow when active.
 * Used to show system states like "Listening…", "Ready", or permission errors.
 */
export default function StatusIndicator({
    state,
    label,
    subtitle,
}: StatusIndicatorProps) {
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);

    useEffect(() => {
        if (state === "active") {
            pulseScale.value = withRepeat(
                withTiming(2.2, { duration: 1200, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
            pulseOpacity.value = withRepeat(
                withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
        } else {
            cancelAnimation(pulseScale);
            cancelAnimation(pulseOpacity);
            pulseScale.value = withTiming(1, { duration: 300 });
            pulseOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [state]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const dotColor = DOT_COLORS[state];

    return (
        <View style={styles.container}>
            <View style={styles.dotContainer}>
                {/* Animated glow ring */}
                <Animated.View
                    style={[
                        styles.pulse,
                        { backgroundColor: dotColor },
                        pulseStyle,
                    ]}
                />
                {/* Solid dot */}
                <View
                    style={[
                        styles.dot,
                        {
                            backgroundColor: dotColor,
                            shadowColor: state === "active" ? dotColor : "transparent",
                        },
                    ]}
                />
            </View>
            <Text style={styles.label}>{label}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    dotContainer: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 6,
    },
    pulse: {
        position: "absolute",
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    label: {
        fontSize: 22,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
});
