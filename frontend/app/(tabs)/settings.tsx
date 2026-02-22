import { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Switch,
    Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { PageContainer } from "@/components/page-container";
import SoundCategoryGrid, {
    SOUND_CATEGORIES,
} from "@/components/ui/SoundCategoryGrid";

// ── Environment profiles ─────────────────────────────────────────────────

const ENVIRONMENTS = [
    { key: "urban", label: "🏙️  Urban", desc: "Streets, traffic, crowds" },
    { key: "suburban", label: "🏘️  Suburban", desc: "Neighborhoods, parks" },
    { key: "indoor", label: "🏠  Indoor", desc: "Home, office, transit" },
];

// ── Component ────────────────────────────────────────────────────────────

export default function SettingsScreen() {
    // Sound toggles — all enabled by default
    const [enabledSounds, setEnabledSounds] = useState<Record<string, boolean>>(
        () => Object.fromEntries(SOUND_CATEGORIES.map((c) => [c.key, true]))
    );

    // Environment profile
    const [environment, setEnvironment] = useState("urban");

    // Haptic intensity (1–10)
    const [hapticIntensity, setHapticIntensity] = useState(5);

    // Battery saver
    const [batterySaver, setBatterySaver] = useState(false);

    const toggleSound = useCallback((key: string) => {
        setEnabledSounds((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const enabledCount = Object.values(enabledSounds).filter(Boolean).length;

    return (
        <PageContainer>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.header}>Settings</Text>

                {/* ── Sound Categories ──────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Sound Detection</Text>
                        <Text style={styles.sectionBadge}>
                            {enabledCount}/{SOUND_CATEGORIES.length}
                        </Text>
                    </View>
                    <Text style={styles.sectionDesc}>
                        Tap to toggle which sounds trigger alerts
                    </Text>
                    <SoundCategoryGrid
                        interactive
                        enabledMap={enabledSounds}
                        onToggle={toggleSound}
                    />
                </View>

                {/* ── Environment Profile ──────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Environment</Text>
                    <Text style={styles.sectionDesc}>
                        Optimizes detection for your surroundings
                    </Text>
                    <View style={styles.envList}>
                        {ENVIRONMENTS.map((env) => (
                            <View
                                key={env.key}
                                style={[
                                    styles.envItem,
                                    environment === env.key && styles.envItemActive,
                                ]}
                                onTouchEnd={() => setEnvironment(env.key)}
                            >
                                <Text style={styles.envLabel}>{env.label}</Text>
                                <Text style={styles.envDesc}>{env.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Vibration Intensity ──────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Vibration Intensity</Text>
                        <Text style={styles.intensityValue}>{hapticIntensity}</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={hapticIntensity}
                        onValueChange={setHapticIntensity}
                        minimumTrackTintColor="#00E5A0"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#fff"
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>Gentle</Text>
                        <Text style={styles.sliderLabel}>Strong</Text>
                    </View>
                </View>

                {/* ── Battery Saver ────────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.sectionTitle}>Battery Saver</Text>
                            <Text style={styles.sectionDesc}>
                                Reduces capture frequency to save power
                            </Text>
                        </View>
                        <Switch
                            value={batterySaver}
                            onValueChange={setBatterySaver}
                            trackColor={{ false: "#333", true: "#00E5A0" }}
                            thumbColor="#fff"
                            ios_backgroundColor="#333"
                        />
                    </View>
                </View>

                {/* ── About ───────────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.aboutCard}>
                        <Text style={styles.aboutName}>Shadow-Sound</Text>
                        <Text style={styles.aboutVersion}>v0.2.0</Text>
                        <Text style={styles.aboutDesc}>
                            Environmental sound awareness for deaf and hard-of-hearing
                            users. Detects safety-critical sounds and alerts through
                            haptic vibration patterns.
                        </Text>
                    </View>
                </View>

                {/* Bottom spacer for nav bar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </PageContainer>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 24,
        marginTop: 8,
    },

    // Sections
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    sectionBadge: {
        fontSize: 13,
        fontWeight: "600",
        color: "#00E5A0",
        backgroundColor: "#0D2818",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        overflow: "hidden",
    },
    sectionDesc: {
        fontSize: 13,
        color: "#888",
        marginBottom: 14,
    },

    // Environment
    envList: {
        gap: 10,
    },
    envItem: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: "#161616",
        borderWidth: 1,
        borderColor: "#282828",
    },
    envItemActive: {
        backgroundColor: "#0D2818",
        borderColor: "#00E5A0",
    },
    envLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 2,
    },
    envDesc: {
        fontSize: 12,
        color: "#888",
    },

    // Slider
    slider: {
        width: "100%",
        height: 40,
    },
    sliderLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    sliderLabel: {
        fontSize: 12,
        color: "#666",
    },
    intensityValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#00E5A0",
    },

    // Toggle row
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleInfo: {
        flex: 1,
        marginRight: 16,
    },

    // About
    aboutCard: {
        backgroundColor: "#161616",
        borderRadius: 14,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#282828",
    },
    aboutName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#00E5A0",
        marginBottom: 4,
    },
    aboutVersion: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
    },
    aboutDesc: {
        fontSize: 14,
        color: "#bbb",
        lineHeight: 20,
    },
});
