import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ShieldCheck, Clock, UserCheck } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ServiceProvider } from '../../services/serviceProvider';
import { AuditLog } from '../../models/audit';
import { formatDateTime } from '../../utils/formatters';

interface AuditLogsScreenProps {
  navigation: any;
}

export const AuditLogsScreen: React.FC<AuditLogsScreenProps> = ({ navigation }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(ServiceProvider.audit.getAuditLogs());
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Security Audit Trail"
        subtitle="Operational & State Change Log"
        showBack
        onBack={() => navigation.goBack()}
      />

      {logs.length === 0 ? (
        <EmptyState
          title="No Audit Records"
          description="Security and operational events will appear here as actions occur."
        />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.logId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.actionText}>{item.action}</Text>
                  <Badge label={item.entityType.toUpperCase()} size="sm" variant="info" />
                </View>
                <Text style={styles.timeText}>{formatDateTime(item.timestamp)}</Text>
              </View>

              <Text style={styles.actorText}>
                Actor: <Text style={{ fontWeight: '700' }}>{item.actorEmail}</Text> ({item.actorRole})
              </Text>

              {item.details ? (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(item.details, null, 2)}
                  </Text>
                </View>
              ) : null}
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  actorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  detailsBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textPrimary,
  },
});

