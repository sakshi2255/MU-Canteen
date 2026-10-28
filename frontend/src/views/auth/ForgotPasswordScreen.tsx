import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Mail, KeyRound } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleReset = () => {
    if (!email.trim()) {
      alert('Please enter your university email.');
      return;
    }
    setIsSent(true);
    Alert.alert(
      'Password Reset Link Sent',
      `A password reset email has been dispatched to ${email}. Follow the instructions to reset your password.`
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Reset Password"
        subtitle="Account Recovery"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconBox}>
            <KeyRound size={32} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Forgot Your Password?</Text>
          <Text style={styles.desc}>
            Enter your registered Marwadi University email address to receive password reset
            instructions.
          </Text>

          <Input
            label="University Email"
            placeholder="name@marwadiuniversity.ac.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={16} color={Colors.textMuted} />}
          />

          <Button
            title={isSent ? 'Resend Instructions' : 'Send Reset Link'}
            variant="primary"
            size="lg"
            onPress={handleReset}
            style={{ marginTop: 8 }}
          />
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  card: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 10,
    maxWidth: 280,
  },
});

