import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  GraduationCap,
  Briefcase,
  Store,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import { Modal } from './Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../models/user';
import { DEMO_USERS } from '../../services/demo/demoData';

interface DemoRoleSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoRoleSwitcherModal: React.FC<DemoRoleSwitcherModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, role, switchDemoRole } = useAuth();

  const handleSelectRole = async (targetRole: UserRole) => {
    await switchDemoRole(targetRole);
    onClose();
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case 'student':
        return <GraduationCap size={20} color={Colors.primary} />;
      case 'faculty':
        return <Briefcase size={20} color="#2563EB" />;
      case 'operator':
        return <Store size={20} color="#D97706" />;
      case 'admin':
        return <ShieldCheck size={20} color="#DC2626" />;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="SWITCH DEMO ACCOUNT">
      <View style={styles.container}>
        <View style={styles.infoBanner}>
          <Info size={16} color={Colors.primary} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            Review 1 Demo Mode: Switch instantly between roles to test the student ordering flow,
            canteen operator acceptance & token verification, or campus admin controls.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>SELECT DEMO ACCOUNT</Text>

        {DEMO_USERS.map((demoUser) => {
          const isSelected = user?.email === demoUser.email;
          return (
            <TouchableOpacity
              key={demoUser.uid}
              activeOpacity={0.7}
              onPress={() => handleSelectRole(demoUser.role)}
              style={[
                styles.accountRow,
                isSelected && styles.accountRowSelected,
              ]}
            >
              <View style={styles.iconCircle}>{getRoleIcon(demoUser.role)}</View>

              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{demoUser.displayName}</Text>
                  <View style={[styles.roleTag, { backgroundColor: getRoleColor(demoUser.role).bg }]}>
                    <Text style={[styles.roleTagText, { color: getRoleColor(demoUser.role).text }]}>
                      {demoUser.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.emailText}>{demoUser.email}</Text>
                {demoUser.department ? (
                  <Text style={styles.deptText}>{demoUser.department}</Text>
                ) : null}
              </View>

              {isSelected && (
                <CheckCircle2 size={20} color={Colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

function getRoleColor(role: UserRole) {
  switch (role) {
    case 'student':
      return { bg: Colors.primaryLight, text: Colors.primary };
    case 'faculty':
      return { bg: '#EFF6FF', text: '#2563EB' };
    case 'operator':
      return { bg: '#FFFBEB', text: '#D97706' };
    case 'admin':
      return { bg: '#FEF2F2', text: '#DC2626' };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  accountRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  deptText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  checkIcon: {
    marginLeft: 6,
  },
  closeBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});

