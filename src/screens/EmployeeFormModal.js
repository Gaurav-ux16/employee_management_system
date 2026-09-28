import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { colors } from '../theme/colors';

const DEPARTMENTS_LIST = [
  'Engineering',
  'Human Resources',
  'Finance & Accounts',
  'Operations & Logistics',
  'Marketing & Brand',
];

const STATUS_LIST = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];

export function EmployeeFormModal({
  visible,
  onClose,
  onSave,
  employee = null, // null for Create, object for Edit
  loading = false,
}) {
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_joining: '',
    salary: '',
    department: 'Engineering',
    designation: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        date_of_joining: employee.date_of_joining || '',
        salary: employee.salary || '',
        department: employee.department || 'Engineering',
        designation: employee.designation || '',
        status: employee.status || 'ACTIVE',
      });
    } else {
      setFormData({
        employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        salary: '₹1,200,000',
        department: 'Engineering',
        designation: '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [employee, visible]);

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.employee_code.trim()) errs.employee_code = 'Employee code is required.';
    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.designation.trim()) errs.designation = 'Designation / Title is required.';
    if (!formData.date_of_joining.trim()) errs.date_of_joining = 'Date of joining is required.';
    if (!formData.salary.trim()) errs.salary = 'Salary specification is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const isEdit = !!employee;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? `Edit Record: ${employee?.first_name} ${employee?.last_name}` : 'Onboard New Employee'}
      subtitle={isEdit ? `ID: ${employee?.employee_code}` : 'SYSTEM // EMPLOYEES // CREATE'}
      width={720}
      footer={
        <>
          <Button title="CANCEL" onPress={onClose} variant="outline" disabled={loading} />
          <Button
            title={isEdit ? 'SAVE CHANGES' : 'COMMIT RECORD'}
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
          />
        </>
      }
    >
      <View style={styles.formGrid}>
        {/* SECTION 1: IDENTITY & SYSTEM METADATA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SECTION 1 // IDENTIFICATION & ROLE</Text>
        </View>

        <View style={styles.rowTwo}>
          <Input
            label="EMPLOYEE CODE"
            value={formData.employee_code}
            onChangeText={(v) => updateField('employee_code', v)}
            placeholder="e.g. EMP-1019"
            error={errors.employee_code}
            required
            style={{ flex: 1 }}
          />
          <Select
            label="EMPLOYMENT STATUS"
            options={STATUS_LIST}
            value={formData.status}
            onSelect={(v) => updateField('status', v)}
            required
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.rowTwo}>
          <Input
            label="FIRST NAME"
            value={formData.first_name}
            onChangeText={(v) => updateField('first_name', v)}
            placeholder="Rahul"
            error={errors.first_name}
            required
            style={{ flex: 1 }}
          />
          <Input
            label="LAST NAME"
            value={formData.last_name}
            onChangeText={(v) => updateField('last_name', v)}
            placeholder="Sharma"
            error={errors.last_name}
            required
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.rowTwo}>
          <Select
            label="DEPARTMENT"
            options={DEPARTMENTS_LIST}
            value={formData.department}
            onSelect={(v) => updateField('department', v)}
            required
            style={{ flex: 1 }}
          />
          <Input
            label="DESIGNATION / TITLE"
            value={formData.designation}
            onChangeText={(v) => updateField('designation', v)}
            placeholder="e.g. Senior Backend Engineer"
            error={errors.designation}
            required
            style={{ flex: 1 }}
          />
        </View>

        {/* SECTION 2: CONTACT & COMPENSATION */}
        <View style={[styles.sectionHeader, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>SECTION 2 // CONTACT & COMPENSATION</Text>
        </View>

        <View style={styles.rowTwo}>
          <Input
            label="WORK EMAIL"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="rahul.sharma@ops.co"
            keyboardType="email-address"
            error={errors.email}
            required
            style={{ flex: 1 }}
          />
          <Input
            label="PHONE NUMBER"
            value={formData.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="+91 98201 44321"
            error={errors.phone}
            required
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.rowTwo}>
          <Input
            label="DATE OF JOINING (YYYY-MM-DD)"
            value={formData.date_of_joining}
            onChangeText={(v) => updateField('date_of_joining', v)}
            placeholder="2026-09-01"
            error={errors.date_of_joining}
            required
            style={{ flex: 1 }}
          />
          <Input
            label="SALARY PACKAGE (ANNUAL)"
            value={formData.salary}
            onChangeText={(v) => updateField('salary', v)}
            placeholder="₹1,800,000"
            error={errors.salary}
            required
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  formGrid: {
    flexDirection: 'column',
  },
  sectionHeader: {
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 16,
  },
});
