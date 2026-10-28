import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldAlert, CheckSquare, Square, Clock, Info } from 'lucide-react-native';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useCart } from '../../context/CartContext';
import { DEMO_CAMPUS_SETTINGS } from '../../services/demo/demoData';

interface PolicyAcceptanceModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export const PolicyAcceptanceModal: React.FC<PolicyAcceptanceModalProps> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
}) => {
  const { selectedSlot, isPolicyAccepted, setPolicyAccepted } = useCart();
  const [isChecked, setIsChecked] = useState(isPolicyAccepted);

  const handleConfirm = () => {
    if (isChecked) {
      setPolicyAccepted(true);
      onAccept();
    }
  };

  const handleCancel = () => {
    setPolicyAccepted(false);
    onDecline();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="PREORDER & PICKUP POLICY">
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Pickup Time Slot Banner */}
        <View style={styles.slotBanner}>
          <Clock size={18} color={Colors.primary} />
          <View style={styles.slotTextCol}>
            <Text style={styles.slotLabel}>Your Scheduled Pickup Window:</Text>
            <Text style={styles.slotValue}>
              {selectedSlot ? selectedSlot.label : 'Select a slot on the cart screen'}
            </Text>
          </View>
        </View>

        {/* Policy Highlights based on official campus rules */}
        <View style={styles.rulesList}>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>1.</Text>
            <Text style={styles.ruleText}>
              <Text style={styles.boldText}>12-Minute Food Collection Window: </Text>
              Once your food is marked "Ready for Pickup", you have a 12-minute window to collect your order at the designated counter.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>2.</Text>
            <Text style={styles.ruleText}>
              <Text style={styles.boldText}>10-Minute Late Timer Window (Grace Period): </Text>
              If uncollected after 12 minutes, a 10-minute late grace timer begins before the uncollected order protocol takes effect.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>3.</Text>
            <Text style={styles.ruleText}>
              <Text style={styles.boldText}>Self-Pickup Only (No Campus Delivery): </Text>
              This is a self-pickup mobile service at the respective canteen counter. No room delivery is provided on campus.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>4.</Text>
            <Text style={styles.ruleText}>
              <Text style={styles.boldText}>Strict Cancellation Cutoff: </Text>
              Orders may be cancelled only BEFORE the canteen begins food preparation. Once marked "Preparing", orders cannot be cancelled.
            </Text>
          </View>

          <View style={styles.review2NoticeBox}>
            <Info size={16} color="#B45309" style={{ marginTop: 2 }} />
            <Text style={styles.review2NoticeText}>
              <Text style={styles.boldText}>Campus Governance Notice: </Text>
              Uncollected orders after the full 12+10 minute window cannot be held indefinitely to preserve kitchen space and hygiene standards.
            </Text>
          </View>
        </View>

        {/* Policy Version */}
        <Text style={styles.policyVersionText}>
          Policy Version: {DEMO_CAMPUS_SETTINGS.preorderPolicyVersion} • Marwadi University Governance
        </Text>

        {/* Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsChecked(!isChecked)}
          style={styles.checkboxRow}
        >
          {isChecked ? (
            <CheckSquare size={22} color={Colors.primary} />
          ) : (
            <Square size={22} color={Colors.textSecondary} />
          )}
          <Text style={styles.checkboxLabel}>
            I understand and accept the 12-min collection window & 10-min late timer policy.
          </Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Decline"
            variant="secondary"
            onPress={handleCancel}
            style={styles.actionBtn}
          />
          <Button
            title="I Agree & Continue"
            variant="primary"
            disabled={!isChecked}
            onPress={handleConfirm}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 460,
  },
  slotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  slotTextCol: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  slotValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  rulesList: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  ruleNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    width: 16,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  review2NoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginTop: 4,
  },
  review2NoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  policyVersionText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: 10,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
});
