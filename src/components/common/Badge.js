import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export function Badge({ status, text, size = 'md' }) {
  const statusKey = status ? status.toLowerCase() : 'active';
  
  let config = colors.status.active;
  if (statusKey === 'present' || statusKey === 'active') config = colors.status.present;
  if (statusKey === 'absent' || statusKey === 'rejected') config = colors.status.absent;
  if (statusKey === 'half_day' || statusKey === 'halfday') config = colors.status.halfDay;
  if (statusKey === 'pending') config = colors.status.pending;
  if (statusKey === 'approved') config = colors.status.approved;
  if (statusKey === 'on_leave' || statusKey === 'onleave') config = colors.status.onLeave;

  const displayLabel = (text || status || '').toUpperCase().replace('_', ' ');

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        size === 'sm' && styles.smBadge,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text }, size === 'sm' && styles.smText]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  smBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 1,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  smText: {
    fontSize: 10,
  },
});
