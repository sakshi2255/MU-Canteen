import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Utensils } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { MenuItem, MenuCategory } from '../../models/menu';
import { formatINR } from '../../utils/formatters';

interface MenuManagementScreenProps {
  route: any;
  navigation: any;
}

export const MenuManagementScreen: React.FC<MenuManagementScreenProps> = ({ route, navigation }) => {
  const { canteenId } = route.params || {};
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const loadMenu = async () => {
    if (canteenId) {
      const data = await ServiceProvider.menu.getMenuItems(canteenId);
      setItems(data);
    }
  };

  useEffect(() => {
    loadMenu();
    const unsub = demoStorage.subscribe(() => {
      loadMenu();
    });
    return () => unsub();
  }, [canteenId]);

  const handleToggleAvailability = async (itemId: string, current: boolean) => {
    await ServiceProvider.menu.toggleItemAvailability(itemId, !current);
    loadMenu();
  };

  const handleOpenAdd = () => {
    setEditingItem({
      canteenId,
      name: '',
      description: '',
      category: 'snacks',
      price: 30,
      isAvailable: true,
      isActive: true,
      isVeg: true,
    });
    setEditModalVisible(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setEditModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem?.name?.trim()) {
      alert('Please enter an item name.');
      return;
    }
    const price = Number(editingItem.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price in INR.');
      return;
    }

    const itemToSave: MenuItem = {
      itemId: editingItem.itemId || `item_${Date.now()}`,
      canteenId: canteenId || 'canteen-mb-1',
      name: editingItem.name.trim(),
      description: editingItem.description || '',
      category: (editingItem.category as MenuCategory) || 'snacks',
      price,
      isAvailable: editingItem.isAvailable !== undefined ? editingItem.isAvailable : true,
      isActive: true,
      isVeg: editingItem.isVeg !== undefined ? editingItem.isVeg : true,
      createdAt: editingItem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ServiceProvider.menu.saveMenuItem(itemToSave);
    setEditModalVisible(false);
    setEditingItem(null);
    loadMenu();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Menu & Availability"
        subtitle="Manage items & stock toggles"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleOpenAdd} style={styles.addBtn}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.itemId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.vegDot, { borderColor: item.isVeg ? '#16A34A' : '#DC2626' }]}>
                    <View style={[styles.vegInner, { backgroundColor: item.isVeg ? '#16A34A' : '#DC2626' }]} />
                  </View>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.price}>
                  {formatINR(item.price)} • <Text style={styles.cat}>{item.category.replace('_', ' ')}</Text>
                </Text>
              </View>

              {/* Availability Toggle */}
              <View style={styles.controlsCol}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleAvailability(item.itemId, item.isAvailable)}
                  style={[
                    styles.availPill,
                    item.isAvailable ? styles.availOn : styles.availOff,
                  ]}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 size={12} color="#FFFFFF" />
                      <Text style={styles.availText}>AVAILABLE</Text>
                    </>
                  ) : (
                    <>
                      <XCircle size={12} color="#FFFFFF" />
                      <Text style={styles.availText}>SOLD OUT</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleOpenEdit(item)}
                  style={styles.editBtn}
                >
                  <Edit2 size={14} color={Colors.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Add / Edit Item Modal */}
      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={editingItem?.itemId ? 'EDIT MENU ITEM' : 'ADD NEW MENU ITEM'}
      >
        <View style={{ gap: 10 }}>
          <Input
            label="Item Name"
            placeholder="e.g. Masala Dosa, Cold Coffee"
            value={editingItem?.name || ''}
            onChangeText={(text) => setEditingItem((prev) => ({ ...prev, name: text }))}
          />

          <Input
            label="Description"
            placeholder="e.g. Fresh made with chutney & sambhar"
            value={editingItem?.description || ''}
            onChangeText={(text) => setEditingItem((prev) => ({ ...prev, description: text }))}
          />

          <Input
            label="Price (INR ₹)"
            placeholder="e.g. 40"
            keyboardType="numeric"
            value={editingItem?.price ? String(editingItem.price) : ''}
            onChangeText={(text) => setEditingItem((prev) => ({ ...prev, price: Number(text) || 0 }))}
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Pure Vegetarian Item</Text>
            <Switch
              value={editingItem?.isVeg ?? true}
              onValueChange={(val) => setEditingItem((prev) => ({ ...prev, isVeg: val }))}
              thumbColor={editingItem?.isVeg ? '#16A34A' : '#CBD5E1'}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Mark Initially Available</Text>
            <Switch
              value={editingItem?.isAvailable ?? true}
              onValueChange={(val) => setEditingItem((prev) => ({ ...prev, isAvailable: val }))}
              thumbColor={editingItem?.isAvailable ? Colors.primary : '#CBD5E1'}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setEditModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Item"
              variant="primary"
              onPress={handleSaveItem}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vegDot: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  cat: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  controlsCol: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 10,
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  availOn: {
    backgroundColor: Colors.success,
  },
  availOff: {
    backgroundColor: Colors.danger,
  },
  availText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

