import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { colors } from '../theme/colors';
import { attendanceApi, leaveApi } from '../api/client';

export function EmployeeDetailModal({
  visible,
  onClose,
  employee,
  onEdit,
  onDelete,
}) {
  const [attLogs, setAttLogs] = useState([]);
  const [leaveLogs, setLeaveLogs] = useState([]);

  useEffect(() => {
    if (employee && visible) {
      attendanceApi.getByEmployeeId(employee.id).then((res) => setAttLogs(res.data));
      leaveApi.getAll().then((res) => {
        const userLeaves = res.data.filter(
          (l) => l.employee_id === employee.id || l.employee_code === employee.employee_code
        );
        setLeaveLogs(userLeaves);
      });
    }
  }, [employee, visible]);

  if (!employee) return null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`${employee.first_name} ${employee.last_name}`}
      subtitle={`EMPLOYEE DOSSIER // ${employee.employee_code}`}
      width={760}
      footer={
        <>
          <Button
            title="DELETE RECORD"
            variant="danger"
            size="sm"
            onPress={() => onDelete(employee.id)}
          />
          <Button
            title="EDIT DETAILS"
            variant="outline"
            size="sm"
            onPress={() => onEdit(employee)}
          />
          <Button title="CLOSE DOSSIER" variant="primary" size="sm" onPress={onClose} />
        </>
      }
    >
      <View style={styles.container}>
        {/* TOP IDENTITY HERO STRIP */}
        <View style={styles.heroStrip}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{employee.avatar || 'EM'}</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroName}>
                {employee.first_name} {employee.last_name}
              </Text>
              <Badge status={employee.status} />
            </View>
            <Text style={styles.heroTitle}>{employee.designation}</Text>
            <Text style={styles.heroDept}>{employee.department}</Text>
          </View>
        </View>

        {/* METADATA SPEC MATRIX */}
        <View style={styles.matrixGrid}>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>EMPLOYEE ID</Text>
            <Text style={styles.mVal}>{employee.employee_code}</Text>
          </View>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.mVal}>{employee.email}</Text>
          </View>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>PHONE NUMBER</Text>
            <Text style={styles.mVal}>{employee.phone}</Text>
          </View>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>DATE OF JOINING</Text>
            <Text style={styles.mVal}>{employee.date_of_joining}</Text>
          </View>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>SALARY PACKAGE</Text>
            <Text style={styles.mVal}>{employee.salary}</Text>
          </View>
          <View style={styles.matrixItem}>
            <Text style={styles.mLabel}>LOCATION NODE</Text>
            <Text style={styles.mVal}>Mumbai HQ (Building A)</Text>
          </View>
        </View>

        {/* ATTENDANCE & LEAVE HISTORY TABS */}
        <View style={styles.historySection}>
          <Text style={styles.sectionHeader}>ATTENDANCE & LEAVE RECORD LEDGER</Text>

          <View style={styles.logsRow}>
            {/* ATTENDANCE LOGS */}
            <View style={styles.logCol}>
              <Text style={styles.logColTitle}>ATTENDANCE ENTRIES ({attLogs.length})</Text>
              {attLogs.length === 0 ? (
                <Text style={styles.noLogText}>No attendance records for today.</Text>
              ) : (
                attLogs.map((att) => (
                  <View key={att.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logDate}>{att.date}</Text>
                      <Badge status={att.status} size="sm" />
                    </View>
                    <Text style={styles.logSub}>
                      In: {att.check_in} | Out: {att.check_out} ({att.hours})
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* LEAVE LOGS */}
            <View style={styles.logCol}>
              <Text style={styles.logColTitle}>LEAVE APPLICATIONS ({leaveLogs.length})</Text>
              {leaveLogs.length === 0 ? (
                <Text style={styles.noLogText}>No recorded leave applications.</Text>
              ) : (
                leaveLogs.map((lv) => (
                  <View key={lv.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logDate}>{lv.leave_type}</Text>
                      <Badge status={lv.status} size="sm" />
                    </View>
                    <Text style={styles.logSub}>
                      {lv.start_date} to {lv.end_date} ({lv.days_count}d)
                    </Text>
                    <Text style={styles.logReason} numberOfLines={1}>
                      "{lv.reason}"
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  heroStrip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  heroMeta: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.inkPrimary,
  },
  heroTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSecondary,
  },
  heroDept: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },

  // Matrix
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  matrixItem: {
    width: '33.33%',
    padding: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  mLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  mVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },

  // History
  historySection: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  logsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  logCol: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 2,
  },
  logColTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkPrimary,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  noLogText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  logCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    borderRadius: 2,
    marginBottom: 6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  logSub: {
    fontSize: 10,
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
  logReason: {
    fontSize: 10,
    color: colors.inkMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
