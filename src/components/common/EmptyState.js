import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from './Button';

export function EmptyState({
  title = 'NO RECORDS FOUND',
  description = 'There are no active entries matching your specified filter criteria.',
  actionTitle,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>[ ∅ ]</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 2,
    marginVertical: 12,
  },
  symbol: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: colors.inkMuted,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkPrimary,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: colors.inkSecondary,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 18,
  },
  btn: {
    marginTop: 14,
  },
});
