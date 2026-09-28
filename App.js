import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import EmployeesScreen from "./src/screens/EmployeesScreen";
import AddEmployeeScreen from "./src/screens/AddEmployeeScreen";

export default function App() {
  const [screen, setScreen] = useState("employees");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F5"
      />

      <View style={styles.content}>
        {screen === "employees" ? (
          <EmployeesScreen
            onAddEmployee={() => setScreen("add")}
          />
        ) : (
          <AddEmployeeScreen
            onClose={() => setScreen("employees")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },

  content: {
    flex: 1,
  },
});