import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export function LoadingState({ message = 'LOADING OPERATIONS DATA...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.inkPrimary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSecondary,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginTop: 12,
  },
});
