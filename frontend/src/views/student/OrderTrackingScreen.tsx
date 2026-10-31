import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Info,
  Timer,
  AlertTriangle,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Order, OrderStatus } from '../../models/order';
import {
  formatINR,
  formatDateTime,
  getOrderStatusBadge,
  getOrderStatusLabel,
} from '../../utils/formatters';

interface OrderTrackingScreenProps {
  route: any;
  navigation: any;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchOrder = async () => {
    try {
      const data = await ServiceProvider.orders.getOrderById(orderId);
      if (data) setOrder(data);
    } catch {
      // Graceful
    }
  };

  useEffect(() => {
    fetchOrder();
    const unsub = demoStorage.subscribe(() => {
      fetchOrder();
    });
    const interval = setInterval(() => {
      fetchOrder();
      setNow(Date.now());
    }, 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Order Status" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingCenter}>
          <Text style={{ color: Colors.textSecondary }}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'awaiting_acceptance', label: 'In Queue' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready_for_pickup', label: 'Ready' },
    { key: 'picked_up', label: 'Collected' },
  ];

  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'awaiting_acceptance':
        return 0;
      case 'accepted':
      case 'preparing':
        return 1;
      case 'ready_for_pickup':
        return 2;
      case 'picked_up':
        return 3;
      default:
        return -1;
    }
  };

  const currentIndex = getStepIndex(order.orderStatus);
  const isTerminalNegative = ['rejected', 'cancelled', 'expired'].includes(order.orderStatus);
  const canCancel = order.orderStatus === 'awaiting_acceptance';

  // 12-min collection window + 10-min late timer calculations
  const calculateTimerState = () => {
    if (order.orderStatus !== 'ready_for_pickup') return null;
    const readyTimestamp = new Date(order.readyAt || order.updatedAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - readyTimestamp) / 1000));

    const COLLECT_WINDOW_SEC = 12 * 60; // 12 minutes
    const LATE_WINDOW_SEC = 10 * 60;    // 10 minutes

    if (elapsedSeconds <= COLLECT_WINDOW_SEC) {
      const remaining = COLLECT_WINDOW_SEC - elapsedSeconds;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      return {
        phase: 'collect',
        timeText: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        title: 'Food Ready for Collection',
        description: 'Please present your token at the canteen pickup counter.',
      };
    } else if (elapsedSeconds <= COLLECT_WINDOW_SEC + LATE_WINDOW_SEC) {
      const remaining = (COLLECT_WINDOW_SEC + LATE_WINDOW_SEC) - elapsedSeconds;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      return {
        phase: 'late',
        timeText: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        title: 'Late Collection Window (10-min Grace)',
        description: 'Standard 12-min pickup window ended. Please collect food immediately.',
      };
    } else {
      return {
        phase: 'expired',
        timeText: '00:00',
        title: 'Collection Window Expired',
        description: 'Please report to the canteen supervisor counter to claim your order.',
      };
    }
  };

  const timerState = calculateTimerState();

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await ServiceProvider.orders.cancelOrder(order.orderId, 'Student requested cancellation.');
      setCancelModalVisible(false);
      fetchOrder();
    } catch (err: any) {
      Alert.alert('Cancellation Error', err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Live Order Tracking"
        subtitle={order.orderNumber}
        showBack
        onBack={() => navigation.navigate('StudentDashboard')}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Pickup Token Card - Prominent! */}
        <View style={styles.tokenBox}>
          <Text style={styles.tokenBoxTitle}>YOUR CANTEEN PICKUP TOKEN</Text>
          <Text style={styles.tokenBoxCode}>{order.pickupToken}</Text>
          <Text style={styles.tokenBoxSub}>
            Show this code at the {order.canteenName} counter when collecting your order.
          </Text>
          {order.isTokenVerified && (
            <View style={styles.verifiedRow}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.verifiedText}>Token verified & order collected.</Text>
            </View>
          )}
        </View>

        {/* 12-Min Collection Window / 10-Min Late Window Timer Banner */}
        {timerState && (
          <View
            style={[
              styles.timerBanner,
              timerState.phase === 'collect' && styles.timerBannerCollect,
              timerState.phase === 'late' && styles.timerBannerLate,
              timerState.phase === 'expired' && styles.timerBannerExpired,
            ]}
          >
            <View style={styles.timerHeaderRow}>
              <View style={styles.timerIconWrap}>
                {timerState.phase === 'collect' ? (
                  <Timer size={18} color={Colors.primary} />
                ) : timerState.phase === 'late' ? (
                  <AlertTriangle size={18} color="#D97706" />
                ) : (
                  <XCircle size={18} color={Colors.danger} />
                )}
                <Text
                  style={[
                    styles.timerTitle,
                    timerState.phase === 'late' && { color: '#92400E' },
                    timerState.phase === 'expired' && { color: Colors.danger },
                  ]}
                >
                  {timerState.title}
                </Text>
              </View>
              <View
                style={[
                  styles.timerCountdownBadge,
                  timerState.phase === 'late' && styles.timerCountdownBadgeLate,
                  timerState.phase === 'expired' && styles.timerCountdownBadgeExpired,
                ]}
              >
                <Text
                  style={[
                    styles.timerCountdownText,
                    timerState.phase === 'late' && { color: '#B45309' },
                    timerState.phase === 'expired' && { color: '#FFFFFF' },
                  ]}
                >
                  {timerState.timeText}
                </Text>
              </View>
            </View>
            <Text style={styles.timerDesc}>{timerState.description}</Text>
          </View>
        )}

        {/* Visual Progress Stepper */}
        {!isTerminalNegative ? (
          <Card style={styles.stepperCard}>
            <Text style={styles.stepperTitle}>PREPARATION & PICKUP STATUS</Text>
            <View style={styles.stepperRow}>
              {steps.map((st, i) => {
                const isPassed = currentIndex >= i;
                const isCurrent = currentIndex === i;

                return (
                  <View key={st.key} style={styles.stepCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isPassed ? (
                        <CheckCircle2 size={12} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.stepNum}>{i + 1}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                      ]}
                    >
                      {st.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : (
          <Card style={styles.terminalCard}>
            <XCircle size={24} color={Colors.danger} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.terminalTitle}>Order {order.orderStatus.toUpperCase()}</Text>
              <Text style={styles.terminalDesc}>
                {order.rejectionReason || order.cancellationReason || 'This order has ended.'}
              </Text>
            </View>
          </Card>
        )}

        {/* Canteen & Pickup Location Info */}
        <Card style={styles.card}>
          <Text style={styles.cardHeaderTitle}>COLLECTION POINT</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color={Colors.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.canteenName}>{order.canteenName}</Text>
              <Text style={styles.canteenLoc}>
                {order.buildingName} • Floor {order.floor}
              </Text>
            </View>
          </View>

          {order.pickupTime && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Clock size={18} color="#D97706" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>
                    Preorder Pickup Window
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                    {order.pickupTime}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Ordered Items Breakdown */}
        <Card style={styles.card}>
          <Text style={styles.cardHeaderTitle}>ORDER ITEMS ({order.itemsSnapshot.length})</Text>
          {order.itemsSnapshot.map((item) => (
            <View key={item.itemId} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatINR(item.subtotal)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid / Payable</Text>
            <Text style={styles.totalVal}>{formatINR(order.total)}</Text>
          </View>

          <View style={styles.paymentInfoRow}>
            <Text style={styles.paymentMethodText}>
              Payment: {order.paymentMethod === 'razorpay' ? 'Razorpay Online' : order.paymentMethod.replace('_', ' ').toUpperCase()}
            </Text>
            <Badge
              label={order.paymentStatus.toUpperCase()}
              variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              size="sm"
            />
          </View>
        </Card>

        {/* Cancellation Section if eligible */}
        {canCancel && (
          <View style={styles.cancelBox}>
            <View style={styles.cancelNoticeRow}>
              <Info size={16} color={Colors.textSecondary} />
              <Text style={styles.cancelNoticeText}>
                Cancellation allowed only BEFORE the canteen begins food preparation.
              </Text>
            </View>
            <Button
              title="Cancel This Order"
              variant="outline"
              onPress={() => setCancelModalVisible(true)}
              style={styles.cancelBtn}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        title="CONFIRM CANCELLATION"
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.textPrimary, lineHeight: 18 }}>
            Are you sure you want to cancel order {order.orderNumber}?
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            Since kitchen preparation has not started yet, your cancellation will be processed immediately.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button
              title="Keep Order"
              variant="secondary"
              onPress={() => setCancelModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Yes, Cancel"
              variant="danger"
              loading={isCancelling}
              onPress={handleConfirmCancel}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  tokenBox: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    ...Shadows.base,
  },
  tokenBoxTitle: {
    color: '#E0F7F8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tokenBoxCode: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  tokenBoxSub: {
    color: '#E0F7F8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timerBanner: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  timerBannerCollect: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  timerBannerLate: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  timerBannerExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timerIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  timerCountdownBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timerCountdownBadgeLate: {
    backgroundColor: '#FEF3C7',
  },
  timerCountdownBadgeExpired: {
    backgroundColor: Colors.danger,
  },
  timerCountdownText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
    fontVariant: ['tabular-nums'],
  },
  timerDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  stepperCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  stepperTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotPassed: {
    backgroundColor: Colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: '#B2EBF2',
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  terminalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  terminalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
  terminalDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  canteenName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  canteenLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    width: 24,
  },
  itemName: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cancelBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cancelNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cancelNoticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  cancelBtn: {
    borderColor: Colors.danger,
  },
});
