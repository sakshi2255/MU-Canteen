import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  GraduationCap,
  Store,
  ShieldCheck,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../models/user';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('student@marwadiuniversity.ac.in');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err: any) {
      Alert.alert(
        'Sign In Notice',
        `${err.message || 'Authentication error'}. Would you like to log in as a Student to test the app?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue as Student',
            onPress: () => switchDemoRole('student'),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      await switchDemoRole(targetRole);
    } catch (err: any) {
      Alert.alert('Role Switch Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* University Teal Top Hero Header */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>MU</Text>
        </View>
        <Text style={styles.heroTitle}>MARWADI UNIVERSITY</Text>
        <Text style={styles.heroSub}>Central Campus Canteen Ordering Portal</Text>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.loginCardTitle}>Sign In to Account</Text>
        <Text style={styles.loginCardSub}>Enter your university portal credentials</Text>

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
          label="Password"
          placeholder="•••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={16} color={Colors.textMuted} />}
        />

        <View style={styles.forgotRow}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={handleLogin}
          style={styles.loginBtn}
        />

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>New student on campus? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Instant Demo Role Selector */}
      <View style={styles.demoSection}>
        <View style={styles.demoHeaderRow}>
          <Sparkles size={16} color={Colors.primary} />
          <Text style={styles.demoSectionTitle}>EVALUATION: ONE-TAP DEMO ACCESS</Text>
        </View>
        <Text style={styles.demoSectionSub}>
          Tap any role below to enter and test all dashboards and ordering workflows immediately:
        </Text>

        <View style={styles.demoGrid}>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => handleQuickRole('student')}
          >
            <GraduationCap size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoPillTitle}>Student (Sakshi)</Text>
              <Text style={styles.demoPillSub}>Browse, Preorder & Cart</Text>
            </View>
            <ArrowRight size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => handleQuickRole('operator')}
          >
            <Store size={18} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoPillTitle}>Operator (Ramesh)</Text>
              <Text style={styles.demoPillSub}>Kitchen Queue & Handover</Text>
            </View>
            <ArrowRight size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => handleQuickRole('faculty')}
          >
            <Briefcase size={18} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoPillTitle}>Faculty (Sharma)</Text>
              <Text style={styles.demoPillSub}>Faculty Lounge Access</Text>
            </View>
            <ArrowRight size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => handleQuickRole('admin')}
          >
            <ShieldCheck size={18} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoPillTitle}>Administrator</Text>
              <Text style={styles.demoPillSub}>Campus Settings & Audit</Text>
            </View>
            <ArrowRight size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 55,
    paddingBottom: 34,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.sm,
  },
  logoBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 3,
  },
  formCard: {
    marginHorizontal: Spacing.base,
    marginTop: -18,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  loginCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loginCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  loginBtn: {
    marginBottom: Spacing.md,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  demoSection: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  demoSectionSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 15,
  },
  demoGrid: {
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 10,
    gap: 10,
  },
  demoPillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  demoPillSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
