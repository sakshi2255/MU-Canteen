import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
          text: { color: Colors.textPrimary },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
          text: { color: Colors.primary },
        };
      case 'danger':
        return {
          container: { backgroundColor: Colors.danger },
          text: { color: '#FFFFFF' },
        };
      case 'success':
        return {
          container: { backgroundColor: Colors.success },
          text: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: Colors.primary },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: Colors.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 6, paddingHorizontal: 12 },
          text: { fontSize: 13 },
        };
      case 'lg':
        return {
          container: { paddingVertical: 14, paddingHorizontal: 24 },
          text: { fontSize: 16 },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 10, paddingHorizontal: 18 },
          text: { fontSize: 14 },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyles.container,
        sStyles.container,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.baseText, vStyles.text, sStyles.text, disabled && styles.disabledText, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    borderColor: '#CBD5E1',
    opacity: 0.65,
  },
  disabledText: {
    color: '#94A3B8',
  },
});

