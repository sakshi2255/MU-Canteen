import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Building2,
  Users,
  Settings,
  ShieldAlert,
  BarChart2,
  Store,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DemoRoleSwitcherModal } from '../../components/common/DemoRoleSwitcherModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Order } from '../../models/order';
import { formatINR } from '../../utils/formatters';

interface AdminDashboardProps {
  navigation: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { canteens, buildings, refreshCampus } = useCampus();
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  const loadData = async () => {
    const o = await ServiceProvider.orders.getOrders();
    setOrders(o);
    const u = await ServiceProvider.auth.getUsers();
    setUsersCount(u.length);
  };

  useEffect(() => {
    loadData();
    const unsub = demoStorage.subscribe(() => {
      loadData();
      refreshCampus();
    });
    return () => unsub();
  }, []);

  const openCanteensCount = canteens.filter((c) => c.isOpen).length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === 'picked_up').length;
  const cancelledOrdersCount = orders.filter((o) => o.orderStatus === 'cancelled').length;

  const totalCampusSales = orders
    .filter((o) => o.orderStatus === 'picked_up' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <View style={styles.container}>
      <Header
        title="Campus Administration"
        subtitle="Marwadi University Central Canteen Governance"
        onRoleSwitchPress={() => setRoleModalVisible(true)}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Campus Overview KPI Cards */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Store size={20} color={Colors.primary} />
            <Text style={styles.kpiVal}>{canteens.length}</Text>
            <Text style={styles.kpiLabel}>Configured Canteens</Text>
            <Text style={styles.kpiSub}>{openCanteensCount} currently open</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Building2 size={20} color="#2563EB" />
            <Text style={styles.kpiVal}>{buildings.length}</Text>
            <Text style={styles.kpiLabel}>Campus Buildings</Text>
            <Text style={styles.kpiSub}>Main Bldg (Floors 1-6), Law</Text>
          </Card>
        </View>

        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <TrendingUp size={20} color={Colors.success} />
            <Text style={styles.kpiVal}>{orders.length}</Text>
            <Text style={styles.kpiLabel}>Orders Placed</Text>
            <Text style={styles.kpiSub}>{completedOrdersCount} collected</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Users size={20} color="#7C3AED" />
            <Text style={styles.kpiVal}>{usersCount}</Text>
            <Text style={styles.kpiLabel}>Campus Users</Text>
            <Text style={styles.kpiSub}>Students, Faculty, Staff</Text>
          </Card>
        </View>

        {/* Administration Modules Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GOVERNANCE MODULES</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CampusManagementScreen')}
            style={styles.moduleCard}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Building2 size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>Campus & Canteen Management</Text>
              <Text style={styles.moduleDesc}>
                Configure buildings, floor points, faculty-only restrictions, and operator assignments.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('UserManagementScreen')}
            style={styles.moduleCard}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Users size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>User Roles & Account Controls</Text>
              <Text style={styles.moduleDesc}>
                Assign roles (student, faculty, operator, admin) and enable/disable accounts.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SystemSettingsScreen')}
            style={styles.moduleCard}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Settings size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>Policy & Pickup Slot Settings</Text>
              <Text style={styles.moduleDesc}>
                Configure preorder grace periods, policy texts, versioning, and university details.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AuditLogsScreen')}
            style={styles.moduleCard}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#FEF2F2' }]}>
              <ShieldAlert size={22} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>Security & Audit Logs</Text>
              <Text style={styles.moduleDesc}>
                Review tamper-evident logs for orders, status transitions, role edits, and token verifications.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Canteen Status List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CANTEEN NETWORK STATUS</Text>
          <Card style={styles.canteenListCard}>
            {canteens.map((c) => (
              <View key={c.canteenId} style={styles.canteenRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.canteenRowName}>{c.name}</Text>
                  <Text style={styles.canteenRowLoc}>
                    {c.buildingName} • Floor {c.floor} •{' '}
                    <Text style={{ fontWeight: '700' }}>{c.canteenType.replace('_', ' ')}</Text>
                  </Text>
                </View>
                <Badge
                  label={c.isOpen ? 'OPEN' : 'CLOSED'}
                  variant={c.isOpen ? 'success' : 'danger'}
                  size="sm"
                />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Role Switcher Modal */}
      <DemoRoleSwitcherModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
      />
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
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    padding: Spacing.md,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  kpiSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 12,
    ...Shadows.sm,
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  moduleDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  canteenListCard: {
    padding: Spacing.md,
    gap: 10,
  },
  canteenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  canteenRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  canteenRowLoc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

