import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function Button({
  onPress,
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`${size}Size`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.baseText,
          styles[`${variant}Text`],
          disabled && styles.disabledText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#00E5A0",
  },
  secondary: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#00E5A0",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  smallSize: {
    width: 120,
    height: 40,
  },
  mediumSize: {
    width: 160,
    height: 48,
  },
  largeSize: {
    height: 56,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: "100%",
  },
  baseText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryText: {
    color: "#000",
  },
  secondaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#00E5A0",
  },
  disabledText: {
    color: "#666",
  },
});
