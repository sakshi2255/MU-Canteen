import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart3, TrendingUp, AlertCircle, ShoppingBag, PieChart } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { Order } from '../../models/order';
import { formatINR } from '../../utils/formatters';

interface OperatorReportsScreenProps {
  route: any;
  navigation: any;
}

export const OperatorReportsScreen: React.FC<OperatorReportsScreenProps> = ({
  route,
  navigation,
}) => {
  const { canteenId } = route.params || {};
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (canteenId) {
      ServiceProvider.orders.getOrders(canteenId).then((res) => setOrders(res));
    }
  }, [canteenId]);

  const totalOrders = orders.length;
  const instantOrders = orders.filter((o) => o.orderType === 'instant').length;
  const preorderOrders = orders.filter((o) => o.orderType === 'preorder').length;

  const completedOrders = orders.filter((o) => o.orderStatus === 'picked_up').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;
  const rejectedOrders = orders.filter((o) => o.orderStatus === 'rejected').length;

  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'picked_up' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  // Calculate top items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.itemsSnapshot.forEach((i) => {
      if (!itemCounts[i.name]) {
        itemCounts[i.name] = { name: i.name, count: 0, revenue: 0 };
      }
      itemCounts[i.name].count += i.quantity;
      itemCounts[i.name].revenue += i.subtotal;
    });
  });

  const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count);

  return (
    <View style={styles.container}>
      <Header
        title="Canteen Performance"
        subtitle="Review 1 Operational Reports"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Labelled Simulation Notice */}
        <View style={styles.simNotice}>
          <AlertCircle size={16} color={Colors.primary} />
          <Text style={styles.simNoticeText}>
            Simulated Data Notice: Financial metrics are calculated from Review 1 test transactions. Real payment gateway reconciliation arrives in Review 2.
          </Text>
        </View>

        {/* Revenue Card */}
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL RECORDED REVENUE</Text>
          <Text style={styles.kpiVal}>{formatINR(totalRevenue)}</Text>
          <Text style={styles.kpiSub}>From {completedOrders} completed student orders</Text>
        </Card>

        {/* Orders by Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDERS BY CHANNEL</Text>
          <View style={styles.twoColRow}>
            <Card style={styles.colCard}>
              <Text style={styles.colNum}>{instantOrders}</Text>
              <Text style={styles.colLabel}>Instant Orders</Text>
              <Text style={styles.colSub}>Immediate counter pickup</Text>
            </Card>

            <Card style={styles.colCard}>
              <Text style={styles.colNum}>{preorderOrders}</Text>
              <Text style={styles.colLabel}>Preorders</Text>
              <Text style={styles.colSub}>Scheduled break slots</Text>
            </Card>
          </View>
        </View>

        {/* Orders by Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS BREAKDOWN</Text>
          <Card style={styles.statusBreakdownCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Completed / Picked Up</Text>
              <Text style={[styles.statVal, { color: Colors.success }]}>{completedOrders}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cancelled (Prior to prep)</Text>
              <Text style={[styles.statVal, { color: Colors.danger }]}>{cancelledOrders}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Rejected by Kitchen</Text>
              <Text style={[styles.statVal, { color: Colors.danger }]}>{rejectedOrders}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Processed</Text>
              <Text style={[styles.statVal, { fontWeight: '800' }]}>{totalOrders}</Text>
            </View>
          </Card>
        </View>

        {/* Top Selling Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP SELLING MENU ITEMS</Text>
          <Card style={styles.topItemsCard}>
            {topItems.length === 0 ? (
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>No order items yet.</Text>
            ) : (
              topItems.map((item, idx) => (
                <View key={idx} style={styles.topItemRow}>
                  <Text style={styles.topRank}>#{idx + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topName}>{item.name}</Text>
                    <Text style={styles.topSub}>{item.count} orders placed</Text>
                  </View>
                  <Text style={styles.topRevenue}>{formatINR(item.revenue)}</Text>
                </View>
              ))
            )}
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  simNotice: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 8,
    marginVertical: Spacing.md,
  },
  simNoticeText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  kpiCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  kpiVal: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  colNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  colLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  colSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBreakdownCard: {
    padding: Spacing.md,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topItemsCard: {
    padding: Spacing.md,
    gap: 10,
  },
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRank: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    width: 28,
  },
  topName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  topRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

