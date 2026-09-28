import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { EditorialLayout } from './src/components/navigation/EditorialLayout';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { EmployeesScreen } from './src/screens/EmployeesScreen';
import { DepartmentsScreen } from './src/screens/DepartmentsScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { LeavesScreen } from './src/screens/LeavesScreen';
import { dashboardApi } from './src/api/client';
import { colors } from './src/theme/colors';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [quickAddTriggered, setQuickAddTriggered] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to update rail stats:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentSection('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleQuickAction = () => {
    setCurrentSection('employees');
    setQuickAddTriggered(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <StatusBar barStyle="dark-content" />
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appSafeArea}>
      <StatusBar barStyle="light-content" />
      <EditorialLayout
        currentSection={currentSection}
        onNavigate={(sec) => {
          setCurrentSection(sec);
          setQuickAddTriggered(false);
        }}
        currentUser={user}
        onLogout={handleLogout}
        onQuickAction={handleQuickAction}
        stats={stats}
      >
        {currentSection === 'dashboard' && (
          <DashboardScreen onNavigate={(sec) => setCurrentSection(sec)} />
        )}
        {currentSection === 'employees' && (
          <EmployeesScreen
            onQuickAddTriggered={quickAddTriggered}
            onClearQuickAdd={() => setQuickAddTriggered(false)}
          />
        )}
        {currentSection === 'departments' && <DepartmentsScreen />}
        {currentSection === 'attendance' && <AttendanceScreen />}
        {currentSection === 'leaves' && <LeavesScreen />}
      </EditorialLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authSafeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appSafeArea: {
    flex: 1,
    backgroundColor: colors.railBg,
  },
});
