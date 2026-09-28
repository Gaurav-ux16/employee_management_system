import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const colors = {
  background: "#F7F7F5",
  surface: "#FFFFFF",
  border: "#E4E4DF",
  text: "#191919",
  muted: "#777772",
  primary: "#191919",
};

export default function AddEmployeeScreen({ onClose }) {
  const [form, setForm] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !form.employee_code ||
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.department
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all required fields."
      );
      return;
    }

    Alert.alert(
      "Employee added",
      `${form.first_name} ${form.last_name} has been added.`,
      [
        {
          text: "OK",
          onPress: onClose,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add Employee</Text>

          <Text style={styles.subtitle}>
            Add a new employee to the organization
          </Text>
        </View>

        <Pressable onPress={onClose}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Field
          label="Employee ID"
          required
          value={form.employee_code}
          onChangeText={(value) =>
            updateField("employee_code", value)
          }
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Field
              label="First name"
              required
              value={form.first_name}
              onChangeText={(value) =>
                updateField("first_name", value)
              }
            />
          </View>

          <View style={styles.half}>
            <Field
              label="Last name"
              required
              value={form.last_name}
              onChangeText={(value) =>
                updateField("last_name", value)
              }
            />
          </View>
        </View>

        <Field
          label="Email"
          required
          value={form.email}
          keyboardType="email-address"
          onChangeText={(value) =>
            updateField("email", value)
          }
        />

        <Field
          label="Phone"
          value={form.phone}
          keyboardType="phone-pad"
          onChangeText={(value) =>
            updateField("phone", value)
          }
        />

        <Field
          label="Department"
          required
          value={form.department}
          onChangeText={(value) =>
            updateField("department", value)
          }
        />

        <Field
          label="Designation"
          value={form.designation}
          onChangeText={(value) =>
            updateField("designation", value)
          }
        />

        <Pressable
          style={styles.submit}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Add Employee
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  required,
  value,
  onChangeText,
  keyboardType,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#999"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 28,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: colors.muted,
  },

  back: {
    fontSize: 14,
    color: colors.text,
    textDecorationLine: "underline",
  },

  form: {
    maxWidth: 700,
  },

  row: {
    flexDirection: "row",
    gap: 14,
  },

  half: {
    flex: 1,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 7,
  },

  required: {
    color: "#B54A4A",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    fontSize: 14,
    color: colors.text,
  },

  submit: {
    height: 46,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});