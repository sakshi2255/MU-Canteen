import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Store, MapPin, ChevronRight, Lock } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { Canteen } from '../../models/campus';

interface CanteenDirectoryScreenProps {
  navigation: any;
}

export const CanteenDirectoryScreen: React.FC<CanteenDirectoryScreenProps> = ({ navigation }) => {
  const { filteredCanteens } = useCampus();
  const { role } = useAuth();

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
        title="Campus Canteens"
        subtitle="All Marwadi University Food Outlets"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={filteredCanteens}
        keyExtractor={(item) => item.canteenId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isFacultyOnly = item.canteenType === 'faculty_only';
          const isRestricted = isFacultyOnly && role !== 'faculty' && role !== 'admin';

          return (
            <Card
              onPress={() => handleCanteenPress(item)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Store size={22} color={Colors.primary} />
                </View>
                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    {isFacultyOnly && (
                      <View style={styles.facultyTag}>
                        <Lock size={10} color="#2563EB" />
                        <Text style={styles.facultyTagText}>Faculty Only</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.locRow}>
                    <MapPin size={12} color={Colors.textSecondary} />
                    <Text style={styles.locText}>
                      {item.buildingName} • Floor {item.floor}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.descText}>{item.description}</Text>

              <View style={styles.footerRow}>
                <Badge
                  label={item.isOpen ? 'OPEN' : 'CLOSED'}
                  variant={item.isOpen ? 'success' : 'danger'}
                  size="sm"
                />
                <View style={styles.viewMenuBtn}>
                  <Text style={styles.viewMenuText}>
                    {isRestricted ? 'Restricted Access' : 'View Full Menu'}
                  </Text>
                  <ChevronRight size={14} color={Colors.primary} />
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight,
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
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  viewMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMenuText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

