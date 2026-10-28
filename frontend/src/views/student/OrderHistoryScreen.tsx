import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Clock, Store, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { Order } from '../../models/order';
import { formatINR, formatDateTime, getOrderStatusBadge, getOrderStatusLabel } from '../../utils/formatters';

interface OrderHistoryScreenProps {
  navigation: any;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      if (user?.uid) {
        const list = await ServiceProvider.orders.getOrders(undefined, user.uid);
        setOrders(list);
      }
    };
    load();
  }, [user]);

  return (
    <View style={styles.container}>
      <Header title="Your Order History" subtitle="Completed, active and past orders" />

      {orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="Your campus canteen order history will be shown here."
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const badge = getOrderStatusBadge(item.orderStatus);
            return (
              <Card
                onPress={() => navigation.navigate('OrderTrackingScreen', { orderId: item.orderId })}
                style={styles.card}
              >
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.orderNum}>{item.orderNumber}</Text>
                    <Text style={styles.timeText}>{formatDateTime(item.createdAt)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: badge.text }]}>
                      {getOrderStatusLabel(item.orderStatus)}
                    </Text>
                  </View>
                </View>

                <View style={styles.canteenRow}>
                  <Store size={14} color={Colors.primary} />
                  <Text style={styles.canteenText}>{item.canteenName}</Text>
                </View>

                <Text style={styles.itemsText} numberOfLines={1}>
                  {item.itemsSnapshot.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.totalText}>Total: {formatINR(item.total)}</Text>
                  <View style={styles.viewAction}>
                    <Text style={styles.viewActionText}>View Details & Token</Text>
                    <ChevronRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderNum: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  canteenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  canteenText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});

