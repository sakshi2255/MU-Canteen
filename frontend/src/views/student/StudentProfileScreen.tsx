import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, Mail, GraduationCap, Building2, LogOut, ArrowRightLeft, Shield } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DemoRoleSwitcherModal } from '../../components/common/DemoRoleSwitcherModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface StudentProfileScreenProps {
  navigation: any;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ navigation }) => {
  const { user, role, logout } = useAuth();
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Header
        title="Student Profile"
        subtitle="Marwadi University Portal Identity"
        onRoleSwitchPress={() => setRoleModalVisible(true)}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={36} color={Colors.primary} />
          </View>
          <Text style={styles.name}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{role.toUpperCase()}</Text>
          </View>
        </Card>

        {/* Academic Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACADEMIC INFORMATION</Text>
          <Card style={styles.card}>
            <View style={styles.infoRow}>
              <GraduationCap size={18} color={Colors.primary} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Department / Program</Text>
                <Text style={styles.infoVal}>{user?.department || 'Computer Engineering'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Building2 size={18} color={Colors.primary} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Roll / Enrollment Number</Text>
                <Text style={styles.infoVal}>{user?.rollNumber || '200050123'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Shield size={18} color={Colors.primary} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Campus Account Status</Text>
                <Text style={[styles.infoVal, { color: Colors.success }]}>Active / Registered</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Demo Switcher Quick Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVALUATION TOOLS</Text>
          <Button
            title="Switch Demo Role (Student / Operator / Admin)"
            variant="outline"
            icon={<ArrowRightLeft size={16} color={Colors.primary} />}
            onPress={() => setRoleModalVisible(true)}
            style={{ marginBottom: 10 }}
          />

          <Button
            title="Sign Out"
            variant="danger"
            icon={<LogOut size={16} color="#FFFFFF" />}
            onPress={logout}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
  profileCard: {
    alignItems: 'center',
    marginVertical: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
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
  card: {
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
});

