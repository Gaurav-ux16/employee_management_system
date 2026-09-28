import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { employeeApi } from '../api/client';

const DEPARTMENTS_FILTER = [
  { label: 'ALL DEPARTMENTS', value: 'ALL' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Human Resources', value: 'Human Resources' },
  { label: 'Finance & Accounts', value: 'Finance & Accounts' },
  { label: 'Operations & Logistics', value: 'Operations & Logistics' },
  { label: 'Marketing & Brand', value: 'Marketing & Brand' },
];

const STATUS_FILTER = [
  { label: 'ALL STATUSES', value: 'ALL' },
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'ON LEAVE', value: 'ON_LEAVE' },
  { label: 'TERMINATED', value: 'TERMINATED' },
];

export function EmployeesScreen({ onQuickAddTriggered, onClearQuickAdd }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAll({ search, department, status });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status]);

  // Handle Quick Add trigger from layout
  useEffect(() => {
    if (onQuickAddTriggered) {
      setEditingEmp(null);
      setIsFormOpen(true);
      onClearQuickAdd && onClearQuickAdd();
    }
  }, [onQuickAddTriggered]);

  const handleOpenCreate = () => {
    setEditingEmp(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (emp) => {
    setSelectedEmp(emp);
    setIsDetailOpen(true);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      setFormLoading(true);
      if (editingEmp) {
        await employeeApi.update(editingEmp.id, formData);
      } else {
        await employeeApi.create(formData);
      }
      setIsFormOpen(false);
      setEditingEmp(null);
      fetchEmployees();
    } catch (err) {
      alert('Failed to save employee record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm('Are you sure you want to permanently delete this employee record?')) {
      try {
        await employeeApi.delete(id);
        setIsDetailOpen(false);
        fetchEmployees();
      } catch (err) {
        alert('Failed to delete employee record.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSub}>WORKSPACE DIRECTORY</Text>
          <Text style={styles.sectionTitle}>
            Employee Records Ledger{' '}
            <Text style={styles.countBadge}>({employees.length} Records)</Text>
          </Text>
        </View>
        <Button
          title="+ ONBOARD NEW EMPLOYEE"
          onPress={handleOpenCreate}
          variant="primary"
          size="md"
        />
      </View>

      {/* FILTER & SEARCH CONTROL BAR */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search code, name, email, designation..."
            style={styles.noMarginInput}
          />
        </View>
        <View style={styles.filterGroup}>
          <Select
            options={DEPARTMENTS_FILTER}
            value={department}
            onSelect={setDepartment}
            placeholder="Department"
            style={styles.noMarginSelect}
          />
          <Select
            options={STATUS_FILTER}
            value={status}
            onSelect={setStatus}
            placeholder="Status"
            style={styles.noMarginSelect}
          />
          {(search || department !== 'ALL' || status !== 'ALL') && (
            <Button
              title="RESET FILTERS"
              variant="outline"
              size="sm"
              onPress={() => {
                setSearch('');
                setDepartment('ALL');
                setStatus('ALL');
              }}
            />
          )}
        </View>
      </View>

      {/* EMPLOYEE DATA TABLE */}
      {loading ? (
        <LoadingState message="FETCHING EMPLOYEE LEDGER..." />
      ) : employees.length === 0 ? (
        <EmptyState
          title="NO EMPLOYEES MATCH QUERY"
          description="Try clearing search keywords or department filters to view active employee records."
          actionTitle="ADD NEW EMPLOYEE"
          onAction={handleOpenCreate}
        />
      ) : (
        <View style={styles.tableCard}>
          {/* TABLE HEADER */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: 90 }]}>CODE</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>EMPLOYEE IDENTITY</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>DEPARTMENT & DESIGNATION</Text>
            <Text style={[styles.th, { width: 110 }]}>JOINED</Text>
            <Text style={[styles.th, { width: 100 }]}>SALARY</Text>
            <Text style={[styles.th, { width: 100 }]}>STATUS</Text>
            <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {/* TABLE ROWS */}
          {employees.map((emp) => {
            const isSelected = selectedEmp?.id === emp.id;
            return (
              <TouchableOpacity
                key={emp.id}
                activeOpacity={0.85}
                onPress={() => handleOpenDetail(emp)}
                style={[styles.tr, isSelected && styles.trSelected]}
              >
                <Text style={styles.tdCode}>{emp.employee_code}</Text>

                <View style={[styles.tdCell, { flex: 1.4, flexDirection: 'row', gap: 10 }]}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>{emp.avatar || 'EM'}</Text>
                  </View>
                  <View>
                    <Text style={styles.empName}>
                      {emp.first_name} {emp.last_name}
                    </Text>
                    <Text style={styles.empEmail}>{emp.email}</Text>
                  </View>
                </View>

                <View style={[styles.tdCell, { flex: 1.4 }]}>
                  <Text style={styles.empRole}>{emp.designation}</Text>
                  <Text style={styles.empDept}>{emp.department}</Text>
                </View>

                <Text style={[styles.tdText, { width: 110 }]}>{emp.date_of_joining}</Text>
                <Text style={[styles.tdSalary, { width: 100 }]}>{emp.salary}</Text>

                <View style={{ width: 100 }}>
                  <Badge status={emp.status} size="sm" />
                </View>

                <View style={styles.actionsCell}>
                  <TouchableOpacity
                    onPress={() => handleOpenDetail(emp)}
                    style={styles.actionLinkBtn}
                  >
                    <Text style={styles.actionLinkText}>VIEW</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(emp)}
                    style={styles.actionLinkBtn}
                  >
                    <Text style={styles.actionLinkText}>EDIT</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* MODALS */}
      <EmployeeFormModal
        visible={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmp(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmp}
        loading={formLoading}
      />

      <EmployeeDetailModal
        visible={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        employee={selectedEmp}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteEmployee}
      />
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

  // Filter Bar
  filterBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noMarginInput: {
    marginBottom: 0,
  },
  noMarginSelect: {
    marginBottom: 0,
    width: 170,
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
  trSelected: {
    backgroundColor: '#F3F4F0',
  },
  tdCode: {
    width: 90,
    fontSize: 11,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  tdCell: {
    justifyContent: 'center',
  },
  avatarMini: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  empName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  empEmail: {
    fontSize: 10,
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },
  empRole: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  empDept: {
    fontSize: 10,
    color: colors.inkSecondary,
  },
  tdText: {
    fontSize: 11,
    color: colors.inkSecondary,
    fontFamily: 'monospace',
  },
  tdSalary: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  actionsCell: {
    width: 130,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionLinkBtn: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  actionLinkText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
});
