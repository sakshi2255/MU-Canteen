import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Store,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  TrendingUp,
  QrCode,
  ListOrdered,
  Utensils,
  BarChart3,
  AlertTriangle,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CompactNavGrid, NavCardItem } from '../../components/common/CompactNavGrid';
import { DemoRoleSwitcherModal } from '../../components/common/DemoRoleSwitcherModal';
import { CanteenOpenCloseModal } from './CanteenOpenCloseModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Canteen } from '../../models/campus';
import { Order } from '../../models/order';
import { formatINR } from '../../utils/formatters';

interface OperatorDashboardProps {
  navigation: any;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { canteens, refreshCampus } = useCampus();

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);

  // Find assigned canteens for this operator
  const assignedCanteens = canteens.filter((c) =>
    user?.assignedCanteenIds?.length ? user.assignedCanteenIds.includes(c.canteenId) : true
  );

  const currentCanteen =
    assignedCanteens.find((c) => c.canteenId === selectedCanteenId) ||
    assignedCanteens[0] ||
    canteens[0];

  useEffect(() => {
    if (currentCanteen && !selectedCanteenId) {
      setSelectedCanteenId(currentCanteen.canteenId);
    }
  }, [currentCanteen]);

  const loadOrders = async () => {
    if (currentCanteen) {
      const list = await ServiceProvider.orders.getOrders(currentCanteen.canteenId);
      setOrders(list);
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = demoStorage.subscribe(() => {
      loadOrders();
      refreshCampus();
    });
    return () => unsub();
  }, [currentCanteen?.canteenId]);

  // Metric counts
  const awaitingCount = orders.filter((o) => o.orderStatus === 'awaiting_acceptance').length;
  const acceptedCount = orders.filter((o) => o.orderStatus === 'accepted').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'preparing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready_for_pickup').length;
  const completedCount = orders.filter((o) => o.orderStatus === 'picked_up').length;

  const totalSales = orders
    .filter((o) => o.orderStatus === 'picked_up' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const handleToggleOpen = async (val: boolean) => {
    if (!currentCanteen) return;
    if (val) {
      // Opening: Prompt menu availability checklist!
      setOpenModalVisible(true);
    } else {
      // Closing: direct confirm
      await ServiceProvider.canteens.toggleCanteenOpen(currentCanteen.canteenId, false);
      refreshCampus();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Operator Console"
        subtitle={currentCanteen ? `${currentCanteen.name}` : 'Canteen Operator'}
        onRoleSwitchPress={() => setRoleModalVisible(true)}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Multi-canteen Tab Switcher if assigned to multiple */}
        {assignedCanteens.length > 1 && (
          <View style={styles.canteenSelectorRow}>
            {assignedCanteens.map((c) => {
              const isSelected = c.canteenId === currentCanteen?.canteenId;
              return (
                <TouchableOpacity
                  key={c.canteenId}
                  onPress={() => setSelectedCanteenId(c.canteenId)}
                  style={[styles.canteenTab, isSelected && styles.canteenTabSelected]}
                >
                  <Text style={[styles.canteenTabText, isSelected && styles.canteenTabTextSelected]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Canteen Live Status Card */}
        {currentCanteen && (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.statusInfoCol}>
                <Text style={styles.canteenFullName}>{currentCanteen.name}</Text>
                <Text style={styles.canteenLocText}>
                  {currentCanteen.buildingName} • Floor {currentCanteen.floor}
                </Text>
              </View>
              <View style={styles.switchCol}>
                <Text
                  style={[
                    styles.openSwitchLabel,
                    { color: currentCanteen.isOpen ? Colors.success : Colors.danger },
                  ]}
                >
                  {currentCanteen.isOpen ? 'OPEN' : 'CLOSED'}
                </Text>
                <Switch
                  value={currentCanteen.isOpen}
                  onValueChange={handleToggleOpen}
                  trackColor={{ false: '#CBD5E1', true: Colors.successBorder }}
                  thumbColor={currentCanteen.isOpen ? Colors.success : '#94A3B8'}
                />
              </View>
            </View>

            <View style={styles.statusFooterRow}>
              <Text style={styles.acceptanceRuleText}>
                Acceptance Mode:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {currentCanteen.acceptanceMode === 'auto' ? 'Auto-Accept' : 'Manual Review'}
                </Text>
              </Text>
              <Badge
                label={currentCanteen.isOpen ? 'Accepting Orders' : 'Ordering Disabled'}
                variant={currentCanteen.isOpen ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
          </Card>
        )}

        {/* Canteen Navigation Cards - Marwadi University Style */}
        <CompactNavGrid
          title="Operator Actions"
          items={[
            {
              id: 'queue',
              label: 'Order Queue',
              subtitle: `${orders.length} Orders Today`,
              icon: <ListOrdered size={18} color={Colors.primary} />,
              badge: awaitingCount > 0 ? `${awaitingCount} NEW` : undefined,
              badgeVariant: 'danger',
              onPress: () => navigation.navigate('OrderQueueTab', { canteenId: currentCanteen?.canteenId }),
            },
            {
              id: 'menu',
              label: 'Manage Menu',
              subtitle: 'Availability & Prices',
              icon: <Utensils size={18} color={Colors.primary} />,
              onPress: () => navigation.navigate('MenuManagementTab', { canteenId: currentCanteen?.canteenId }),
            },
            {
              id: 'availability',
              label: 'Canteen Availability',
              subtitle: currentCanteen?.isOpen ? 'Currently Open' : 'Currently Closed',
              icon: <Store size={18} color={Colors.primary} />,
              badge: currentCanteen?.isOpen ? 'OPEN' : 'CLOSED',
              badgeVariant: currentCanteen?.isOpen ? 'success' : 'warning',
              onPress: () => setOpenModalVisible(true),
            },
            {
              id: 'verify',
              label: 'Pickup Verification',
              subtitle: 'Scan Student Token',
              icon: <QrCode size={18} color={Colors.primary} />,
              badge: readyCount > 0 ? `${readyCount} Ready` : undefined,
              badgeVariant: 'warning',
              onPress: () => navigation.navigate('PickupVerificationTab', { canteenId: currentCanteen?.canteenId }),
            },
            {
              id: 'reports',
              label: 'Reports & Analytics',
              subtitle: 'Daily Sales & Items',
              icon: <BarChart3 size={18} color={Colors.primary} />,
              onPress: () => navigation.navigate('OperatorReportsScreen', { canteenId: currentCanteen?.canteenId }),
            },
          ]}
        />

        {/* Real-time Order Pipeline Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S ORDER PIPELINE</Text>
          <View style={styles.metricsRow}>
            <View style={[styles.metricBox, awaitingCount > 0 && styles.metricBoxHighlight]}>
              <Clock size={16} color={awaitingCount > 0 ? '#B45309' : Colors.textSecondary} />
              <Text style={styles.metricVal}>{awaitingCount}</Text>
              <Text style={styles.metricLabel}>Awaiting</Text>
            </View>

            <View style={styles.metricBox}>
              <ChefHat size={16} color="#EA580C" />
              <Text style={styles.metricVal}>{preparingCount + acceptedCount}</Text>
              <Text style={styles.metricLabel}>Kitchen Prep</Text>
            </View>

            <View style={styles.metricBox}>
              <PackageCheck size={16} color={Colors.primary} />
              <Text style={styles.metricVal}>{readyCount}</Text>
              <Text style={styles.metricLabel}>Ready Pickup</Text>
            </View>

            <View style={styles.metricBox}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.metricVal}>{completedCount}</Text>
              <Text style={styles.metricLabel}>Collected</Text>
            </View>
          </View>
        </View>

        {/* Daily Simulated Sales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAILY FINANCIAL SNAPSHOT (SIMULATED)</Text>
          <Card style={styles.salesCard}>
            <View style={styles.salesRow}>
              <View>
                <Text style={styles.salesTotalLabel}>Total Recorded Sales Today</Text>
                <Text style={styles.salesTotalVal}>{formatINR(totalSales)}</Text>
                <Text style={styles.salesNotice}>Test payments from simulated UPI & Cash</Text>
              </View>
              <TrendingUp size={36} color={Colors.primary} />
            </View>
          </Card>
        </View>

        {/* Management Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CANTEEN CONTROLS</Text>
          <View style={{ gap: 8 }}>
            <Button
              title="Manage Menu & Item Availability"
              variant="outline"
              icon={<Utensils size={16} color={Colors.primary} />}
              onPress={() => navigation.navigate('MenuManagementScreen', { canteenId: currentCanteen?.canteenId })}
            />

            <Button
              title="View Detailed Reports & Top Selling Items"
              variant="secondary"
              icon={<BarChart3 size={16} color={Colors.textPrimary} />}
              onPress={() => navigation.navigate('OperatorReportsScreen', { canteenId: currentCanteen?.canteenId })}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Canteen Open Checklist Modal */}
      <CanteenOpenCloseModal
        visible={openModalVisible}
        canteen={currentCanteen}
        onClose={() => setOpenModalVisible(false)}
        onConfirmOpen={() => {
          setOpenModalVisible(false);
          refreshCampus();
        }}
      />

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
  canteenSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  canteenTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  canteenTabSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  canteenTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  canteenTabTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  statusCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusInfoCol: {
    flex: 1,
  },
  canteenFullName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  canteenLocText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switchCol: {
    alignItems: 'center',
  },
  openSwitchLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  acceptanceRuleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: Spacing.md,
  },
  actionTile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  actionTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTileBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionTileBadgeText: {
    color: Colors.danger,
    fontSize: 9,
    fontWeight: '800',
  },
  actionTileTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionTileSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  metricBoxHighlight: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  salesCard: {
    padding: Spacing.md,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salesTotalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  salesTotalVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  salesNotice: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

