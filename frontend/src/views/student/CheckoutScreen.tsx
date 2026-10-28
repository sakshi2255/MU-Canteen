import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { PaymentMethod } from '../../models/order';
import { generateIdempotencyKey, requestGuard } from '../../utils/idempotency';
import { formatINR } from '../../utils/formatters';

interface CheckoutScreenProps {
  navigation: any;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const {
    items,
    canteen,
    orderType,
    selectedSlot,
    subtotal,
    total,
    isPolicyAccepted,
    policyAcceptedAt,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!canteen || items.length === 0) return;

    const idempotencyKey = generateIdempotencyKey();
    if (!requestGuard.startRequest(idempotencyKey)) {
      return; // Already executing
    }

    setIsSubmitting(true);

    try {
      const isOnline = paymentMethod === 'razorpay' || paymentMethod === 'simulated_upi' || paymentMethod === 'simulated_card';
      const paymentTxId = isOnline ? `pay_rzp_mu_${Math.floor(100000 + Math.random() * 900000)}` : undefined;

      const orderPayload = {
        userId: user?.uid || 'guest-student',
        userDisplayName: user?.displayName || 'Student',
        userRole: user?.role || 'student',
        canteenId: canteen.canteenId,
        canteenName: canteen.name,
        buildingName: canteen.buildingName,
        floor: canteen.floor,
        orderType,
        pickupTime: orderType === 'preorder' ? selectedSlot?.label : undefined,
        itemsSnapshot: items.map((i) => ({
          itemId: i.item.itemId,
          name: i.item.name,
          price: i.item.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
        subtotal,
        total,
        paymentMethod,
        paymentStatus: (isOnline ? 'paid' : 'pending') as import('../../models/order').PaymentStatus,
        paymentTransactionId: paymentTxId,
        policyVersion: orderType === 'preorder' ? '1.0-REV1' : undefined,
        policyAcceptedAt: orderType === 'preorder' ? (policyAcceptedAt || new Date().toISOString()) : undefined,
        idempotencyKey,
      };

      const created = await ServiceProvider.orders.createOrder(orderPayload);
      requestGuard.finishRequest(idempotencyKey, created);

      clearCart();
      navigation.replace('OrderTrackingScreen', { orderId: created.orderId });
    } catch (err: any) {
      requestGuard.finishRequest(idempotencyKey);
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Checkout & Payment"
        subtitle="Secure Campus Transaction"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Order Details Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
          <Card style={styles.card}>
            <Text style={styles.canteenHeaderName}>{canteen?.name}</Text>
            <Text style={styles.canteenHeaderLoc}>
              {canteen?.buildingName} • Floor {canteen?.floor}
            </Text>

            <View style={styles.typeBadgeRow}>
              <Text style={styles.typeBadgeText}>
                {orderType === 'instant' ? '⚡ INSTANT ORDER' : `⏱ PREORDER (${selectedSlot?.label})`}
              </Text>
            </View>

            <View style={styles.itemsSummaryList}>
              {items.map((i) => (
                <View key={i.item.itemId} style={styles.itemSummaryRow}>
                  <Text style={styles.itemSummaryQty}>{i.quantity}x</Text>
                  <Text style={styles.itemSummaryName}>{i.item.name}</Text>
                  <Text style={styles.itemSummarySubtotal}>{formatINR(i.subtotal)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Amount Payable</Text>
              <Text style={styles.grandTotalVal}>{formatINR(total)}</Text>
            </View>
          </Card>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

          {/* Razorpay Gateway */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPaymentMethod('razorpay')}
            style={[
              styles.methodOption,
              paymentMethod === 'razorpay' && styles.methodOptionSelected,
            ]}
          >
            <View style={styles.rzpIconWrap}>
              <Sparkles size={18} color="#0D9488" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.methodName}>Razorpay Payment Gateway</Text>
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedText}>FASTEST</Text>
                </View>
              </View>
              <Text style={styles.methodSub}>UPI (GPay / PhonePe / Paytm), Debit/Credit Cards & NetBanking</Text>
            </View>
            {paymentMethod === 'razorpay' && (
              <CheckCircle2 size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>

          {/* Cash At Counter */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPaymentMethod('cash_at_counter')}
            style={[
              styles.methodOption,
              paymentMethod === 'cash_at_counter' && styles.methodOptionSelected,
            ]}
          >
            <Banknote size={20} color="#059669" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodName}>Pay Cash at Canteen Counter</Text>
              <Text style={styles.methodSub}>Pay physical cash to the canteen operator during token verification</Text>
            </View>
            {paymentMethod === 'cash_at_counter' && (
              <CheckCircle2 size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>

          {/* Simulated Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPaymentMethod('simulated_card')}
            style={[
              styles.methodOption,
              paymentMethod === 'simulated_card' && styles.methodOptionSelected,
            ]}
          >
            <CreditCard size={20} color="#2563EB" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodName}>Debit / Credit Card (Test)</Text>
              <Text style={styles.methodSub}>Visa / Mastercard / RuPay demo simulation</Text>
            </View>
            {paymentMethod === 'simulated_card' && (
              <CheckCircle2 size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.footerBar}>
        <Button
          title={
            isSubmitting
              ? 'Processing Transaction...'
              : paymentMethod === 'razorpay'
              ? `Pay with Razorpay (${formatINR(total)})`
              : paymentMethod === 'cash_at_counter'
              ? `Confirm Cash Order (${formatINR(total)})`
              : `Confirm Order (${formatINR(total)})`
          }
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handlePlaceOrder}
          style={styles.confirmBtn}
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
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  section: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
  },
  canteenHeaderName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  canteenHeaderLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  typeBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemsSummaryList: {
    gap: 6,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSummaryQty: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    width: 28,
  },
  itemSummaryName: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemSummarySubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: 8,
  },
  methodOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  rzpIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedPill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recommendedText: {
    color: Colors.primaryDark,
    fontSize: 9,
    fontWeight: '800',
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  methodSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  footerBar: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    width: '100%',
  },
});
