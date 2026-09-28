import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { employees } from "../data/mockData";

const colors = {
  background: "#F7F7F5",
  surface: "#FFFFFF",
  border: "#E4E4DF",
  text: "#191919",
  muted: "#777772",
};

const tabs = [
  {
    key: "PRESENT",
    label: "Present",
  },
  {
    key: "ABSENT",
    label: "Absent",
  },
  {
    key: "HALF_DAY",
    label: "Half Day",
  },
];

export default function EmployeesScreen({
  status,
  onAddEmployee,
}) {
  const [localStatus, setLocalStatus] = useState(
    status || "PRESENT"
  );

  const activeStatus = status || localStatus;

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (employee) => employee.status === activeStatus
    );
  }, [activeStatus]);

  const grouped = filteredEmployees.reduce(
    (groups, employee) => {
      if (!groups[employee.department]) {
        groups[employee.department] = [];
      }

      groups[employee.department].push(employee);

      return groups;
    },
    {}
  );

  const getCount = (key) =>
    employees.filter(
      (employee) => employee.status === key
    ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Employee Management
          </Text>

          <Text style={styles.subtitle}>
            Attendance overview
          </Text>
        </View>

        <Text style={styles.today}>Today</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const active = activeStatus === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => setLocalStatus(tab.key)}
              style={[
                styles.tab,
                active && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  active && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>

              <Text
                style={[
                  styles.count,
                  active && styles.activeCount,
                ]}
              >
                {getCount(tab.key)}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={onAddEmployee}
          style={styles.addTab}
        >
          <Text style={styles.addText}>
            + Add Employee
          </Text>
        </Pressable>
      </View>

      <View style={styles.headingRow}>
        <Text style={styles.sectionTitle}>
          {tabs.find(
            (tab) => tab.key === activeStatus
          )?.label}
        </Text>

        <Text style={styles.total}>
          {filteredEmployees.length} employees
        </Text>
      </View>

      {Object.entries(grouped).map(
        ([department, departmentEmployees]) => (
          <View
            key={department}
            style={styles.department}
          >
            <View style={styles.departmentHeader}>
              <Text style={styles.departmentName}>
                {department}
              </Text>

              <Text style={styles.departmentCount}>
                {departmentEmployees.length}
              </Text>
            </View>

            <View style={styles.list}>
              {departmentEmployees.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                />
              ))}
            </View>
          </View>
        )
      )}

      {filteredEmployees.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            No employees
          </Text>

          <Text style={styles.emptyText}>
            There are currently no employees in this category.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function EmployeeRow({ employee }) {
  const initials =
    `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();

  return (
    <View style={styles.employee}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>
          {initials}
        </Text>
      </View>

      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>
          {employee.first_name} {employee.last_name}
        </Text>

        <Text style={styles.designation}>
          {employee.designation}
        </Text>
      </View>

      <Text style={styles.departmentText}>
        {employee.department}
      </Text>
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
    marginBottom: 24,
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

  today: {
    fontSize: 13,
    color: colors.muted,
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 28,
  },

  tab: {
    height: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },

  activeTab: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },

  tabText: {
    fontSize: 14,
    color: colors.text,
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  count: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.muted,
  },

  activeCount: {
    color: "#FFFFFF",
  },

  addTab: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: colors.text,
    justifyContent: "center",
    marginBottom: 8,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },

  total: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.muted,
  },

  department: {
    marginBottom: 22,
  },

  departmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  departmentName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  departmentCount: {
    marginLeft: 7,
    fontSize: 12,
    color: colors.muted,
  },

  list: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  employee: {
    minHeight: 66,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECECE8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  initials: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  employeeInfo: {
    flex: 1,
  },

  employeeName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  designation: {
    marginTop: 3,
    fontSize: 12,
    color: colors.muted,
  },

  departmentText: {
    width: 130,
    fontSize: 12,
    color: colors.muted,
  },

  empty: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 30,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: colors.muted,
  },
});