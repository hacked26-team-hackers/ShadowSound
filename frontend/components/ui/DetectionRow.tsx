import { StyleSheet, Text, View } from "react-native";

interface DetectionRowProps {
    /** Emoji icon for the sound type */
    icon: string;
    /** Human-readable sound label */
    label: string;
    /** Confidence as a 0–1 float */
    confidence: number;
    /** Urgency level string (e.g. "high", "critical") */
    urgency: string;
    /** Color for the label text */
    urgencyColor: string;
}

/**
 * Compact row for the recent-alerts list.
 * Shows icon, label, confidence, and urgency in a single row.
 */
export default function DetectionRow({
    icon,
    label,
    confidence,
    urgency,
    urgencyColor,
}: DetectionRowProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.info}>
                <Text style={[styles.label, { color: urgencyColor }]}>
                    {label}
                </Text>
                <Text style={styles.meta}>
                    {(confidence * 100).toFixed(0)}% · {urgency}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#333",
    },
    icon: {
        fontSize: 24,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    meta: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
});
