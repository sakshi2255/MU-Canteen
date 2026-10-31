import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Clock,
  Check,
  X,
  ChefHat,
  PackageCheck,
  CalendarClock,
  Zap,
  Banknote,
  CheckCircle2,
  QrCode,
  ShieldCheck,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Order, OrderStatus } from '../../models/order';
import {
  formatINR,
  formatDateTime,
  getOrderStatusLabel,
} from '../../utils/formatters';

interface OrderQueueScreenProps {
  route: any;
  navigation: any;
}

export const OrderQueueScreen: React.FC<OrderQueueScreenProps> = ({ route, navigation }) => {
  const { canteenId } = route.params || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [declineOrderModal, setDeclineOrderModal] = useState<Order | null>(null);

  // Token Verification Modal for Collected stage
  const [collectedOrderModal, setCollectedOrderModal] = useState<Order | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadOrders = async () => {
    try {
      const list = await ServiceProvider.orders.getOrders(canteenId);
      setOrders(list);
    } catch {
      // Graceful
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = demoStorage.subscribe(() => {
      loadOrders();
    });
    return () => unsub();
  }, [canteenId]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, note?: string) => {
    try {
      await ServiceProvider.orders.updateOrderStatus(orderId, nextStatus, note);
      loadOrders();
    } catch (err: any) {
      Alert.alert('Status Error', err.message);
    }
  };

  // Stage 2: Accept -> transitions DIRECTLY to 'preparing' (no separate Start Preparing button)
  const handleAcceptOrder = async (order: Order) => {
    await handleUpdateStatus(
      order.orderId,
      'preparing',
      'Operator accepted order. Automatically transitioned directly to Preparing.'
    );
  };

  // Stage 3: Ready -> transitions from 'preparing' to 'ready_for_pickup'
  const handleMarkReady = async (order: Order) => {
    await handleUpdateStatus(
      order.orderId,
      'ready_for_pickup',
      'Operator marked food Ready for Pickup. Starts 12-min collection window.'
    );
  };

  // Stage 4: Collected -> verifies token and transitions to 'picked_up'
  const handleVerifyCollected = async () => {
    if (!collectedOrderModal) return;
    if (!tokenInput.trim()) {
      setVerifyError('Please enter the student pickup token.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      await ServiceProvider.orders.verifyPickupToken(
        collectedOrderModal.canteenId,
        tokenInput.trim()
      );
      setCollectedOrderModal(null);
      setTokenInput('');
      loadOrders();
      Alert.alert('Pickup Confirmed', `Order ${collectedOrderModal.orderNumber} successfully marked as Collected.`);
    } catch (err: any) {
      setVerifyError(err.message || 'Token verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Decline path: transitions from 'awaiting_acceptance' to 'rejected'
  const handleConfirmDecline = async () => {
    if (!declineOrderModal) return;
    await handleUpdateStatus(
      declineOrderModal.orderId,
      'rejected',
      'Operator declined order due to kitchen capacity or ingredient shortage.'
    );
    setDeclineOrderModal(null);
  };

  const handleMarkPaymentReceived = async (orderId: string) => {
    try {
      await ServiceProvider.orders.updatePaymentStatus(orderId, 'paid');
      loadOrders();
      Alert.alert('Payment Recorded', 'Cash payment has been recorded for this order.');
    } catch (err: any) {
      Alert.alert('Payment Error', err.message);
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'awaiting_acceptance', label: 'In Queue' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready_for_pickup', label: 'Ready' },
    { key: 'picked_up', label: 'Collected' },
  ];

  const getStatusVariant = (st: OrderStatus): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (st) {
      case 'awaiting_acceptance':
        return 'warning';
      case 'accepted':
      case 'preparing':
        return 'primary';
      case 'ready_for_pickup':
        return 'success';
      case 'picked_up':
        return 'neutral';
      case 'rejected':
      case 'cancelled':
      case 'expired':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'preparing') {
      return o.orderStatus === 'preparing' || o.orderStatus === 'accepted';
    }
    return o.orderStatus === activeTab;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Kitchen Order Queue"
        subtitle="Accept / Decline → Ready → Collected"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            let count = 0;
            if (tab.key === 'all') {
              count = orders.length;
            } else if (tab.key === 'preparing') {
              count = orders.filter((o) => o.orderStatus === 'preparing' || o.orderStatus === 'accepted').length;
            } else {
              count = orders.filter((o) => o.orderStatus === tab.key).length;
            }

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabChip, isSelected && styles.tabChipSelected]}
              >
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextSelected]}>
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders in this Status"
          description="Incoming orders will update here automatically in real time."
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isCash = item.paymentMethod === 'cash_at_counter';
            const isPaid = item.paymentStatus === 'paid';

            return (
              <Card style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.orderHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                      <View style={styles.tokenPill}>
                        <Text style={styles.tokenPillText}>TOKEN: {item.pickupToken}</Text>
                      </View>
                    </View>
                    <Text style={styles.customerName}>
                      {item.userDisplayName} • {item.userRole.toUpperCase()}
                    </Text>
                  </View>

                  <Badge
                    label={getOrderStatusLabel(item.orderStatus, 'operator')}
                    variant={getStatusVariant(item.orderStatus)}
                    size="sm"
                  />
                </View>

                {/* Order Type & Timing */}
                <View style={styles.typeRow}>
                  {item.orderType === 'instant' ? (
                    <View style={styles.instantTag}>
                      <Zap size={13} color={Colors.primary} />
                      <Text style={styles.instantTagText}>INSTANT ORDER</Text>
                    </View>
                  ) : (
                    <View style={styles.preorderTag}>
                      <CalendarClock size={13} color="#D97706" />
                      <Text style={styles.preorderTagText}>PREORDER: {item.pickupTime}</Text>
                    </View>
                  )}
                  <Text style={styles.timeText}>{formatDateTime(item.createdAt)}</Text>
                </View>

                {/* Items Summary */}
                <View style={styles.itemsBox}>
                  {item.itemsSnapshot.map((it) => (
                    <View key={it.itemId} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{it.quantity}x</Text>
                      <Text style={styles.itemName}>{it.name}</Text>
                      <Text style={styles.itemSubtotal}>{formatINR(it.subtotal)}</Text>
                    </View>
                  ))}
                </View>

                {/* Total & Payment Method Row */}
                <View style={styles.billRow}>
                  <Text style={styles.billTotal}>Total: {formatINR(item.total)}</Text>
                  <Text style={styles.paymentMethodLabel}>
                    Payment: {item.paymentMethod === 'razorpay' ? 'Razorpay' : item.paymentMethod.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                {/* Cash vs Online Payment Status Indicator */}
                <View style={styles.paymentControlSection}>
                  {isCash ? (
                    isPaid ? (
                      <View style={styles.paymentButtonPaid}>
                        <CheckCircle2 size={14} color="#FFFFFF" />
                        <Text style={styles.paymentButtonPaidText}>Cash Payment Received ({formatINR(item.total)})</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleMarkPaymentReceived(item.orderId)}
                        style={styles.markCashBtn}
                      >
                        <Banknote size={15} color="#059669" />
                        <Text style={styles.markCashBtnText}>Mark Cash Payment Received ({formatINR(item.total)})</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    isPaid ? (
                      <View style={styles.paymentButtonPaid}>
                        <CheckCircle2 size={14} color="#FFFFFF" />
                        <Text style={styles.paymentButtonPaidText}>Payment Confirmed (Online / Razorpay)</Text>
                      </View>
                    ) : (
                      <View style={styles.paymentButtonPendingGrey}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.paymentButtonPendingText}>Payment Pending (Waiting for Gateway)</Text>
                      </View>
                    )
                  )}
                </View>

                {/* EXACT REQUIRED WORKFLOW: Accept / Decline → Ready → Collected */}
                <View style={styles.actionRow}>
                  {/* Stage 1: In Queue -> Accept (auto-moves to Preparing) or Decline */}
                  {item.orderStatus === 'awaiting_acceptance' && (
                    <>
                      <Button
                        title="Decline"
                        variant="outline"
                        size="sm"
                        icon={<X size={14} color={Colors.danger} />}
                        onPress={() => setDeclineOrderModal(item)}
                        style={{ flex: 1, borderColor: Colors.danger }}
                      />
                      <Button
                        title="Accept"
                        variant="primary"
                        size="sm"
                        icon={<Check size={14} color="#FFFFFF" />}
                        onPress={() => handleAcceptOrder(item)}
                        style={{ flex: 2 }}
                      />
                    </>
                  )}

                  {/* Stage 2: Preparing -> Next action is ONLY Ready */}
                  {(item.orderStatus === 'preparing' || item.orderStatus === 'accepted') && (
                    <Button
                      title="Ready"
                      variant="primary"
                      size="sm"
                      icon={<PackageCheck size={15} color="#FFFFFF" />}
                      onPress={() => handleMarkReady(item)}
                      style={{ flex: 1, backgroundColor: '#059669' }}
                    />
                  )}

                  {/* Stage 3: Ready for Pickup -> Next action is ONLY Collected */}
                  {item.orderStatus === 'ready_for_pickup' && (
                    <Button
                      title="Collected"
                      variant="primary"
                      size="sm"
                      icon={<QrCode size={15} color="#FFFFFF" />}
                      onPress={() => {
                        setCollectedOrderModal(item);
                        setTokenInput('');
                        setVerifyError(null);
                      }}
                      style={{ flex: 1, backgroundColor: Colors.primaryDark }}
                    />
                  )}

                  {/* Stage 4: Picked Up -> Complete state, disabled */}
                  {item.orderStatus === 'picked_up' && (
                    <View style={styles.pickedUpBanner}>
                      <Check size={14} color={Colors.success} />
                      <Text style={styles.pickedUpText}>Collected by Student • Token Verified</Text>
                    </View>
                  )}

                  {/* Terminal negative states */}
                  {(item.orderStatus === 'rejected' || item.orderStatus === 'cancelled') && (
                    <View style={styles.terminalBanner}>
                      <X size={14} color={Colors.danger} />
                      <Text style={styles.terminalText}>
                        Order {item.orderStatus === 'rejected' ? 'Declined' : 'Cancelled'}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Decline Confirmation Modal */}
      <Modal
        visible={Boolean(declineOrderModal)}
        onClose={() => setDeclineOrderModal(null)}
        title="DECLINE ORDER"
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.textPrimary, lineHeight: 18 }}>
            Are you sure you want to decline order {declineOrderModal?.orderNumber}?
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            The student will be notified immediately that the order was declined.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setDeclineOrderModal(null)}
              style={{ flex: 1 }}
            />
            <Button
              title="Decline Order"
              variant="danger"
              onPress={handleConfirmDecline}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

      {/* Collected Token Verification Modal */}
      <Modal
        visible={Boolean(collectedOrderModal)}
        onClose={() => setCollectedOrderModal(null)}
        title="CONFIRM ORDER PICKUP"
      >
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color={Colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>
              Verify Token for {collectedOrderModal?.orderNumber}
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 16 }}>
            Ask student for their 4-character pickup token (e.g. {collectedOrderModal?.pickupToken}) to mark as Collected:
          </Text>

          <Input
            placeholder="e.g. MU-1234 or 1234"
            value={tokenInput}
            onChangeText={(t) => {
              setTokenInput(t.toUpperCase());
              setVerifyError(null);
            }}
            autoCapitalize="characters"
            style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: 2, color: Colors.primaryDark }}
          />

          {verifyError && (
            <Text style={{ fontSize: 12, color: Colors.danger, fontWeight: '600' }}>
              {verifyError}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setCollectedOrderModal(null)}
              style={{ flex: 1 }}
            />
            <Button
              title={isVerifying ? 'Verifying...' : 'Mark Collected'}
              variant="primary"
              loading={isVerifying}
              onPress={handleVerifyCollected}
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
  tabsBar: {
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabChipSelected: {
    backgroundColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabChipTextSelected: {
    color: '#FFFFFF',
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tokenPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tokenPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  customerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  instantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instantTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  preorderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preorderTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  itemsBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginVertical: 6,
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    width: 24,
  },
  itemName: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentMethodLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  paymentControlSection: {
    marginVertical: 6,
  },
  markCashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: BorderRadius.sm,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  markCashBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  paymentButtonPaid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  paymentButtonPaidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentButtonPendingGrey: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  paymentButtonPendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  pickedUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius.sm,
  },
  pickedUpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  terminalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.sm,
  },
  terminalText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
});
