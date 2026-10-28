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
import { ShoppingBag, ChevronRight, Plus, Minus, Check, AlertTriangle } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';
import { useCart } from '../../context/CartContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { MenuItem, MenuCategory } from '../../models/menu';
import { Canteen } from '../../models/campus';
import { formatINR } from '../../utils/formatters';

interface MenuScreenProps {
  route: any;
  navigation: any;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ route, navigation }) => {
  const { canteenId } = route.params;
  const { canteens } = useCampus();
  const { items, canteen: cartCanteen, addToCart, replaceCartWithItem, updateQuantity, itemCount, total } = useCart();

  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [conflictModalItem, setConflictModalItem] = useState<MenuItem | null>(null);

  const loadMenu = async () => {
    const c = canteens.find((item) => item.canteenId === canteenId);
    if (c) setCanteen(c);
    const m = await ServiceProvider.menu.getMenuItems(canteenId);
    setMenuItems(m);
  };

  useEffect(() => {
    loadMenu();
  }, [canteenId, canteens]);

  const categories: { label: string; val: MenuCategory }[] = [
    { label: 'All Items', val: 'all' },
    { label: 'Snacks', val: 'snacks' },
    { label: 'Beverages', val: 'beverages' },
    { label: 'Meals', val: 'meals' },
    { label: 'South Indian', val: 'south_indian' },
    { label: 'Bakery', val: 'bakery' },
    { label: 'Stationery', val: 'stationery' },
  ];

  const filteredItems = menuItems.filter((i) => {
    if (!i.isActive) return false;
    if (selectedCategory === 'all') return true;
    return i.category === selectedCategory;
  });

  const handleAddItem = (item: MenuItem) => {
    if (!canteen) return;
    if (!canteen.isOpen) {
      alert(`${canteen.name} is currently closed. New orders cannot be placed.`);
      return;
    }
    if (!item.isAvailable) {
      alert(`${item.name} is currently sold out.`);
      return;
    }

    const res = addToCart(item, canteen);
    if (res.conflict) {
      setConflictModalItem(item);
    }
  };

  const handleConfirmReplaceCart = () => {
    if (conflictModalItem && canteen) {
      replaceCartWithItem(conflictModalItem, canteen);
      setConflictModalItem(null);
    }
  };

  const getItemQuantityInCart = (itemId: string) => {
    const ci = items.find((i) => i.item.itemId === itemId);
    return ci ? ci.quantity : 0;
  };

  return (
    <View style={styles.container}>
      <Header
        title={canteen?.name || 'Menu'}
        subtitle={canteen ? `${canteen.buildingName} • Floor ${canteen.floor}` : undefined}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Canteen Status Alert Bar if closed */}
      {canteen && !canteen.isOpen && (
        <View style={styles.closedAlertBar}>
          <AlertTriangle size={16} color="#DC2626" />
          <Text style={styles.closedAlertText}>
            This canteen is currently closed. You can browse the menu, but ordering is disabled.
          </Text>
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.val;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedCategory(cat.val)}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.itemId}
        contentContainerStyle={styles.menuList}
        renderItem={({ item }) => {
          const qty = getItemQuantityInCart(item.itemId);

          return (
            <Card style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuInfoCol}>
                  <View style={styles.itemHeader}>
                    {item.isVeg ? (
                      <View style={styles.vegIndicator}>
                        <View style={styles.vegCircle} />
                      </View>
                    ) : (
                      <View style={[styles.vegIndicator, { borderColor: '#DC2626' }]}>
                        <View style={[styles.vegCircle, { backgroundColor: '#DC2626' }]} />
                      </View>
                    )}
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>

                  <Text style={styles.itemDesc}>{item.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatINR(item.price)}</Text>
                    {!item.isAvailable && (
                      <Badge label="SOLD OUT" variant="danger" size="sm" />
                    )}
                  </View>
                </View>

                {/* Add / Quantity Counter */}
                <View style={styles.actionCol}>
                  {!item.isAvailable ? (
                    <View style={styles.soldOutBtn}>
                      <Text style={styles.soldOutBtnText}>Sold Out</Text>
                    </View>
                  ) : qty > 0 ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.itemId, -1)}
                        style={styles.qtyBtn}
                      >
                        <Minus size={14} color={Colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.itemId, 1)}
                        style={styles.qtyBtn}
                      >
                        <Plus size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Button
                      title="ADD +"
                      variant="outline"
                      size="sm"
                      onPress={() => handleAddItem(item)}
                      style={styles.addBtn}
                    />
                  )}
                </View>
              </View>
            </Card>
          );
        }}
      />

      {/* Sticky Bottom Cart Bar */}
      {itemCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartBarInfo}>
            <Text style={styles.cartBarCount}>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</Text>
            <Text style={styles.cartBarTotal}>{formatINR(total)}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CartScreen')}
            style={styles.viewCartBtn}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Different Canteen Conflict Modal */}
      <Modal
        visible={Boolean(conflictModalItem)}
        onClose={() => setConflictModalItem(null)}
        title="CHANGE CANTEEN?"
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.textPrimary, lineHeight: 18 }}>
            Your cart currently contains items from{' '}
            <Text style={{ fontWeight: '700' }}>{cartCanteen?.name}</Text>. Each order must belong
            to a single canteen.
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
            Would you like to clear your current cart and start an order from{' '}
            <Text style={{ fontWeight: '700', color: Colors.primary }}>{canteen?.name}</Text>?
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setConflictModalItem(null)}
              style={{ flex: 1 }}
            />
            <Button
              title="Replace Cart"
              variant="primary"
              onPress={handleConfirmReplaceCart}
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
  closedAlertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  closedAlertText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
  },
  categoryBar: {
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  menuList: {
    padding: Spacing.base,
    paddingBottom: 90,
    gap: Spacing.md,
  },
  menuCard: {
    padding: Spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  vegCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  soldOutBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  soldOutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  qtyBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    paddingHorizontal: 8,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.charcoal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Shadows.md,
  },
  cartBarInfo: {
    gap: 2,
  },
  cartBarCount: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cartBarTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

