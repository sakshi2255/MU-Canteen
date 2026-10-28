import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Settings, Save, ShieldCheck, Info } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { CampusSettings } from '../../models/settings';

interface SystemSettingsScreenProps {
  navigation: any;
}

export const SystemSettingsScreen: React.FC<SystemSettingsScreenProps> = ({ navigation }) => {
  const currentSettings = ServiceProvider.settings.getSettings();
  const [campusName, setCampusName] = useState(currentSettings.campusName);
  const [gracePeriod, setGracePeriod] = useState(String(currentSettings.preorderGracePeriodMinutes));
  const [policyVersion, setPolicyVersion] = useState(currentSettings.preorderPolicyVersion);
  const [policyText, setPolicyText] = useState(currentSettings.preorderPolicyText);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ServiceProvider.settings.updateSettings({
        campusName,
        preorderGracePeriodMinutes: Number(gracePeriod) || 10,
        preorderPolicyVersion: policyVersion,
        preorderPolicyText: policyText,
      });
      Alert.alert('Settings Updated', 'Campus configuration has been saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Campus Settings"
        subtitle="Policy Defaults & Institution Branding"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>CAMPUS IDENTITY</Text>
          <Input
            label="Institution Display Name"
            value={campusName}
            onChangeText={setCampusName}
          />

          <Text style={styles.sectionHeader}>PREORDER & GRACE PERIOD RULES</Text>
          <Input
            label="Default Grace Period (Minutes)"
            value={gracePeriod}
            onChangeText={setGracePeriod}
            keyboardType="numeric"
          />

          <Input
            label="Active Policy Version"
            value={policyVersion}
            onChangeText={setPolicyVersion}
          />

          <Input
            label="Preorder Policy Text"
            value={policyText}
            onChangeText={setPolicyText}
            multiline
            numberOfLines={5}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <View style={styles.noticeBox}>
            <Info size={16} color={Colors.primary} />
            <Text style={styles.noticeText}>
              All policy changes take effect immediately on student preorder checkout modals and are recorded with version stamps in order records.
            </Text>
          </View>

          <Button
            title={isSaving ? 'Saving...' : 'Save Settings'}
            variant="primary"
            size="lg"
            loading={isSaving}
            onPress={handleSave}
            icon={<Save size={16} color="#FFFFFF" />}
            style={{ marginTop: 12 }}
          />
        </Card>

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
    padding: Spacing.base,
  },
  card: {
    padding: Spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 8,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 8,
    marginVertical: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
});

