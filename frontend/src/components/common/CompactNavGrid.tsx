import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export interface NavCardItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'primary' | 'danger' | 'warning' | 'success';
  onPress: () => void;
}

interface CompactNavGridProps {
  title?: string;
  items: NavCardItem[];
  columns?: 2 | 3;
}

export const CompactNavGrid: React.FC<CompactNavGridProps> = ({
  title,
  items,
  columns = 2,
}) => {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.grid}>
        {items.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={[
                styles.card,
                columns === 3 ? styles.cardCol3 : styles.cardCol2,
              ]}
            >
              <View style={styles.iconRow}>
                <View style={styles.iconCircle}>{item.icon}</View>
                {item.badge !== undefined && item.badge !== null && item.badge !== '' ? (
                  <View
                    style={[
                      styles.badge,
                      item.badgeVariant === 'danger' && styles.badgeDanger,
                      item.badgeVariant === 'warning' && styles.badgeWarning,
                      item.badgeVariant === 'success' && styles.badgeSuccess,
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs + 2,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    ...Shadows.sm,
  },
  cardCol2: {
    width: '48.7%',
  },
  cardCol3: {
    width: '31.5%',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeDanger: {
    backgroundColor: Colors.danger,
  },
  badgeWarning: {
    backgroundColor: Colors.warning,
  },
  badgeSuccess: {
    backgroundColor: Colors.success,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
