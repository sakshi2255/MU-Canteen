import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { QrCode, CheckCircle2, AlertTriangle, Search, ShieldCheck } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { Order } from '../../models/order';
import { formatINR, formatDateTime } from '../../utils/formatters';

interface PickupVerificationScreenProps {
  route: any;
  navigation: any;
}

export const PickupVerificationScreen: React.FC<PickupVerificationScreenProps> = ({
  route,
  navigation,
}) => {
  const { canteenId } = route.params || {};
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!tokenInput.trim()) {
      setErrorMsg('Please enter a 4-character pickup token (e.g. MU-4892 or 4892).');
      return;
    }
    if (!canteenId) {
      setErrorMsg('No canteen selected.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setVerifiedOrder(null);

    try {
      const order = await ServiceProvider.orders.verifyPickupToken(canteenId, tokenInput.trim());
      setVerifiedOrder(order);
      setTokenInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Token verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Pickup Verification"
        subtitle="Counter Token Scanner"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Token Input Box */}
        <Card style={styles.searchCard}>
          <View style={styles.iconCircle}>
            <QrCode size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Enter Student Pickup Code</Text>
          <Text style={styles.desc}>
            Ask the student for their order pickup token from the MU Canteen app.
          </Text>

          <Input
            placeholder="e.g. MU-4892 or 4892"
            value={tokenInput}
            onChangeText={(t) => {
              setTokenInput(t.toUpperCase());
              setErrorMsg(null);
            }}
            autoCapitalize="characters"
            style={styles.tokenInputStyle}
            containerStyle={{ width: '100%', marginTop: Spacing.md }}
          />

          {errorMsg && (
            <View style={styles.errorBox}>
              <AlertTriangle size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Button
            title={isVerifying ? 'Verifying Token...' : 'Verify & Handover Food'}
            variant="primary"
            size="lg"
            loading={isVerifying}
            onPress={handleVerify}
            style={{ width: '100%', marginTop: 8 }}
          />
        </Card>

        {/* Verification Success Result */}
        {verifiedOrder && (
          <Card style={styles.successCard}>
            <View style={styles.successHeader}>
              <CheckCircle2 size={32} color={Colors.success} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.successTitle}>PICKUP VERIFIED SUCCESSFULLY</Text>
                <Text style={styles.successSub}>
                  Order marked as <Text style={{ fontWeight: '700' }}>PICKED UP</Text>.
                </Text>
              </View>
            </View>

            <View style={styles.orderSummaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Number:</Text>
                <Text style={styles.summaryVal}>{verifiedOrder.orderNumber}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Student / Customer:</Text>
                <Text style={styles.summaryVal}>{verifiedOrder.userDisplayName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Total:</Text>
                <Text style={styles.summaryVal}>{formatINR(verifiedOrder.total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Status:</Text>
                <Text style={[styles.summaryVal, { color: Colors.success }]}>
                  {verifiedOrder.paymentStatus.toUpperCase()} ({verifiedOrder.paymentMethod})
                </Text>
              </View>

              <View style={styles.divider} />
              <Text style={styles.itemsHeading}>ITEMS HANDED OVER:</Text>
              {verifiedOrder.itemsSnapshot.map((i, idx) => (
                <Text key={idx} style={styles.itemLine}>
                  • {i.quantity}x {i.name} ({formatINR(i.subtotal)})
                </Text>
              ))}
            </View>
          </Card>
        )}

        {/* Token Verification Rules Reminder */}
        <View style={styles.rulesCard}>
          <ShieldCheck size={18} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.rulesTitle}>Security & Duplicate Protection</Text>
            <Text style={styles.rulesText}>
              • Tokens are single-use only. A token cannot be verified more than once.{'\n'}
              • Duplicate collection attempts are instantly detected and rejected.{'\n'}
              • Orders cancelled by students cannot be collected.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  searchCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  tokenInputStyle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    color: Colors.primaryDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: 8,
    width: '100%',
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    lineHeight: 16,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  successSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  orderSummaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  itemsHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemLine: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  rulesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rulesText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});

