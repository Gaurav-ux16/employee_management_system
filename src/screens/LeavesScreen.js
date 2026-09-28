import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { leaveApi, employeeApi } from '../api/client';

const STATUS_TABS = [
  { id: 'ALL', label: 'ALL REQUESTS' },
  { id: 'PENDING', label: 'PENDING APPROVAL' },
  { id: 'APPROVED', label: 'APPROVED' },
  { id: 'REJECTED', label: 'REJECTED' },
];

export function LeavesScreen() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  // New Leave Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'Casual Leave',
    start_date: '2026-10-05',
    end_date: '2026-10-07',
    days_count: '3',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLeavesData = async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        leaveApi.getAll({ status: activeTab }),
        employeeApi.getAll(),
      ]);
      setLeaves(leavesRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await leaveApi.approve(id);
      fetchLeavesData();
    } catch (err) {
      alert('Failed to approve leave.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenReject = (id) => {
    setRejectingLeaveId(id);
    setRejectionReason('Project milestone coverage required on requested dates.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(rejectingLeaveId);
      await leaveApi.reject(rejectingLeaveId, rejectionReason);
      setIsRejectModalOpen(false);
      setRejectingLeaveId(null);
      fetchLeavesData();
    } catch (err) {
      alert('Failed to reject leave.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenNewRequest = () => {
    setFormData({
      employee_id: employees[0]?.id || 'EMP-1001',
      leave_type: 'Casual Leave',
      start_date: '2026-10-05',
      end_date: '2026-10-07',
      days_count: '3',
      reason: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSaveLeaveRequest = async () => {
    if (!formData.reason.trim()) {
      setErrors({ reason: 'Please state the reason for leave application.' });
      return;
    }

    try {
      setSubmitLoading(true);
      const emp = employees.find((e) => e.id === formData.employee_id);
      const payload = {
        ...formData,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
        employee_code: emp ? emp.employee_code : 'EMP-000',
        department: emp ? emp.department : 'Operations',
        designation: emp ? emp.designation : 'Specialist',
        days_count: parseFloat(formData.days_count) || 1,
      };

      await leaveApi.create(payload);
      setIsModalOpen(false);
      fetchLeavesData();
    } catch (err) {
      alert('Failed to submit leave request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSub}>TIME-OFF & ABSENCE WORKFLOW</Text>
          <Text style={styles.sectionTitle}>
            Leave Application Approvals{' '}
            {pendingCount > 0 && (
              <Text style={styles.countBadge}>({pendingCount} Pending)</Text>
            )}
          </Text>
        </View>
        <Button
          title="+ NEW LEAVE APPLICATION"
          onPress={handleOpenNewRequest}
          variant="primary"
          size="md"
        />
      </View>

      {/* TABS & FILTER HEADER */}
      <View style={styles.tabStrip}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LEAVE CARDS / LIST */}
      {loading ? (
        <LoadingState message="FETCHING LEAVE WORKFLOW QUEUE..." />
      ) : leaves.length === 0 ? (
        <EmptyState
          title="NO LEAVE APPLICATIONS"
          description="There are currently no leave requests matching the active filter tab."
          actionTitle="SUBMIT LEAVE APPLICATION"
          onAction={handleOpenNewRequest}
        />
      ) : (
        <View style={styles.cardsGrid}>
          {leaves.map((leave) => {
            const isPending = leave.status === 'PENDING';

            return (
              <View key={leave.id} style={styles.leaveCard}>
                {/* TOP HEADER */}
                <View style={styles.cardTopHeader}>
                  <View style={styles.userMeta}>
                    <Text style={styles.empCodeTag}>{leave.employee_code}</Text>
                    <View>
                      <Text style={styles.empName}>{leave.employee_name}</Text>
                      <Text style={styles.empSub}>
                        {leave.designation} • {leave.department}
                      </Text>
                    </View>
                  </View>
                  <Badge status={leave.status} />
                </View>

                {/* MIDDLE DETAILS GRID */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.dLabel}>LEAVE TYPE</Text>
                    <Text style={styles.dVal}>{leave.leave_type}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.dLabel}>DURATION</Text>
                    <Text style={styles.dVal}>
                      {leave.days_count} {leave.days_count === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.dLabel}>DATE RANGE</Text>
                    <Text style={styles.dVal}>
                      {leave.start_date} → {leave.end_date}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.dLabel}>APPLIED ON</Text>
                    <Text style={styles.dVal}>{leave.applied_on}</Text>
                  </View>
                </View>

                {/* REASON BOX */}
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>APPLICATION REASON:</Text>
                  <Text style={styles.reasonText}>"{leave.reason}"</Text>
                  {leave.rejection_reason && (
                    <Text style={styles.rejectionNote}>
                      ⚠ Rejection Note: {leave.rejection_reason}
                    </Text>
                  )}
                </View>

                {/* ACTIONS BAR FOR PENDING */}
                {isPending && (
                  <View style={styles.cardFooterActions}>
                    <Button
                      title="REJECT APPLICATION"
                      variant="outline"
                      size="sm"
                      loading={actionLoading === leave.id}
                      onPress={() => handleOpenReject(leave.id)}
                    />
                    <Button
                      title="APPROVE LEAVE"
                      variant="success"
                      size="sm"
                      loading={actionLoading === leave.id}
                      onPress={() => handleApprove(leave.id)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* NEW LEAVE MODAL */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Application"
        subtitle="WORKFLOW // LEAVES // CREATE"
        width={600}
        footer={
          <>
            <Button
              title="CANCEL"
              variant="outline"
              onPress={() => setIsModalOpen(false)}
              disabled={submitLoading}
            />
            <Button
              title="SUBMIT REQUEST"
              variant="primary"
              onPress={handleSaveLeaveRequest}
              loading={submitLoading}
            />
          </>
        }
      >
        <View style={styles.formGrid}>
          <Select
            label="SELECT APPLICANT EMPLOYEE"
            options={employees.map((e) => ({
              label: `${e.first_name} ${e.last_name} (${e.employee_code} - ${e.department})`,
              value: e.id,
            }))}
            value={formData.employee_id}
            onSelect={(v) => setFormData((p) => ({ ...p, employee_id: v }))}
            required
          />

          <View style={styles.rowTwo}>
            <Select
              label="LEAVE CATEGORY"
              options={['Casual Leave', 'Sick Leave', 'Earned Leave', 'Half Day']}
              value={formData.leave_type}
              onSelect={(v) => setFormData((p) => ({ ...p, leave_type: v }))}
              required
              style={{ flex: 1 }}
            />
            <Input
              label="NUMBER OF DAYS"
              value={formData.days_count}
              onChangeText={(v) => setFormData((p) => ({ ...p, days_count: v }))}
              placeholder="e.g. 3"
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.rowTwo}>
            <Input
              label="START DATE (YYYY-MM-DD)"
              value={formData.start_date}
              onChangeText={(v) => setFormData((p) => ({ ...p, start_date: v }))}
              placeholder="2026-10-05"
              style={{ flex: 1 }}
            />
            <Input
              label="END DATE (YYYY-MM-DD)"
              value={formData.end_date}
              onChangeText={(v) => setFormData((p) => ({ ...p, end_date: v }))}
              placeholder="2026-10-07"
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="STATEMENT OF REASON"
            value={formData.reason}
            onChangeText={(v) => setFormData((p) => ({ ...p, reason: v }))}
            placeholder="Detailed explanation for leave request..."
            multiline
            numberOfLines={3}
            error={errors.reason}
            required
          />
        </View>
      </Modal>

      {/* REJECTION REASON MODAL */}
      <Modal
        visible={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Leave Application"
        subtitle="DECISION AUDIT REASON"
        width={500}
        footer={
          <>
            <Button
              title="CANCEL"
              variant="outline"
              onPress={() => setIsRejectModalOpen(false)}
            />
            <Button
              title="CONFIRM REJECTION"
              variant="danger"
              onPress={handleConfirmReject}
            />
          </>
        }
      >
        <Input
          label="REJECTION REASON FOR AUDIT TRAIL"
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="State reason for declining this request..."
          multiline
          numberOfLines={3}
          required
        />
      </Modal>
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
    marginBottom: 16,
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
  countBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
  },

  // Tabs
  tabStrip: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
    gap: 4,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  tabTextActive: {
    color: colors.inkPrimary,
  },

  // Cards
  cardsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  leaveCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: 16,
  },
  cardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  empCodeTag: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  empName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.inkPrimary,
  },
  empSub: {
    fontSize: 11,
    color: colors.inkMuted,
  },

  // Details
  cardDetails: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 2,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  dLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  dVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },

  // Reason
  reasonBox: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    color: colors.inkSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  rejectionNote: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700',
    marginTop: 4,
    fontFamily: 'monospace',
  },

  // Footer Actions
  cardFooterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Modal Form
  formGrid: {
    flexDirection: 'column',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 14,
  },
});
