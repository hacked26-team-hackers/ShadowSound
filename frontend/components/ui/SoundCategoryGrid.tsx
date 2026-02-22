import { StyleSheet, Text, View, Pressable } from "react-native";

export interface SoundCategory {
    key: string;
    label: string;
    icon: string;
    enabled?: boolean;
}

/** All sound categories the backend can detect */
export const SOUND_CATEGORIES: SoundCategory[] = [
    { key: "emergency_siren", label: "Siren", icon: "🚨" },
    { key: "horn", label: "Horn", icon: "📯" },
    { key: "shouting", label: "Shouting", icon: "🗣️" },
    { key: "dog_barking", label: "Dog Bark", icon: "🐕" },
    { key: "car_alarm", label: "Alarm", icon: "🔔" },
    { key: "vehicle_approaching", label: "Vehicle", icon: "🚗" },
    { key: "bicycle_bell", label: "Bicycle", icon: "🚲" },
    { key: "tire_screech", label: "Screech", icon: "⚠️" },
    { key: "glass_breaking", label: "Glass", icon: "💥" },
    { key: "construction_noise", label: "Construction", icon: "🔨" },
    { key: "train", label: "Train", icon: "🚂" },
    { key: "aircraft", label: "Aircraft", icon: "✈️" },
];

interface SoundCategoryGridProps {
    /** If provided, show toggle state and fire on press */
    onToggle?: (key: string) => void;
    /** Map of key → enabled state (for Settings page) */
    enabledMap?: Record<string, boolean>;
    /** If true, cells are interactive toggles. Otherwise, display-only. */
    interactive?: boolean;
}

/**
 * Grid of sound categories with emoji icons behind each label.
 * In display mode (Monitor), shows all categories in a muted style.
 * In interactive mode (Settings), shows active/inactive toggle state.
 */
export default function SoundCategoryGrid({
    onToggle,
    enabledMap,
    interactive = false,
}: SoundCategoryGridProps) {
    return (
        <View style={styles.grid}>
            {SOUND_CATEGORIES.map((cat) => {
                const enabled = enabledMap?.[cat.key] ?? true;
                const isInteractive = interactive && onToggle;

                const cell = (
                    <View
                        key={cat.key}
                        style={[
                            styles.cell,
                            interactive && !enabled && styles.cellDisabled,
                            interactive && enabled && styles.cellEnabled,
                        ]}
                    >
                        <Text style={styles.cellIcon}>{cat.icon}</Text>
                        <Text
                            style={[
                                styles.cellLabel,
                                interactive && !enabled && styles.cellLabelDisabled,
                            ]}
                            numberOfLines={1}
                        >
                            {cat.label}
                        </Text>
                    </View>
                );

                if (isInteractive) {
                    return (
                        <Pressable
                            key={cat.key}
                            onPress={() => onToggle(cat.key)}
                            style={styles.cellWrapper}
                        >
                            {cell}
                        </Pressable>
                    );
                }

                return (
                    <View key={cat.key} style={styles.cellWrapper}>
                        {cell}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
    },
    cellWrapper: {
        width: "30%",
    },
    cell: {
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 6,
        borderRadius: 14,
        backgroundColor: "#161616",
        borderWidth: 1,
        borderColor: "#282828",
    },
    cellEnabled: {
        backgroundColor: "#0D2818",
        borderColor: "#00E5A0",
    },
    cellDisabled: {
        backgroundColor: "#111",
        borderColor: "#222",
        opacity: 0.5,
    },
    cellIcon: {
        fontSize: 26,
        marginBottom: 6,
    },
    cellLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#ccc",
        textAlign: "center",
    },
    cellLabelDisabled: {
        color: "#666",
    },
});
