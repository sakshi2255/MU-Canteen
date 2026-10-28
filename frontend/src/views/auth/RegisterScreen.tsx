import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User, Mail, Lock, GraduationCap, ChevronLeft } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../models/user';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in your name, university email, and password.');
      return;
    }
    setIsLoading(true);
    try {
      await register(email.trim(), password.trim(), name.trim(), role);
      Alert.alert('Registration Complete', 'Welcome to MU Canteen!');
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Could not register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Register Account"
        subtitle="Create your campus dining profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Input
            label="Full Name"
            placeholder="e.g. Sakshi Patel"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={16} color={Colors.textMuted} />}
          />

          <Input
            label="University Email"
            placeholder="name@marwadiuniversity.ac.in"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={16} color={Colors.textMuted} />}
          />

          <Input
            label="Enrollment / Roll Number"
            placeholder="e.g. 200050123"
            value={rollNumber}
            onChangeText={setRollNumber}
            leftIcon={<GraduationCap size={16} color={Colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={16} color={Colors.textMuted} />}
          />

          <Text style={styles.roleLabel}>I AM A:</Text>
          <View style={styles.roleRow}>
            {(['student', 'faculty'] as UserRole[]).map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.roleChip, isSelected && styles.roleChipSelected]}
                >
                  <Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={isLoading ? 'Creating Profile...' : 'Complete Registration'}
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleRegister}
            style={{ marginTop: 16 }}
          />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </Card>
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
    padding: Spacing.lg,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextSelected: {
    color: Colors.primaryDark,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

