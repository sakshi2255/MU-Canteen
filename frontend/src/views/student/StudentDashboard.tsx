import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  Store,
  Clock,
  MapPin,
  ChevronRight,
  ShoppingBag,
  Lock,
  Building2,
  Layers,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DemoRoleSwitcherModal } from '../../components/common/DemoRoleSwitcherModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ServiceProvider } from '../../services/serviceProvider';
import { demoStorage } from '../../services/demo/demoStorage';
import { Canteen } from '../../models/campus';
import { Order } from '../../models/order';

interface StudentDashboardProps {
  navigation: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigation }) => {
  const { user, role } = useAuth();
  const { canteens } = useCampus();
  const { itemCount } = useCart();

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const list = await ServiceProvider.orders.getOrders(undefined, user?.uid);
      const active = list.filter((o) =>
        ['awaiting_acceptance', 'accepted', 'preparing', 'ready_for_pickup'].includes(o.orderStatus)
      );
      setActiveOrders(active);
    } catch {
      // Safe fallback
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = demoStorage.subscribe(() => {
      loadOrders();
    });
    return () => unsub();
  }, [user?.uid]);

  // Tier 1 Buildings defined by user specification
  const buildingOptions = [
    { key: 'all', label: 'All Buildings', matchId: null },
    { key: 'main', label: 'Main Building', matchId: 'bldg-main' },
    { key: 'law', label: 'Law Building', matchId: 'bldg-law' },
    { key: 'hostel', label: 'Hostel Mess', matchId: 'bldg-hostel' },
  ];

  // Tier 2 Floors dynamically based on building
  const getFloorOptions = () => {
    if (selectedBuilding === 'law' || selectedBuilding === 'hostel') {
      return [
        { label: 'All Floors', val: null },
        { label: 'Floor 1', val: 1 },
      ];
    }
    return [
      { label: 'All Floors', val: null },
      { label: 'Floor 1', val: 1 },
      { label: 'Floor 2', val: 2 },
      { label: 'Floor 3', val: 3 },
      { label: 'Floor 4', val: 4 },
      { label: 'Floor 5', val: 5 },
      { label: 'Floor 6', val: 6 },
    ];
  };

  // Filter canteens dynamically
  const filteredCanteens = canteens.filter((c) => {
    if (!c.isActive) return false;

    // Building filter
    if (selectedBuilding !== 'all') {
      const bOption = buildingOptions.find((b) => b.key === selectedBuilding);
      if (bOption?.matchId && c.buildingId !== bOption.matchId) {
        return false;
      }
    }

    // Floor filter
    if (selectedFloor !== null && c.floor !== selectedFloor) {
      return false;
    }

    // Search filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchBldg = c.buildingName.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchName && !matchBldg && !matchDesc) return false;
    }

    return true;
  });

  const handleCanteenPress = (canteen: Canteen) => {
    const isRestricted =
      canteen.canteenType === 'faculty_only' && role !== 'faculty' && role !== 'admin';

    if (isRestricted) {
      alert(canteen.specialEligibilityNotice || 'This canteen is reserved for Faculty and Staff only.');
      return;
    }
    navigation.navigate('MenuScreen', { canteenId: canteen.canteenId });
  };

  return (
    <View style={styles.container}>
      <Header
        title="MU Canteen"
        subtitle="Marwadi University Central Food Ordering"
        onRoleSwitchPress={() => setRoleModalVisible(true)}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('CartScreen')}
            style={styles.cartHeaderBtn}
          >
            <ShoppingBag size={18} color="#FFFFFF" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* University Greeting Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.greetingTitle}>
            Hello, <Text style={styles.greetingName}>{user?.displayName?.toUpperCase() || 'STUDENT'}</Text>
          </Text>
          <Text style={styles.greetingSub}>
            {user?.department || 'Computer Engineering'} {user?.semester ? `• Sem ${user.semester}` : ''}
          </Text>
          <Text style={styles.sessionNotice}>
            Academic Session 2026 • Rajkot Campus
          </Text>
        </View>

        {/* Active Order Live Banner if any */}
        {activeOrders.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('OrderTrackingScreen', { orderId: activeOrders[0].orderId })}
            style={styles.activeOrderBanner}
          >
            <View style={styles.activeOrderHeader}>
              <View style={styles.liveIndicatorRow}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveOrderTag}>LIVE ORDER</Text>
              </View>
              <Text style={styles.orderNumberText}>{activeOrders[0].orderNumber}</Text>
            </View>
            <Text style={styles.activeOrderCanteen}>{activeOrders[0].canteenName}</Text>
            <View style={styles.activeOrderFooter}>
              <Text style={styles.statusCurrentText}>
                Status: <Text style={{ fontWeight: '700', color: Colors.primaryDark }}>
                  {activeOrders[0].orderStatus.toUpperCase().replace('_', ' ')}
                </Text>
              </Text>
              <View style={styles.trackAction}>
                <Text style={styles.trackActionText}>Track Live</Text>
                <ChevronRight size={14} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Clean University Search Box */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search canteen or food item..."
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchBtn}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
            <View style={styles.searchSubmitBtn}>
              <Text style={styles.searchSubmitText}>SEARCH</Text>
            </View>
          </View>
        </View>

        {/* Tier 1 Filter: Buildings */}
        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <Building2 size={14} color={Colors.primary} />
            <Text style={styles.filterSectionTitle}>CAMPUS BUILDING</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {buildingOptions.map((b) => {
              const isSelected = selectedBuilding === b.key;
              return (
                <TouchableOpacity
                  key={b.key}
                  onPress={() => {
                    setSelectedBuilding(b.key);
                    setSelectedFloor(null); // Reset floor when building switches
                  }}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tier 2 Filter: Floors */}
        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <Layers size={14} color={Colors.textSecondary} />
            <Text style={styles.filterSectionTitle}>FLOOR SELECTION</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {getFloorOptions().map((fl) => {
              const isSelected = selectedFloor === fl.val;
              return (
                <TouchableOpacity
                  key={fl.label}
                  onPress={() => setSelectedFloor(fl.val)}
                  style={[styles.floorChip, isSelected && styles.floorChipSelected]}
                >
                  <Text style={[styles.floorChipText, isSelected && styles.floorChipTextSelected]}>
                    {fl.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Canteen Directory List */}
        <View style={styles.canteensSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              Available Canteens ({filteredCanteens.length})
            </Text>
            {(selectedBuilding !== 'all' || selectedFloor !== null || searchText !== '') && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBuilding('all');
                  setSelectedFloor(null);
                  setSearchText('');
                }}
              >
                <Text style={styles.resetFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredCanteens.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Store size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Canteens Match Selected Filters</Text>
              <Text style={styles.emptySub}>
                Try selecting "All Buildings" or "All Floors" to view full campus offerings.
              </Text>
            </Card>
          ) : (
            filteredCanteens.map((canteen) => {
              const isFacultyOnly = canteen.canteenType === 'faculty_only';

              return (
                <Card key={canteen.canteenId} style={styles.canteenCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.canteenIconBox}>
                      <Store size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.canteenInfoCol}>
                      <View style={styles.canteenTitleRow}>
                        <Text style={styles.canteenTitle}>{canteen.name}</Text>
                        {isFacultyOnly && (
                          <View style={styles.restrictedBadge}>
                            <Lock size={10} color="#2563EB" />
                            <Text style={styles.restrictedText}>Faculty Only</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.locationRow}>
                        <MapPin size={12} color={Colors.textSecondary} />
                        <Text style={styles.locationText}>
                          {canteen.buildingName} • Floor {canteen.floor}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.canteenDesc} numberOfLines={2}>
                    {canteen.description}
                  </Text>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.statusRow}>
                      <Badge
                        label={canteen.isOpen ? 'Open Now' : 'Closed'}
                        variant={canteen.isOpen ? 'success' : 'neutral'}
                        size="sm"
                      />
                      <Text style={styles.acceptanceModeText}>
                        {canteen.acceptanceMode === 'auto' ? '⚡ Instant Confirm' : '⏱ Manual Confirm'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleCanteenPress(canteen)}
                      disabled={!canteen.isOpen}
                      style={[
                        styles.menuActionBtn,
                        !canteen.isOpen && styles.menuActionBtnDisabled,
                      ]}
                    >
                      <Text style={styles.menuActionText}>
                        {canteen.isOpen ? 'View Menu' : 'Closed'}
                      </Text>
                      <ChevronRight size={14} color={canteen.isOpen ? Colors.primary : Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
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
  cartHeaderBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.danger,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  greetingTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  greetingName: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  greetingSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sessionNotice: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  activeOrderBanner: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  liveOrderTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  orderNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activeOrderCanteen: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  activeOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CCFBF1',
  },
  statusCurrentText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trackAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchSection: {
    marginTop: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    height: 46,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  clearSearchBtn: {
    paddingHorizontal: 8,
  },
  clearSearchText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  searchSubmitBtn: {
    backgroundColor: Colors.primary,
    height: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterSection: {
    marginTop: Spacing.md,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  chipsScroll: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  floorChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floorChipSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  floorChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  floorChipTextSelected: {
    color: '#FFFFFF',
  },
  canteensSection: {
    marginTop: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resetFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  canteenCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  canteenIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  canteenInfoCol: {
    flex: 1,
  },
  canteenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  canteenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  restrictedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  restrictedText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  canteenDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptanceModeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  menuActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  menuActionBtnDisabled: {
    backgroundColor: Colors.surfaceSecondary,
  },
  menuActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
