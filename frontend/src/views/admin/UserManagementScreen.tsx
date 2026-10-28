import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { User, Shield, CheckCircle2, Ban, ArrowRightLeft } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { UserProfile, UserRole } from '../../models/user';

interface UserManagementScreenProps {
  navigation: any;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roleChangeUser, setRoleChangeUser] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    const list = await ServiceProvider.auth.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    await ServiceProvider.auth.toggleUserStatus(user.uid);
    loadUsers();
  };

  const handleUpdateRole = async (targetRole: UserRole) => {
    if (!roleChangeUser) return;
    await ServiceProvider.auth.updateUserRole(roleChangeUser.uid, targetRole);
    setRoleChangeUser(null);
    loadUsers();
  };

  const roles: UserRole[] = ['student', 'faculty', 'operator', 'admin'];

  return (
    <View style={styles.container}>
      <Header
        title="User Governance"
        subtitle="Roles & Access Control"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <User size={20} color={Colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.userName}>{item.displayName}</Text>
                  <Badge
                    label={item.role.toUpperCase()}
                    variant={
                      item.role === 'admin'
                        ? 'danger'
                        : item.role === 'operator'
                        ? 'warning'
                        : item.role === 'faculty'
                        ? 'info'
                        : 'primary'
                    }
                    size="sm"
                  />
                </View>
                <Text style={styles.email}>{item.email}</Text>
                {item.department ? (
                  <Text style={styles.deptText}>
                    {item.department} {item.rollNumber ? `• ${item.rollNumber}` : ''}
                  </Text>
                ) : null}
              </View>

              <Badge
                label={item.accountStatus.toUpperCase()}
                variant={item.accountStatus === 'active' ? 'success' : 'danger'}
                size="sm"
              />
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => setRoleChangeUser(item)}
                style={styles.actionBtn}
              >
                <ArrowRightLeft size={13} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Change Role</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleToggleStatus(item)}
                style={[
                  styles.actionBtn,
                  item.accountStatus === 'active' ? { borderColor: Colors.danger } : { borderColor: Colors.success },
                ]}
              >
                {item.accountStatus === 'active' ? (
                  <>
                    <Ban size={13} color={Colors.danger} />
                    <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Deactivate</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} color={Colors.success} />
                    <Text style={[styles.actionBtnText, { color: Colors.success }]}>Activate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Role Picker Modal */}
      <Modal
        visible={Boolean(roleChangeUser)}
        onClose={() => setRoleChangeUser(null)}
        title="ASSIGN ROLE"
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, color: Colors.textPrimary, marginBottom: 4 }}>
            Assign new role to <Text style={{ fontWeight: '700' }}>{roleChangeUser?.displayName}</Text>:
          </Text>

          {roles.map((r) => {
            const isSelected = roleChangeUser?.role === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => handleUpdateRole(r)}
                style={[
                  styles.roleOption,
                  isSelected && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    isSelected && styles.roleOptionTextSelected,
                  ]}
                >
                  {r.toUpperCase()}
                </Text>
                {isSelected && <CheckCircle2 size={16} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}

          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => setRoleChangeUser(null)}
            style={{ marginTop: 8 }}
          />
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
  list: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  deptText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleOptionTextSelected: {
    color: Colors.primaryDark,
  },
});

