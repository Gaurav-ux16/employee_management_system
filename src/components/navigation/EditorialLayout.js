import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

export function EditorialLayout({
  currentSection,
  onNavigate,
  currentUser,
  onLogout,
  onQuickAction,
  children,
  stats,
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', code: 'DSH', icon: '⊞', badge: null },
    { id: 'employees', label: 'EMPLOYEES', code: 'EMP', icon: '𝌆', badge: stats?.total_employees || 18 },
    { id: 'departments', label: 'DEPARTMENTS', code: 'DEP', icon: '◫', badge: stats?.department_count || 5 },
    { id: 'attendance', label: 'ATTENDANCE', code: 'ATT', icon: '⏱', badge: `${stats?.attendance?.present || 14}P` },
    { id: 'leaves', label: 'LEAVES', code: 'LVE', icon: '📑', badge: stats?.pending_leaves || 2, badgeColor: colors.status.pending.text },
  ];

  return (
    <View style={styles.shell}>
      {/* LEFT COMPACT COMMAND RAIL */}
      <View style={styles.rail}>
        {/* Rail Top Branding */}
        <View style={styles.railHeader}>
          <Text style={styles.brandTag}>SYS.OPS</Text>
          <Text style={styles.brandSub}>2026.09</Text>
        </View>

        {/* Rail Navigation Buttons */}
        <View style={styles.railNav}>
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onNavigate(item.id)}
                activeOpacity={0.8}
                style={[styles.railItem, isActive && styles.railItemActive]}
              >
                <Text style={[styles.railIcon, isActive && styles.railIconActive]}>
                  {item.icon}
                </Text>
                <Text style={[styles.railCode, isActive && styles.railCodeActive]}>
                  {item.code}
                </Text>

                {item.badge !== null && item.badge !== undefined && (
                  <View
                    style={[
                      styles.railBadge,
                      item.badgeColor ? { backgroundColor: item.badgeColor } : null,
                    ]}
                  >
                    <Text style={styles.railBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rail Footer System Pulse */}
        <View style={styles.railFooter}>
          <View style={styles.pulseDot} />
          <Text style={styles.railTime}>{timeStr.split(' ')[0]}</Text>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.mainArea}>
        {/* TOP OPERATIONAL BAR */}
        <View style={styles.topBar}>
          {/* Left: Breadcrumbs & Status */}
          <View style={styles.topBarLeft}>
            <Text style={styles.topBreadcrumb}>
              WORKSPACE // <Text style={styles.topBreadcrumbHighlight}>{currentSection.toUpperCase()}</Text>
            </Text>
            <View style={styles.systemStatusPill}>
              <View style={styles.liveIndicator} />
              <Text style={styles.systemStatusText}>FASTAPI-READY API LAYER MOCK</Text>
            </View>
          </View>

          {/* Right: Quick Action & User Metadata */}
          <View style={styles.topBarRight}>
            {onQuickAction && (
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={onQuickAction}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionText}>+ NEW RECORD</Text>
              </TouchableOpacity>
            )}

            {/* User Avatar & Role */}
            <View style={styles.userProfile}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{currentUser?.avatar || 'RS'}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser?.name || 'Rahul Sharma'}</Text>
                <Text style={styles.userRole}>{currentUser?.role || 'ADMIN'} // {currentUser?.department || 'OPS'}</Text>
              </View>
            </View>

            {/* Logout Trigger */}
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.8}>
              <Text style={styles.logoutText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WORKSPACE VIEW BODY */}
        <ScrollView style={styles.contentBody} contentContainerStyle={styles.contentContainer}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
    height: '100vh',
    overflow: 'hidden',
  },
  rail: {
    width: 72,
    backgroundColor: colors.railBg,
    borderRightWidth: 1,
    borderRightColor: colors.railBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    zIndex: 10,
  },
  railHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F3F4F6',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  brandSub: {
    fontSize: 8,
    color: colors.railTextMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  railNav: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  railItem: {
    width: 60,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    position: 'relative',
  },
  railItemActive: {
    backgroundColor: colors.railActiveBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  railIcon: {
    fontSize: 18,
    color: colors.railTextMuted,
    marginBottom: 2,
  },
  railIconActive: {
    color: colors.railText,
  },
  railCode: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.railTextMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  railCodeActive: {
    color: '#FFFFFF',
  },
  railBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#374151',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  railBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  railFooter: {
    alignItems: 'center',
    marginTop: 10,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginBottom: 4,
  },
  railTime: {
    fontSize: 8,
    color: colors.railTextMuted,
    fontFamily: 'monospace',
  },

  // Main Area
  mainArea: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    height: 54,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topBreadcrumb: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  topBreadcrumbHighlight: {
    color: colors.inkPrimary,
    fontWeight: '900',
  },
  systemStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    gap: 6,
  },
  liveIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  systemStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quickActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
  },
  quickActionText: {
    color: colors.inkContrast,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  avatarBox: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  userRole: {
    fontSize: 9,
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
  },
  logoutText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },

  contentBody: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
});
