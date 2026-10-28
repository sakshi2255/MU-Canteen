import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.primaryLight, text: Colors.primary, border: Colors.primaryMuted };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, border: Colors.successBorder };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning, border: Colors.warningBorder };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger, border: Colors.dangerBorder };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info, border: Colors.infoBorder };
      case 'neutral':
      default:
        return { bg: Colors.surfaceSecondary, text: Colors.textSecondary, border: Colors.border };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg, borderColor: c.border },
        isSm ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: c.text },
          isSm ? styles.textSm : styles.textMd,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});

