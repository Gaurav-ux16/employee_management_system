import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authApi } from '../api/client';

export function AuthScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@ops.co');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please provide system credentials.');
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.login(email, password);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {/* LEFT EDITORIAL PANEL */}
        <View style={styles.leftPanel}>
          <View style={styles.leftHeader}>
            <Text style={styles.systemTag}>SYS.OPS // 2026.09</Text>
            <Text style={styles.heroTitle}>Employee Operations Workspace</Text>
            <Text style={styles.heroDesc}>
              Internal administrative control plane for headcount management, daily attendance logging, department structures, and leave approval workflows.
            </Text>
          </View>

          <View style={styles.systemMetricsBox}>
            <Text style={styles.metricsHeader}>WORKSPACE SPECIFICATION</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>API PROTOCOL</Text>
              <Text style={styles.metricVal}>FastAPI REST / OpenAPI 3.0</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>STORAGE ENGINE</Text>
              <Text style={styles.metricVal}>SQLAlchemy + SQLite local</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>LOCATION NODE</Text>
              <Text style={styles.metricVal}>BOM-1 (Mumbai HQ)</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.metricLabel}>SECURITY LEVEL</Text>
              <Text style={styles.metricVal}>Role-Based Access Control</Text>
            </View>
          </View>

          <View style={styles.leftFooter}>
            <Text style={styles.footerNote}>OPERATIONAL NOTICE: Authorized personnel only.</Text>
          </View>
        </View>

        {/* RIGHT SIGN IN PANEL */}
        <View style={styles.rightPanel}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTag}>IDENTIFICATION</Text>
              <Text style={styles.formTitle}>System Sign In</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <Input
              label="WORK EMAIL ADDRESS"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rahul.sharma@ops.co"
              keyboardType="email-address"
              required
            />

            <Input
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              secureTextEntry
              required
            />

            <Button
              title="AUTHENTICATE & ENTER"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />

            {/* Quick Demo Login Preset Options */}
            <View style={styles.quickPresetSection}>
              <Text style={styles.presetLabel}>QUICK ACCESS MOCK PRESETS:</Text>
              <View style={styles.presetButtons}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFill('rahul.sharma@ops.co')}
                >
                  <Text style={styles.presetText}>[ ADMIN: R. Sharma ]</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFill('priya.patil@ops.co')}
                >
                  <Text style={styles.presetText}>[ HR LEAD: P. Patil ]</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100vh',
  },
  gridContainer: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.inkPrimary,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1.2,
    backgroundColor: colors.railBg,
    padding: 36,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: colors.railBorder,
  },
  leftHeader: {
    marginBottom: 24,
  },
  systemTag: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 13,
    color: colors.railTextMuted,
    lineHeight: 20,
  },
  systemMetricsBox: {
    backgroundColor: colors.railActiveBg,
    borderWidth: 1,
    borderColor: colors.railBorder,
    padding: 16,
    borderRadius: 2,
  },
  metricsHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.railTextMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.railBorder,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.railTextMuted,
    fontFamily: 'monospace',
  },
  metricVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E5E7EB',
    fontFamily: 'monospace',
  },
  leftFooter: {
    marginTop: 20,
  },
  footerNote: {
    fontSize: 10,
    color: colors.railTextMuted,
    fontFamily: 'monospace',
  },

  rightPanel: {
    flex: 1,
    padding: 36,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  formCard: {
    width: '100%',
  },
  formHeader: {
    marginBottom: 24,
  },
  formTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.inkPrimary,
    letterSpacing: -0.3,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 2,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 11,
    color: '#991B1B',
    fontFamily: 'monospace',
  },
  submitBtn: {
    marginTop: 10,
  },
  quickPresetSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'column',
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  presetText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
});
