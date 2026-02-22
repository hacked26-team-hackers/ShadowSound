import { StyleSheet, Text, View } from "react-native";

interface DetectionCardProps {
    /** Emoji icon for the sound type */
    icon: string;
    /** Human-readable sound label */
    label: string;
    /** Confidence as a 0–1 float */
    confidence: number;
    /** Urgency level controls the label color */
    urgencyColor: string;
}

/**
 * Large card showing the most recently detected sound.
 * Displayed prominently on the home screen.
 */
export default function DetectionCard({
    icon,
    label,
    confidence,
    urgencyColor,
}: DetectionCardProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.label, { color: urgencyColor }]}>{label}</Text>
            <Text style={styles.confidence}>
                {(confidence * 100).toFixed(0)}% confidence
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 16,
    },
    icon: {
        fontSize: 48,
        marginBottom: 8,
    },
    label: {
        fontSize: 22,
        fontWeight: "700",
        textTransform: "capitalize",
        marginBottom: 4,
    },
    confidence: {
        fontSize: 14,
        color: "#999",
    },
});
