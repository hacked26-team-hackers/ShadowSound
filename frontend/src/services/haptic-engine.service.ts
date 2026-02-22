import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// ── Pattern definitions ─────────────────────────────────────────────────
//
// Each sound category maps to a sequence of haptic "steps".
// A step is either:
//   { type: "impact",  style: ImpactFeedbackStyle }
//   { type: "notify",  style: NotificationFeedbackType }
//   { type: "pause",   ms: number }
//
// The engine plays each step sequentially.

type HapticStep =
    | { type: "impact"; style: Haptics.ImpactFeedbackStyle }
    | { type: "notify"; style: Haptics.NotificationFeedbackType }
    | { type: "pause"; ms: number };

/** Pattern registry keyed by the `haptic_pattern` string from the backend */
const PATTERNS: Record<string, HapticStep[]> = {
    // Emergency siren → rapid pulse × 3
    rapid_pulse_3x: [
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
        { type: "pause", ms: 100 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
        { type: "pause", ms: 100 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
    ],

    // Car horn → double tap
    double_tap: [
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
        { type: "pause", ms: 150 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
    ],

    // Shouting → long single buzz
    long_pulse: [
        { type: "notify", style: Haptics.NotificationFeedbackType.Warning },
    ],

    // Dog bark → triple tap
    triple_tap: [
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
        { type: "pause", ms: 120 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
        { type: "pause", ms: 120 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
    ],

    // Alarm → alternating short-long
    alternating_short_long: [
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
        { type: "pause", ms: 80 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
        { type: "pause", ms: 200 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
        { type: "pause", ms: 80 },
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
    ],

    // Fallback → single tap
    single_tap: [
        { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
    ],
};

// ── Helpers ──────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function playStep(step: HapticStep): Promise<void> {
    switch (step.type) {
        case "impact":
            await Haptics.impactAsync(step.style);
            break;
        case "notify":
            await Haptics.notificationAsync(step.style);
            break;
        case "pause":
            await sleep(step.ms);
            break;
    }
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Play a haptic pattern by name (as returned by the backend's `haptic_pattern` field).
 * Falls back to `single_tap` for unrecognised patterns.
 * No-ops silently on web where haptics aren't supported.
 */
export async function triggerHapticPattern(patternName: string): Promise<void> {
    if (Platform.OS === "web") return;

    const steps = PATTERNS[patternName] ?? PATTERNS.single_tap;

    for (const step of steps) {
        await playStep(step);
    }
}

/**
 * Quick test: fire every registered pattern one by one with a pause between them.
 * Useful for verifying patterns on a real device.
 */
export async function testAllPatterns(): Promise<void> {
    for (const [name, steps] of Object.entries(PATTERNS)) {
        console.log(`[HapticEngine] Testing: ${name}`);
        for (const step of steps) {
            await playStep(step);
        }
        await sleep(600);
    }
    console.log("[HapticEngine] All patterns tested.");
}
