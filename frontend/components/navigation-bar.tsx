import { usePathname, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface NavItem {
  route: string;
  label: string;
  icon: string;
  iconActive: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: "/(tabs)", label: "Monitor", icon: "📡", iconActive: "📡" },
  { route: "/(tabs)/settings", label: "Settings", icon: "⚙️", iconActive: "⚙️" },
];

export function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === "/(tabs)") {
      return pathname === "/" || pathname === "/(tabs)";
    }
    return pathname === route || pathname === `/(tabs)${route.replace("/(tabs)", "")}`;
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <Pressable onPress={() => router.push("/(tabs)")}>
          <Text style={styles.logo}>📡 Shadow-Sound</Text>
        </Pressable>

        <View style={styles.webNav}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              accessibilityRole="link"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.webNavItem,
                isActive(item.route) && styles.webNavItemActive,
              ]}
            >
              <Text
                style={[
                  styles.webNavLink,
                  isActive(item.route) && styles.webNavLinkActive,
                ]}
              >
                {item.icon} {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // ── Mobile bottom tab bar ──────────────────────────────────────────
  return (
    <View style={styles.mobileContainer}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.route);
        return (
          <Pressable
            key={item.route}
            accessibilityRole="link"
            accessibilityLabel={item.label}
            style={[styles.navItem, active && styles.navItemActive]}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.navIcon}>
              {active ? item.iconActive : item.icon}
            </Text>
            <Text
              style={[styles.navLabel, active && styles.navLabelActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Web ─────────────────────────────────────────────────────────
  webContainer: {
    height: 60,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  webNav: {
    flexDirection: "row",
    gap: 8,
  },
  webNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  webNavItemActive: {
    backgroundColor: "#1A1A1A",
  },
  webNavLink: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  webNavLinkActive: {
    color: "#00E5A0",
    fontWeight: "700",
  },

  // ── Mobile ──────────────────────────────────────────────────────
  mobileContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 64,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#222",
    shadowColor: "#00E5A0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: "#1A2E22",
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  navLabelActive: {
    color: "#00E5A0",
  },
});
