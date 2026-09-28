import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { dashboardApi, leaveApi, departmentApi } from '../api/client';

export function DashboardScreen({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptsRes, leavesRes] = await Promise.all([
        dashboardApi.getStats(),
        departmentApi.getAll(),
        leaveApi.getAll({ status: 'PENDING' }),
      ]);
      setStats(statsRes.data);
      setDepartments(deptsRes.data);
      setPendingLeaves(leavesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveLeave = async (id) => {
    try {
      setActionLoading(id);
      await leaveApi.approve(id);
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to approve leave request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      setActionLoading(id);
      await leaveApi.reject(id);
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to reject leave request.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingState message="COMPUTING OPERATIONAL PULSE..." />;
  }

  const att = stats?.attendance || { present: 14, absent: 2, half_day: 2, rate: 82 };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER & CONTROL BAR */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSub}>OPERATIONAL OVERVIEW</Text>
          <Text style={styles.sectionTitle}>Organization Executive Pulse</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="MANAGE EMPLOYEES"
            onPress={() => onNavigate('employees')}
            variant="outline"
            size="sm"
          />
          <Button
            title="VIEW ATTENDANCE LEDGER"
            onPress={() => onNavigate('attendance')}
            variant="primary"
            size="sm"
          />
        </View>
      </View>

      {/* COMPACT ORGANIZATION SUMMARY STRIP */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL WORKFORCE</Text>
          <View style={styles.summaryValRow}>
            <Text style={styles.summaryVal}>{stats?.total_employees || 18}</Text>
            <Text style={styles.summarySub}>Employees</Text>
          </View>
        </View>

        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.summaryLabel}>TODAY PRESENT</Text>
          <View style={styles.summaryValRow}>
            <Text style={[styles.summaryVal, { color: colors.status.present.text }]}>
              {att.present}
            </Text>
            <Text style={styles.summarySub}>({att.rate}% Rate)</Text>
          </View>
        </View>

        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.summaryLabel}>ABSENT / HALF DAY</Text>
          <View style={styles.summaryValRow}>
            <Text style={[styles.summaryVal, { color: colors.status.absent.text }]}>
              {att.absent + att.half_day}
            </Text>
            <Text style={styles.summarySub}>({att.half_day} Half-day)</Text>
          </View>
        </View>

        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.summaryLabel}>PENDING LEAVES</Text>
          <View style={styles.summaryValRow}>
            <Text style={[styles.summaryVal, { color: colors.status.pending.text }]}>
              {pendingLeaves.length}
            </Text>
            <Text style={styles.summarySub}>Awaiting Approval</Text>
          </View>
        </View>

        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.summaryLabel}>DEPARTMENTS</Text>
          <View style={styles.summaryValRow}>
            <Text style={styles.summaryVal}>{stats?.department_count || 5}</Text>
            <Text style={styles.summarySub}>Active Units</Text>
          </View>
        </View>
      </View>

      {/* OPERATIONAL GRID - 2 COLUMNS */}
      <View style={styles.operationalGrid}>
        {/* LEFT COLUMN: PENDING ACTIONS & ATTENDANCE PULSE */}
        <View style={styles.colLeft}>
          {/* PENDING LEAVE ACTIONS CARD */}
          <Card
            title="PENDING LEAVE APPROVAL QUEUE"
            subtitle="ACTIONABLE REQUESTS"
            noPadding
            action={
              <TouchableOpacity onPress={() => onNavigate('leaves')}>
                <Text style={styles.linkText}>ALL REQUESTS →</Text>
              </TouchableOpacity>
            }
          >
            {pendingLeaves.length === 0 ? (
              <View style={styles.emptyCardInner}>
                <Text style={styles.emptyText}>✓ All leave requests resolved. Zero pending items.</Text>
              </View>
            ) : (
              pendingLeaves.slice(0, 3).map((leave) => (
                <View key={leave.id} style={styles.leaveRow}>
                  <View style={styles.leaveMeta}>
                    <View style={styles.leaveUserRow}>
                      <Text style={styles.leaveEmpName}>{leave.employee_name}</Text>
                      <Text style={styles.leaveDept}>({leave.department})</Text>
                    </View>
                    <Text style={styles.leaveDetail}>
                      {leave.leave_type.toUpperCase()} • {leave.start_date} to {leave.end_date} ({leave.days_count} days)
                    </Text>
                    <Text style={styles.leaveReason} numberOfLines={1}>
                      "{leave.reason}"
                    </Text>
                  </View>

                  <View style={styles.leaveActions}>
                    <Button
                      title="APPROVE"
                      variant="success"
                      size="sm"
                      loading={actionLoading === leave.id}
                      onPress={() => handleApproveLeave(leave.id)}
                    />
                    <Button
                      title="REJECT"
                      variant="outline"
                      size="sm"
                      loading={actionLoading === leave.id}
                      onPress={() => handleRejectLeave(leave.id)}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>

          {/* ATTENDANCE PULSE BREAKDOWN */}
          <Card title="TODAY'S ATTENDANCE BREAKDOWN" subtitle="LIVE FLOOR STATISTICS">
            <View style={styles.attProgressTrack}>
              <View
                style={[
                  styles.attBarPresent,
                  { flex: Math.max(att.present, 1) },
                ]}
              />
              <View
                style={[
                  styles.attBarHalf,
                  { flex: Math.max(att.half_day, 0.5) },
                ]}
              />
              <View
                style={[
                  styles.attBarAbsent,
                  { flex: Math.max(att.absent, 0.5) },
                ]}
              />
            </View>

            <View style={styles.attLegendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
                <Text style={styles.legendText}>PRESENT ({att.present})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.legendText}>HALF DAY ({att.half_day})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.legendText}>ABSENT ({att.absent})</Text>
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                💡 Floor logs show <Text style={{ fontWeight: '800' }}>Kavita Rao</Text> marked Half Day and <Text style={{ fontWeight: '800' }}>Pooja Hegde & Gaurav Tiwari</Text> currently absent.
              </Text>
            </View>
          </Card>

          {/* DEPARTMENT HEADCOUNT MATRIX */}
          <Card
            title="DEPARTMENT HEADCOUNT MATRIX"
            subtitle="ORGANIZATIONAL UNITS"
            noPadding
            action={
              <TouchableOpacity onPress={() => onNavigate('departments')}>
                <Text style={styles.linkText}>DEPARTMENTS →</Text>
              </TouchableOpacity>
            }
          >
            {departments.map((dept) => (
              <View key={dept.id} style={styles.deptRow}>
                <View style={styles.deptLeft}>
                  <Text style={styles.deptCode}>{dept.code}</Text>
                  <View>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    <Text style={styles.deptLead}>Lead: {dept.leadName}</Text>
                  </View>
                </View>

                <View style={styles.deptRight}>
                  <Text style={styles.deptCount}>{dept.employee_count} STAFF</Text>
                  <Text style={styles.deptBudget}>{dept.budget}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* RIGHT COLUMN: RECENT AUDIT ACTIVITY & SYSTEM STATS */}
        <View style={styles.colRight}>
          {/* RECENT EMPLOYEE ACTIVITY AUDIT LOG */}
          <Card title="RECENT AUDIT TRAIL" subtitle="CHRONOLOGICAL EVENTS" noPadding>
            {(stats?.activities || []).map((act, index) => (
              <View key={act.id || index} style={styles.activityRow}>
                <View style={styles.actTimeCol}>
                  <Text style={styles.actTime}>{act.time}</Text>
                  <Text style={styles.actTag}>[{act.type}]</Text>
                </View>
                <View style={styles.actMain}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actDesc}>{act.desc}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* QUICK SHORTCUTS & OPERATIONS HELP */}
          <Card title="OPERATIONAL SHORTCUTS" subtitle="FAST ACTIONS">
            <View style={styles.shortcutGrid}>
              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => onNavigate('employees')}
              >
                <Text style={styles.shortcutIcon}>𝌆</Text>
                <Text style={styles.shortcutText}>Add Employee</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => onNavigate('attendance')}
              >
                <Text style={styles.shortcutIcon}>⏱</Text>
                <Text style={styles.shortcutText}>Mark Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => onNavigate('leaves')}
              >
                <Text style={styles.shortcutIcon}>📑</Text>
                <Text style={styles.shortcutText}>Process Leaves</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutBtn}
                onPress={() => onNavigate('departments')}
              >
                <Text style={styles.shortcutIcon}>◫</Text>
                <Text style={styles.shortcutText}>Units & Roles</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionSub: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.inkPrimary,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },

  // Summary Strip
  summaryStrip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 16,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  summaryValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  summarySub: {
    fontSize: 10,
    color: colors.inkSecondary,
  },

  // Operational Grid
  operationalGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  colLeft: {
    flex: 1.6,
  },
  colRight: {
    flex: 1,
  },
  linkText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  emptyCardInner: {
    padding: 16,
  },
  emptyText: {
    fontSize: 12,
    color: colors.status.active.text,
    fontFamily: 'monospace',
  },

  // Leave Row
  leaveRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveMeta: {
    flex: 1,
    marginRight: 12,
  },
  leaveUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  leaveEmpName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  leaveDept: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  leaveDetail: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.pending.text,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  leaveReason: {
    fontSize: 11,
    color: colors.inkSecondary,
    fontStyle: 'italic',
  },
  leaveActions: {
    flexDirection: 'row',
    gap: 6,
  },

  // Attendance progress
  attProgressTrack: {
    height: 12,
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  attBarPresent: {
    backgroundColor: '#059669',
  },
  attBarHalf: {
    backgroundColor: '#D97706',
  },
  attBarAbsent: {
    backgroundColor: '#DC2626',
  },
  attLegendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
  noticeBox: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 2,
  },
  noticeText: {
    fontSize: 11,
    color: colors.inkSecondary,
    lineHeight: 16,
  },

  // Dept Matrix
  deptRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deptCode: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 2,
  },
  deptName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  deptLead: {
    fontSize: 10,
    color: colors.inkMuted,
  },
  deptRight: {
    alignItems: 'flex-end',
  },
  deptCount: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  deptBudget: {
    fontSize: 10,
    color: colors.inkMuted,
  },

  // Activity row
  activityRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  actTimeCol: {
    width: 64,
  },
  actTime: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  actTag: {
    fontSize: 8,
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },
  actMain: {
    flex: 1,
  },
  actTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  actDesc: {
    fontSize: 11,
    color: colors.inkSecondary,
    marginTop: 2,
  },

  // Shortcuts
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutBtn: {
    width: '48%',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 2,
    alignItems: 'center',
  },
  shortcutIcon: {
    fontSize: 18,
    color: colors.inkPrimary,
    marginBottom: 4,
  },
  shortcutText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
});
