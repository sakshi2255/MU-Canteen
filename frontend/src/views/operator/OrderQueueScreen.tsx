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
  MapPin,
  CalendarClock,
  Zap,
  Banknote,
  CheckCircle2,
  Timer,
  QrCode,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Order, OrderStatus, PaymentStatus } from '../../models/order';
import {
  formatINR,
  formatDateTime,
  getOrderStatusBadge,
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
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);

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

  const handleMarkPaymentReceived = async (orderId: string) => {
    try {
      await ServiceProvider.orders.updatePaymentStatus(orderId, 'paid');
      loadOrders();
      Alert.alert('Payment Recorded', 'Cash payment has been successfully recorded for this order.');
    } catch (err: any) {
      Alert.alert('Payment Error', err.message);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectOrderModal) return;
    await handleUpdateStatus(
      rejectOrderModal.orderId,
      'rejected',
      'Operator rejected order due to kitchen capacity or ingredient shortage.'
    );
    setRejectOrderModal(null);
  };

  const filterTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'awaiting_acceptance', label: 'Awaiting' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'In Kitchen' },
    { key: 'ready_for_pickup', label: 'Ready' },
    { key: 'picked_up', label: 'Collected' },
  ];

  const getStatusVariant = (st: OrderStatus): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (st) {
      case 'awaiting_acceptance':
        return 'warning';
      case 'accepted':
        return 'info';
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
    return o.orderStatus === activeTab;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Kitchen Order Queue"
        subtitle="Live Preparation & Counter Handover"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = tab.key === 'all' ? orders.length : orders.filter((o) => o.orderStatus === tab.key).length;
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
          description="Orders matching this tab will show up here in real time."
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
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                      <View style={styles.tokenPill}>
                        <Text style={styles.tokenPillText}>TOKEN: {item.pickupToken}</Text>
                      </View>
                    </View>
                    <Text style={styles.customerName}>
                      {item.userDisplayName} ({item.userRole.toUpperCase()})
                    </Text>
                  </View>

                  <Badge
                    label={getOrderStatusLabel(item.orderStatus)}
                    variant={getStatusVariant(item.orderStatus)}
                    size="sm"
                  />
                </View>

                {/* Order Type & Timing */}
                <View style={styles.typeRow}>
                  {item.orderType === 'instant' ? (
                    <View style={styles.instantTag}>
                      <Zap size={13} color={Colors.primary} />
                      <Text style={styles.instantTagText}>INSTANT PREPARATION</Text>
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
                    Method: {item.paymentMethod === 'razorpay' ? 'Razorpay Online' : item.paymentMethod.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                {/* Payment Action / Status Controls (Cash Received vs Online Received) */}
                <View style={styles.paymentControlSection}>
                  {isCash ? (
                    // Cash at counter
                    isPaid ? (
                      <View style={styles.paymentButtonPaid}>
                        <CheckCircle2 size={15} color="#FFFFFF" />
                        <Text style={styles.paymentButtonPaidText}>Cash Payment Received (₹{item.total})</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleMarkPaymentReceived(item.orderId)}
                        style={styles.markCashBtn}
                      >
                        <Banknote size={15} color="#059669" />
                        <Text style={styles.markCashBtnText}>Mark Cash Payment Received (₹{item.total})</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    // Online payment (Razorpay / UPI / Card)
                    isPaid ? (
                      <View style={styles.paymentButtonPaid}>
                        <CheckCircle2 size={15} color="#FFFFFF" />
                        <Text style={styles.paymentButtonPaidText}>
                          Payment Received ({item.paymentMethod === 'razorpay' ? 'Razorpay' : 'Online'}) ✓
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.paymentButtonPendingGrey}>
                        <Clock size={15} color="#6B7280" />
                        <Text style={styles.paymentButtonPendingText}>Payment Pending (Waiting for Gateway)</Text>
                      </View>
                    )
                  )}
                </View>

                {/* Ordering Lifecycle Action Buttons */}
                <View style={styles.actionRow}>
                  {item.orderStatus === 'awaiting_acceptance' && (
                    <>
                      <Button
                        title="Reject"
                        variant="outline"
                        size="sm"
                        icon={<X size={14} color={Colors.danger} />}
                        onPress={() => setRejectOrderModal(item)}
                        style={{ flex: 1, borderColor: Colors.danger }}
                      />
                      <Button
                        title="Accept Order"
                        variant="primary"
                        size="sm"
                        icon={<Check size={14} color="#FFFFFF" />}
                        onPress={() => handleUpdateStatus(item.orderId, 'accepted', 'Canteen operator accepted order.')}
                        style={{ flex: 2 }}
                      />
                    </>
                  )}

                  {item.orderStatus === 'accepted' && (
                    <Button
                      title="Start Kitchen Prep"
                      variant="primary"
                      size="sm"
                      icon={<ChefHat size={15} color="#FFFFFF" />}
                      onPress={() => handleUpdateStatus(item.orderId, 'preparing', 'Kitchen has started preparing food.')}
                      style={{ flex: 1 }}
                    />
                  )}

                  {item.orderStatus === 'preparing' && (
                    <Button
                      title="Mark Food Ready (Starts 12-Min Collect Window)"
                      variant="primary"
                      size="sm"
                      icon={<PackageCheck size={15} color="#FFFFFF" />}
                      onPress={() => handleUpdateStatus(item.orderId, 'ready_for_pickup', 'Food is ready for pickup at the counter.')}
                      style={{ flex: 1, backgroundColor: '#059669' }}
                    />
                  )}

                  {item.orderStatus === 'ready_for_pickup' && (
                    <Button
                      title="Verify Token & Handover"
                      variant="primary"
                      size="sm"
                      icon={<QrCode size={15} color="#FFFFFF" />}
                      onPress={() => navigation.navigate('PickupVerificationScreen', { canteenId })}
                      style={{ flex: 1 }}
                    />
                  )}

                  {item.orderStatus === 'picked_up' && (
                    <View style={styles.pickedUpBanner}>
                      <Check size={14} color={Colors.success} />
                      <Text style={styles.pickedUpText}>Order collected by student • Token verified</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Reject Reason Confirmation Modal */}
      <Modal
        visible={Boolean(rejectOrderModal)}
        onClose={() => setRejectOrderModal(null)}
        title="REJECT INCOMING ORDER"
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.textPrimary }}>
            Are you sure you want to reject order {rejectOrderModal?.orderNumber}?
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            The student will be notified and any online payment will be marked refunded.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setRejectOrderModal(null)}
              style={{ flex: 1 }}
            />
            <Button
              title="Reject Order"
              variant="danger"
              onPress={handleConfirmReject}
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
    paddingVertical: 6,
    flex: 1,
  },
  pickedUpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
});
