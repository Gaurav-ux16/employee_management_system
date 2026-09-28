import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { departmentApi } from '../api/client';

export function DepartmentsScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    leadName: '',
    description: '',
    budget: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      leadName: '',
      description: '',
      budget: '₹15,000,000',
      location: 'Building A - Floor 2',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      leadName: dept.leadName || '',
      description: dept.description || '',
      budget: dept.budget || '',
      location: dept.location || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Department name is required.';
    if (!formData.code.trim()) errs.code = 'Department code is required.';
    if (!formData.leadName.trim()) errs.leadName = 'Lead name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaveLoading(true);
      if (editingDept) {
        await departmentApi.update(editingDept.id, formData);
      } else {
        await departmentApi.create(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert('Failed to save department details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this department entry?')) {
      try {
        await departmentApi.delete(id);
        fetchDepartments();
      } catch (err) {
        alert('Failed to delete department.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSub}>ORGANIZATIONAL STRUCTURE</Text>
          <Text style={styles.sectionTitle}>
            Department Units <Text style={styles.countBadge}>({departments.length} Active)</Text>
          </Text>
        </View>
        <Button
          title="+ CREATE DEPARTMENT"
          onPress={handleOpenCreate}
          variant="primary"
          size="md"
        />
      </View>

      {/* DEPARTMENT TABLE LEDGER */}
      {loading ? (
        <LoadingState message="LOADING DEPARTMENT UNITS..." />
      ) : departments.length === 0 ? (
        <EmptyState
          title="NO DEPARTMENTS CONFIGURED"
          description="Create your organization's operational departments to assign employees and track budgets."
          actionTitle="CREATE DEPARTMENT"
          onAction={handleOpenCreate}
        />
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: 80 }]}>CODE</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DEPARTMENT NAME</Text>
            <Text style={[styles.th, { flex: 1 }]}>UNIT LEAD</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>DESCRIPTION & LOCATION</Text>
            <Text style={[styles.th, { width: 90 }]}>HEADCOUNT</Text>
            <Text style={[styles.th, { width: 110, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {departments.map((dept) => (
            <View key={dept.id} style={styles.tr}>
              <View style={{ width: 80 }}>
                <Text style={styles.codeTag}>{dept.code}</Text>
              </View>

              <View style={{ flex: 1.2 }}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <Text style={styles.deptBudget}>Budget: {dept.budget}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.leadName}>{dept.leadName}</Text>
                <Text style={styles.subText}>Department Lead</Text>
              </View>

              <View style={{ flex: 1.8 }}>
                <Text style={styles.descText} numberOfLines={2}>
                  {dept.description}
                </Text>
                <Text style={styles.locText}>📍 {dept.location}</Text>
              </View>

              <View style={{ width: 90 }}>
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{dept.employee_count || 0} STAFF</Text>
                </View>
              </View>

              <View style={styles.actionsCell}>
                <TouchableOpacity onPress={() => handleOpenEdit(dept)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>EDIT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(dept.id)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>DEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* DEPARTMENT FORM MODAL */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
        subtitle="ORGANIZATION // UNITS // CONFIG"
        width={600}
        footer={
          <>
            <Button
              title="CANCEL"
              variant="outline"
              onPress={() => setIsModalOpen(false)}
              disabled={saveLoading}
            />
            <Button
              title={editingDept ? 'SAVE CHANGES' : 'CREATE UNIT'}
              variant="primary"
              onPress={handleSave}
              loading={saveLoading}
            />
          </>
        }
      >
        <View style={styles.formGrid}>
          <View style={styles.rowTwo}>
            <Input
              label="DEPARTMENT NAME"
              value={formData.name}
              onChangeText={(v) => setFormData((p) => ({ ...p, name: v }))}
              placeholder="e.g. Engineering"
              error={errors.name}
              required
              style={{ flex: 1.5 }}
            />
            <Input
              label="UNIT CODE"
              value={formData.code}
              onChangeText={(v) => setFormData((p) => ({ ...p, code: v }))}
              placeholder="ENG"
              error={errors.code}
              required
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.rowTwo}>
            <Input
              label="UNIT LEAD / MANAGER"
              value={formData.leadName}
              onChangeText={(v) => setFormData((p) => ({ ...p, leadName: v }))}
              placeholder="Amit Joshi"
              error={errors.leadName}
              required
              style={{ flex: 1 }}
            />
            <Input
              label="ANNUAL BUDGET"
              value={formData.budget}
              onChangeText={(v) => setFormData((p) => ({ ...p, budget: v }))}
              placeholder="₹48,000,000"
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="OFFICE LOCATION / FLOOR"
            value={formData.location}
            onChangeText={(v) => setFormData((p) => ({ ...p, location: v }))}
            placeholder="Building A - Floor 4"
          />

          <Input
            label="DEPARTMENT DESCRIPTION & SCOPE"
            value={formData.description}
            onChangeText={(v) => setFormData((p) => ({ ...p, description: v }))}
            placeholder="Describe core functions and operational responsibilities..."
            multiline
            numberOfLines={3}
            error={errors.description}
            required
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeTag: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  deptName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.inkPrimary,
  },
  deptBudget: {
    fontSize: 10,
    color: colors.inkMuted,
    fontFamily: 'monospace',
  },
  leadName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkPrimary,
  },
  subText: {
    fontSize: 10,
    color: colors.inkMuted,
  },
  descText: {
    fontSize: 12,
    color: colors.inkSecondary,
    lineHeight: 16,
  },
  locText: {
    fontSize: 10,
    color: colors.inkMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  countPill: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },
  actionsCell: {
    width: 110,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  actionText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkPrimary,
    fontFamily: 'monospace',
  },

  // Modal Form
  formGrid: {
    flexDirection: 'column',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 16,
  },
});
