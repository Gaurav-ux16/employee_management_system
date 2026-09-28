import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { attendanceApi, employeeApi } from '../api/client';

const STATUS_FILTER = [
  { label: 'ALL STATUSES', value: 'ALL' },
  { label: 'PRESENT', value: 'PRESENT' },
  { label: 'ABSENT', value: 'ABSENT' },
  { label: 'HALF DAY', value: 'HALF_DAY' },
];

export function AttendanceScreen() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-09-29');

  // Edit / Record Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    check_in: '09:00 AM',
    check_out: '06:00 PM',
    status: 'PRESENT',
    hours: '9.0 hrs',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [attRes, empRes] = await Promise.all([
        attendanceApi.getAll({ search, status: statusFilter }),
        employeeApi.getAll(),
      ]);
      setAttendanceList(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search, statusFilter, selectedDate]);

  const handleOpenNewRecord = () => {
    setEditingRecord(null);
    setFormData({
      employee_id: employees[0]?.id || 'EMP-1001',
      check_in: '09:00 AM',
      check_out: '06:00 PM',
      status: 'PRESENT',
      hours: '9.0 hrs',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      employee_id: record.employee_id,
      check_in: record.check_in || '09:00 AM',
      check_out: record.check_out || '06:00 PM',
      status: record.status || 'PRESENT',
      hours: record.hours || '8.5 hrs',
    });
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaveLoading(true);
      const emp = employees.find((e) => e.id === formData.employee_id);
      const payload = {
        ...formData,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
        department: emp ? emp.department : 'Engineering',
        date: selectedDate,
      };

      if (editingRecord) {
        await attendanceApi.update(editingRecord.id, payload);
      } else {
        await attendanceApi.create(payload);
      }

      setIsModalOpen(false);
      fetchAttendance();
    } catch (err) {
      alert('Failed to save attendance record.');
    } finally {
      setSaveLoading(false);
    }
  };

  const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
  const halfDayCount = attendanceList.filter((a) => a.status === 'HALF_DAY').length;
  const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSub}>DAILY TIME & ATTENDANCE LEDGER</Text>
          <Text style={styles.sectionTitle}>
            Operational Attendance Log <Text style={styles.countBadge}>({selectedDate})</Text>
          </Text>
        </View>
        <Button
          title="+ LOG ATTENDANCE ENTRY"
          onPress={handleOpenNewRecord}
          variant="primary"
          size="md"
        />
      </View>

      {/* QUICK SUMMARY METRICS STRIP */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>LOGGED RECORDS</Text>
          <Text style={styles.sumVal}>{attendanceList.length}</Text>
        </View>
        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.sumLabel}>PRESENT TODAY</Text>
          <Text style={[styles.sumVal, { color: colors.status.present.text }]}>
            {presentCount}
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.sumLabel}>HALF DAY LOGS</Text>
          <Text style={[styles.sumVal, { color: colors.status.halfDay.text }]}>
            {halfDayCount}
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.borderLeft]}>
          <Text style={styles.sumLabel}>ABSENT STAFF</Text>
          <Text style={[styles.sumVal, { color: colors.status.absent.text }]}>
            {absentCount}
          </Text>
        </View>
      </View>

      {/* CONTROL & FILTER STRIP */}
      <View style={styles.filterBar}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setSelectedDate('2026-09-28')}
          >
            <Text style={styles.dateBtnText}>◄ YESTERDAY</Text>
          </TouchableOpacity>
          <View style={styles.dateDisplayBox}>
            <Text style={styles.dateDisplayText}>{selectedDate} [ TODAY ]</Text>
          </View>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setSelectedDate('2026-09-30')}
          >
            <Text style={styles.dateBtnText}>TOMORROW ►</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search employee name..."
            style={styles.noMarginInput}
          />
        </View>

        <View style={styles.statusBox}>
          <Select
            options={STATUS_FILTER}
            value={statusFilter}
            onSelect={setStatusFilter}
            placeholder="Status"
            style={styles.noMarginSelect}
          />
        </View>
      </View>

      {/* ATTENDANCE TABLE */}
      {loading ? (
        <LoadingState message="FETCHING ATTENDANCE RECORDS..." />
      ) : attendanceList.length === 0 ? (
        <EmptyState
          title="NO ATTENDANCE RECORDS"
          description="No attendance entries recorded for the selected date or filter query."
          actionTitle="LOG ATTENDANCE ENTRY"
          onAction={handleOpenNewRecord}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: 100 }]}>EMP ID</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>EMPLOYEE & DEPT</Text>
            <Text style={[styles.th, { width: 110 }]}>CHECK IN</Text>
            <Text style={[styles.th, { width: 110 }]}>CHECK OUT</Text>
            <Text style={[styles.th, { width: 110 }]}>TOTAL HOURS</Text>
            <Text style={[styles.th, { width: 110 }]}>STATUS</Text>
            <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {attendanceList.map((att) => (
            <View key={att.id} style={styles.tr}>
              <Text style={styles.tdId}>{att.employee_id}</Text>

              <View style={{ flex: 1.5 }}>
                <Text style={styles.empName}>{att.employee_name}</Text>
                <Text style={styles.empDept}>{att.department}</Text>
              </View>

              <Text style={styles.tdTime}>{att.check_in}</Text>
              <Text style={styles.tdTime}>{att.check_out}</Text>
              <Text style={styles.tdHours}>{att.hours}</Text>

              <View style={{ width: 110 }}>
                <Badge status={att.status} size="sm" />
              </View>

              <View style={styles.actionsCell}>
                <TouchableOpacity
                  onPress={() => handleOpenEditRecord(att)}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>EDIT</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* RECORD / EDIT ATTENDANCE MODAL */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? `Edit Attendance: ${editingRecord.employee_name}` : 'Log Attendance Entry'}
        subtitle={`DATE // ${selectedDate}`}
        width={560}
        footer={
          <>
            <Button
              title="CANCEL"
              variant="outline"
              onPress={() => setIsModalOpen(false)}
              disabled={saveLoading}
            />
            <Button
              title="COMMIT ENTRY"
              variant="primary"
              onPress={handleSaveAttendance}
              loading={saveLoading}
            />
          </>
        }
      >
        <View style={styles.formGrid}>
          {!editingRecord && (
            <Select
              label="SELECT EMPLOYEE"
              options={employees.map((e) => ({
                label: `${e.first_name} ${e.last_name} (${e.employee_code} - ${e.department})`,
                value: e.id,
              }))}
              value={formData.employee_id}
              onSelect={(v) => setFormData((p) => ({ ...p, employee_id: v }))}
              required
            />
          )}

          <Select
            label="ATTENDANCE STATUS"
            options={['PRESENT', 'ABSENT', 'HALF_DAY']}
            value={formData.status}
            onSelect={(v) => setFormData((p) => ({ ...p, status: v }))}
            required
          />

          <View style={styles.rowTwo}>
            <Input
              label="CHECK IN TIME"
              value={formData.check_in}
              onChangeText={(v) => setFormData((p) => ({ ...p, check_in: v }))}
              placeholder="09:00 AM"
              style={{ flex: 1 }}
            />
            <Input
              label="CHECK OUT TIME"
              value={formData.check_out}
              onChangeText={(v) => setFormData((p) => ({ ...p, check_out: v }))}
              placeholder="06:00 PM"
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="DURATION / HOURS"
            value={formData.hours}
            onChangeText={(v) => setFormData((p) => ({ ...p, hours: v }))}
            placeholder="8.5 hrs"
          />
        </View>
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
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },

  // Summary Bar
  summaryBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 2,
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 16,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  sumLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  sumVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },

  // Filter Bar
  filterBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  dateBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  dateDisplayBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  dateDisplayText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  searchBox: {
    flex: 1,
  },
  statusBox: {
    width: 170,
  },
  noMarginInput: {
    marginBottom: 0,
  },
  noMarginSelect: {
    marginBottom: 0,
  },

  // Table
  tableCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  th: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  tr: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tdId: {
    width: 100,
    fontSize: 11,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  empName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  empDept: {
    fontSize: 10,
    color: colors.inkMuted,
  },
  tdTime: {
    width: 110,
    fontSize: 11,
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  tdHours: {
    width: 110,
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
  actionsCell: {
    width: 90,
    alignItems: 'flex-end',
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  actionBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },

  // Modal
  formGrid: {
    flexDirection: 'column',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 14,
  },
});
