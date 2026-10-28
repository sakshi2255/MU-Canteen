import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Store, Building2, Plus, Edit2, Lock, Check } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { Canteen, CanteenType } from '../../models/campus';

interface CampusManagementScreenProps {
  navigation: any;
}

export const CampusManagementScreen: React.FC<CampusManagementScreenProps> = ({ navigation }) => {
  const { canteens, buildings, refreshCampus } = useCampus();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCanteen, setEditingCanteen] = useState<Partial<Canteen> | null>(null);

  const handleToggleOpen = async (canteenId: string, current: boolean) => {
    await ServiceProvider.canteens.toggleCanteenOpen(canteenId, !current);
    refreshCampus();
  };

  const handleOpenEdit = (canteen: Canteen) => {
    setEditingCanteen({ ...canteen });
    setEditModalVisible(true);
  };

  const handleOpenAdd = () => {
    setEditingCanteen({
      name: '',
      buildingId: 'bldg-main',
      buildingName: 'Main Academic Building',
      floor: 1,
      canteenType: 'standard',
      isOpen: true,
      operatorIds: ['demo-operator-1'],
      acceptanceMode: 'manual',
      acceptanceTimeoutMinutes: 5,
      isActive: true,
      description: '',
      allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    });
    setEditModalVisible(true);
  };

  const handleSaveCanteen = async () => {
    if (!editingCanteen?.name?.trim()) {
      alert('Please enter a canteen name.');
      return;
    }

    const canteenToSave: Canteen = {
      canteenId: editingCanteen.canteenId || `canteen_${Date.now()}`,
      name: editingCanteen.name.trim(),
      buildingId: editingCanteen.buildingId || 'bldg-main',
      buildingName: editingCanteen.buildingName || 'Main Academic Building',
      floor: Number(editingCanteen.floor) || 1,
      canteenType: (editingCanteen.canteenType as CanteenType) || 'standard',
      isOpen: editingCanteen.isOpen ?? true,
      operatorIds: editingCanteen.operatorIds || ['demo-operator-1'],
      acceptanceMode: editingCanteen.acceptanceMode || 'manual',
      acceptanceTimeoutMinutes: Number(editingCanteen.acceptanceTimeoutMinutes) || 5,
      isActive: true,
      description: editingCanteen.description || '',
      allowedRoles:
        editingCanteen.canteenType === 'faculty_only'
          ? ['faculty', 'operator', 'admin']
          : ['student', 'faculty', 'operator', 'admin'],
      specialEligibilityNotice:
        editingCanteen.canteenType === 'faculty_only'
          ? 'Reserved exclusively for MU Faculty & Staff.'
          : editingCanteen.canteenType === 'hostel_mess'
          ? 'Hostel resident pass required.'
          : undefined,
      createdAt: editingCanteen.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ServiceProvider.canteens.updateCanteen(canteenToSave);
    setEditModalVisible(false);
    setEditingCanteen(null);
    refreshCampus();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Campus & Canteens"
        subtitle="Manage Buildings, Outlets & Access Rules"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleOpenAdd} style={styles.addBtn}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Canteen</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={canteens}
        keyExtractor={(item) => item.canteenId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.canteenName}>{item.name}</Text>
                  {item.canteenType === 'faculty_only' && (
                    <View style={styles.facultyTag}>
                      <Lock size={10} color="#2563EB" />
                      <Text style={styles.facultyTagText}>Faculty Only</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locText}>
                  {item.buildingName} • Floor {item.floor}
                </Text>
              </View>

              <Switch
                value={item.isOpen}
                onValueChange={() => handleToggleOpen(item.canteenId, item.isOpen)}
                trackColor={{ false: '#CBD5E1', true: Colors.successBorder }}
                thumbColor={item.isOpen ? Colors.success : '#94A3B8'}
              />
            </View>

            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.footerRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaText}>
                  Type: <Text style={{ fontWeight: '700' }}>{item.canteenType.toUpperCase()}</Text>
                </Text>
                <Text style={styles.metaText}>
                  Acceptance: <Text style={{ fontWeight: '700' }}>{item.acceptanceMode.toUpperCase()}</Text>
                </Text>
              </View>

              <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.editBtn}>
                <Edit2 size={14} color={Colors.primary} />
                <Text style={styles.editText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Canteen Config Modal */}
      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={editingCanteen?.canteenId ? 'CONFIGURE CANTEEN' : 'ADD NEW CANTEEN'}
      >
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          <Input
            label="Canteen Name"
            placeholder="e.g. Skyline Rooftop Cafe"
            value={editingCanteen?.name || ''}
            onChangeText={(text) => setEditingCanteen((prev) => ({ ...prev, name: text }))}
          />

          <Input
            label="Building Name"
            placeholder="e.g. Main Academic Building"
            value={editingCanteen?.buildingName || ''}
            onChangeText={(text) => setEditingCanteen((prev) => ({ ...prev, buildingName: text }))}
          />

          <Input
            label="Floor Number"
            placeholder="e.g. 1, 2, 3, 4, 5, 6"
            keyboardType="numeric"
            value={editingCanteen?.floor ? String(editingCanteen.floor) : '1'}
            onChangeText={(text) => setEditingCanteen((prev) => ({ ...prev, floor: Number(text) || 1 }))}
          />

          <Input
            label="Description"
            placeholder="Short overview of foods served"
            value={editingCanteen?.description || ''}
            onChangeText={(text) => setEditingCanteen((prev) => ({ ...prev, description: text }))}
          />

          {/* Canteen Type Selector */}
          <Text style={styles.pickerLabel}>CANTEEN TYPE & ROLE ACCESS</Text>
          <View style={styles.typeOptionsRow}>
            {(['standard', 'faculty_only', 'stationery_cafe', 'hostel_mess'] as CanteenType[]).map((t) => {
              const isSelected = editingCanteen?.canteenType === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setEditingCanteen((prev) => ({ ...prev, canteenType: t }))}
                  style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                >
                  <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                    {t.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Acceptance Mode */}
          <Text style={styles.pickerLabel}>ORDER ACCEPTANCE MODE</Text>
          <View style={styles.typeOptionsRow}>
            {(['manual', 'auto'] as const).map((m) => {
              const isSelected = editingCanteen?.acceptanceMode === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setEditingCanteen((prev) => ({ ...prev, acceptanceMode: m }))}
                  style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                >
                  <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                    {m === 'auto' ? 'AUTOMATIC ACCEPT' : 'MANUAL OPERATOR REVIEW'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setEditModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Canteen"
              variant="primary"
              onPress={handleSaveCanteen}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  canteenName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  facultyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  facultyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  locText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  metaCol: {
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  typeOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
  },
});

