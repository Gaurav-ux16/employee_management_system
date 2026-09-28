import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export function Card({
  title,
  subtitle,
  action,
  children,
  style,
  headerStyle,
  noPadding = false,
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle || action) && (
        <View style={[styles.header, headerStyle]}>
          <View>
            {subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
          {action && <View style={styles.action}>{action}</View>}
        </View>
      )}
      <View style={[!noPadding && styles.body]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.inkMuted,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkPrimary,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    padding: 16,
  },
});
