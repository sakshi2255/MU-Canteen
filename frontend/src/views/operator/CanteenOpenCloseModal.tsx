import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, Store, AlertCircle } from 'lucide-react-native';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { Canteen } from '../../models/campus';
import { MenuItem } from '../../models/menu';
import { formatINR } from '../../utils/formatters';

interface CanteenOpenCloseModalProps {
  visible: boolean;
  canteen: Canteen | null;
  onClose: () => void;
  onConfirmOpen: () => void;
}

export const CanteenOpenCloseModal: React.FC<CanteenOpenCloseModalProps> = ({
  visible,
  canteen,
  onClose,
  onConfirmOpen,
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (visible && canteen) {
      ServiceProvider.menu.getMenuItems(canteen.canteenId).then((res) => {
        setItems(res);
      });
    }
  }, [visible, canteen]);

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    await ServiceProvider.menu.toggleItemAvailability(itemId, !currentStatus);
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, isAvailable: !currentStatus } : i))
    );
  };

  const handleConfirm = async () => {
    if (!canteen) return;
    setIsUpdating(true);
    try {
      await ServiceProvider.canteens.toggleCanteenOpen(canteen.canteenId, true);
      onConfirmOpen();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="OPEN CANTEEN — AVAILABILITY CHECK">
      <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <AlertCircle size={18} color={Colors.primary} />
          <Text style={styles.bannerText}>
            Review and confirm menu item availability before publishing opening status to students.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>MENU ITEMS FOR TODAY ({items.length})</Text>

        {items.map((item) => (
          <View key={item.itemId} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {formatINR(item.price)} • {item.category.replace('_', ' ')}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleItem(item.itemId, item.isAvailable)}
              style={[
                styles.availToggle,
                item.isAvailable ? styles.availToggleOn : styles.availToggleOff,
              ]}
            >
              {item.isAvailable ? (
                <>
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.availText}>AVAILABLE</Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color="#FFFFFF" />
                  <Text style={styles.availText}>SOLD OUT</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            title="Confirm & Open"
            variant="primary"
            loading={isUpdating}
            onPress={handleConfirm}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 8,
    marginBottom: Spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  availToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  availToggleOn: {
    backgroundColor: Colors.success,
  },
  availToggleOff: {
    backgroundColor: Colors.danger,
  },
  availText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

