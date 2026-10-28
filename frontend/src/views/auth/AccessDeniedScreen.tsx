import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldX } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface AccessDeniedScreenProps {
  navigation: any;
  route?: any;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ navigation, route }) => {
  const message = route?.params?.message || 'ONLY FOR AUTHORIZED CAMPUS ROLES';

  return (
    <View style={styles.container}>
      <Header
        title="Access Restricted"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.restrictedCard}>
          <ShieldX size={44} color={Colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={styles.restrictedTitle}>{message.toUpperCase()}</Text>
          <Text style={styles.restrictedSub}>
            You do not possess the required campus permissions to view or interact with this section.
          </Text>
        </View>

        <Button
          title="Return to Dashboard"
          variant="primary"
          onPress={() => navigation.goBack()}
          style={{ width: '100%', marginTop: 24 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  restrictedCard: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingVertical: 36,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restrictedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  restrictedSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 260,
  },
});

