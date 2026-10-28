import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {
  Trash2,
  Plus,
  Minus,
  Clock,
  Zap,
  CalendarClock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { PolicyAcceptanceModal } from './PolicyAcceptanceModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useCart } from '../../context/CartContext';
import { DEMO_PICKUP_SLOTS } from '../../services/demo/demoData';
import { formatINR } from '../../utils/formatters';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const {
    items,
    canteen,
    orderType,
    setOrderType,
    selectedSlot,
    setSelectedSlot,
    isPolicyAccepted,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    total,
  } = useCart();

  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [customTimeModalVisible, setCustomTimeModalVisible] = useState(false);
  const [customHour, setCustomHour] = useState('01');
  const [customMinute, setCustomMinute] = useState('30');
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('PM');

  if (items.length === 0 || !canteen) {
    return (
      <View style={styles.container}>
        <Header title="Your Cart" showBack onBack={() => navigation.goBack()} />
        <EmptyState
          title="Your Cart is Empty"
          description="Browse campus canteens and add snacks, meals, or hot beverages to your order."
          actionTitle="Browse Canteens"
          onAction={() => navigation.navigate('StudentDashboard')}
        />
      </View>
    );
  }

  const handleApplyCustomTime = () => {
    const timeLabel = `${customHour}:${customMinute} ${customPeriod}`;
    setSelectedSlot({
      id: `custom_${Date.now()}`,
      label: `${timeLabel} (Custom Time)`,
      startTime: timeLabel,
      endTime: timeLabel,
      isAvailable: true,
    });
    setCustomTimeModalVisible(false);
  };

  const handleCheckoutPress = () => {
    if (orderType === 'preorder') {
      if (!selectedSlot) {
        Alert.alert('Required', 'Please choose a scheduled pickup time slot.');
        return;
      }
      if (!isPolicyAccepted) {
        setPolicyModalVisible(true);
        return;
      }
    }
    navigation.navigate('CheckoutScreen');
  };

  const isCustomSlotSelected = selectedSlot?.id.startsWith('custom_') || selectedSlot?.label.includes('Custom');

  return (
    <View style={styles.container}>
      <Header
        title="Your Cart"
        subtitle={canteen.name}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Trash2 size={15} color="#FFFFFF" />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Canteen Location Info */}
        <View style={styles.canteenBanner}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.canteenBannerText}>
            Ordering from <Text style={{ fontWeight: '700' }}>{canteen.name}</Text> ({canteen.buildingName}, Floor {canteen.floor})
          </Text>
        </View>

        {/* Order Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT ORDER TYPE</Text>
          <View style={styles.orderTypeRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOrderType('instant')}
              style={[
                styles.orderTypeCard,
                orderType === 'instant' && styles.orderTypeCardActive,
              ]}
            >
              <View style={styles.orderTypeIconRow}>
                <Zap
                  size={18}
                  color={orderType === 'instant' ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.orderTypeTitle,
                    orderType === 'instant' && styles.orderTypeTitleActive,
                  ]}
                >
                  Instant Order
                </Text>
              </View>
              <Text style={styles.orderTypeDesc}>Prepared immediately upon canteen acceptance.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setOrderType('preorder');
                if (!selectedSlot) {
                  setSelectedSlot(DEMO_PICKUP_SLOTS[0]);
                }
              }}
              style={[
                styles.orderTypeCard,
                orderType === 'preorder' && styles.orderTypeCardActive,
              ]}
            >
              <View style={styles.orderTypeIconRow}>
                <CalendarClock
                  size={18}
                  color={orderType === 'preorder' ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.orderTypeTitle,
                    orderType === 'preorder' && styles.orderTypeTitleActive,
                  ]}
                >
                  Preorder Slot
                </Text>
              </View>
              <Text style={styles.orderTypeDesc}>Pick up at your chosen scheduled break time.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preorder Time Slots & Custom Time Option */}
        {orderType === 'preorder' && (
          <View style={styles.section}>
            <View style={styles.slotHeaderRow}>
              <Text style={styles.sectionTitle}>PICKUP TIME WINDOW</Text>
              <TouchableOpacity
                onPress={() => setCustomTimeModalVisible(true)}
                style={styles.customTimeTriggerBtn}
              >
                <Sparkles size={13} color={Colors.primary} />
                <Text style={styles.customTimeTriggerText}>Custom Time</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.slotsGrid}>
              {DEMO_PICKUP_SLOTS.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotChip,
                      isSelected && styles.slotChipSelected,
                    ]}
                  >
                    <Clock
                      size={13}
                      color={isSelected ? '#FFFFFF' : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.slotChipText,
                        isSelected && styles.slotChipTextSelected,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Custom Selected Chip if applied */}
              {isCustomSlotSelected && (
                <TouchableOpacity
                  onPress={() => setCustomTimeModalVisible(true)}
                  style={[styles.slotChip, styles.slotChipSelected]}
                >
                  <Clock size={13} color="#FFFFFF" />
                  <Text style={[styles.slotChipText, styles.slotChipTextSelected]}>
                    {selectedSlot?.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Policy Acceptance Notice Box */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPolicyModalVisible(true)}
              style={[
                styles.policyNoticeBox,
                isPolicyAccepted && styles.policyNoticeBoxAccepted,
              ]}
            >
              <View style={styles.policyNoticeHeader}>
                {isPolicyAccepted ? (
                  <CheckCircle2 size={16} color={Colors.success} />
                ) : (
                  <ShieldCheck size={16} color="#B45309" />
                )}
                <Text
                  style={[
                    styles.policyNoticeTitle,
                    isPolicyAccepted && { color: Colors.success },
                  ]}
                >
                  {isPolicyAccepted
                    ? 'Pickup Policy Accepted (12-min window + 10-min grace)'
                    : 'Action Required: Review Preorder & Pickup Policy'}
                </Text>
              </View>
              <Text style={styles.policyNoticeSub}>
                12-minute collection window after food is ready, followed by a 10-minute late timer window. Self-pickup at counter.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS IN CART ({items.length})</Text>
          {items.map(({ item, quantity, subtotal: itemSub }) => (
            <Card key={item.itemId} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {formatINR(item.price)} each • <Text style={{ fontWeight: '700' }}>{formatINR(itemSub)}</Text>
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      if (quantity > 1) {
                        updateQuantity(item.itemId, quantity - 1);
                      } else {
                        removeFromCart(item.itemId);
                      }
                    }}
                    style={styles.qtyBtn}
                  >
                    <Minus size={14} color={Colors.primary} />
                  </TouchableOpacity>

                  <Text style={styles.qtyVal}>{quantity}</Text>

                  <TouchableOpacity
                    onPress={() => updateQuantity(item.itemId, quantity + 1)}
                    style={styles.qtyBtn}
                  >
                    <Plus size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILL DETAILS</Text>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>{formatINR(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Campus Facility Charges</Text>
              <Text style={[styles.summaryVal, { color: Colors.success }]}>₹0.00 (Free)</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>{formatINR(total)}</Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={styles.bottomCheckoutBar}>
        <View style={styles.checkoutTotalInfo}>
          <Text style={styles.checkoutTotalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.checkoutTotalVal}>{formatINR(total)}</Text>
        </View>

        <Button
          title={
            orderType === 'preorder' && !isPolicyAccepted
              ? 'Review Policy & Pay'
              : 'Proceed to Payment'
          }
          variant="primary"
          size="lg"
          onPress={handleCheckoutPress}
          style={styles.checkoutBtn}
        />
      </View>

      {/* Policy Acceptance Modal */}
      <PolicyAcceptanceModal
        visible={policyModalVisible}
        onClose={() => setPolicyModalVisible(false)}
        onAccept={() => {
          setPolicyModalVisible(false);
          navigation.navigate('CheckoutScreen');
        }}
        onDecline={() => setPolicyModalVisible(false)}
      />

      {/* Custom Pickup Time Modal */}
      <Modal
        visible={customTimeModalVisible}
        onClose={() => setCustomTimeModalVisible(false)}
        title="CHOOSE CUSTOM PICKUP TIME"
      >
        <View style={styles.customModalBody}>
          <Text style={styles.customModalSub}>
            Select the exact time you plan to collect your order at the counter:
          </Text>

          <View style={styles.timePickerRow}>
            {/* Hour Selector */}
            <View style={styles.timePickerCol}>
              <Text style={styles.pickerColLabel}>HOUR</Text>
              <View style={styles.pickerChipsWrap}>
                {['10', '11', '12', '01', '02', '03', '04', '05'].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setCustomHour(h)}
                    style={[styles.pickerChip, customHour === h && styles.pickerChipActive]}
                  >
                    <Text style={[styles.pickerChipText, customHour === h && styles.pickerChipTextActive]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minute Selector */}
            <View style={styles.timePickerCol}>
              <Text style={styles.pickerColLabel}>MINUTE</Text>
              <View style={styles.pickerChipsWrap}>
                {['00', '15', '30', '45'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setCustomMinute(m)}
                    style={[styles.pickerChip, customMinute === m && styles.pickerChipActive]}
                  >
                    <Text style={[styles.pickerChipText, customMinute === m && styles.pickerChipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.timePickerCol}>
              <Text style={styles.pickerColLabel}>PERIOD</Text>
              <View style={styles.pickerChipsWrap}>
                {(['AM', 'PM'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setCustomPeriod(p)}
                    style={[styles.pickerChip, customPeriod === p && styles.pickerChipActive]}
                  >
                    <Text style={[styles.pickerChipText, customPeriod === p && styles.pickerChipTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Selected Preview Banner */}
          <View style={styles.customPreviewBanner}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.customPreviewText}>
              Selected Slot: <Text style={{ fontWeight: '800' }}>{customHour}:{customMinute} {customPeriod}</Text>
            </Text>
          </View>

          <View style={styles.customModalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setCustomTimeModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Set Custom Time"
              variant="primary"
              onPress={handleApplyCustomTime}
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  canteenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    gap: 8,
  },
  canteenBannerText: {
    fontSize: 12,
    color: Colors.primaryDark,
    flex: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  customTimeTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  customTimeTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  orderTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  orderTypeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  orderTypeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  orderTypeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  orderTypeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderTypeTitleActive: {
    color: Colors.primaryDark,
  },
  orderTypeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  slotChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  slotChipTextSelected: {
    color: '#FFFFFF',
  },
  policyNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: 6,
  },
  policyNoticeBoxAccepted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  policyNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  policyNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  policyNoticeSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  itemCard: {
    marginBottom: 8,
    padding: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    paddingHorizontal: 8,
  },
  summaryCard: {
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomCheckoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
  },
  checkoutTotalInfo: {
    gap: 2,
  },
  checkoutTotalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  checkoutTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  checkoutBtn: {
    minWidth: 180,
  },
  customModalBody: {
    gap: 12,
  },
  customModalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timePickerCol: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    padding: 8,
  },
  pickerColLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 6,
    textAlign: 'center',
  },
  pickerChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  pickerChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  pickerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pickerChipTextActive: {
    color: '#FFFFFF',
  },
  customPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  customPreviewText: {
    fontSize: 13,
    color: Colors.primaryDark,
  },
  customModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
});
