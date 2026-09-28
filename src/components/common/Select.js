import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { colors } from '../../theme/colors';

export function Select({
  label,
  options = [], // [{ label: 'Engineering', value: 'Engineering' }]
  value,
  onSelect,
  placeholder = 'Select option...',
  error,
  required = false,
  style,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value || o === value);
  const displayLabel = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        style={[styles.selectBox, error && styles.selectBoxError]}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      {/* Dropdown Modal */}
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>SELECT {label || 'OPTION'}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => {
                const optVal = typeof item === 'object' ? item.value : item;
                const optLabel = typeof item === 'object' ? item.label : item;
                const isSelected = optVal === value;

                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onSelect(optVal);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {optLabel}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSecondary,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  required: {
    color: colors.accent,
  },
  selectBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxError: {
    borderColor: '#B91C1C',
    backgroundColor: '#FEF2F2',
  },
  selectText: {
    fontSize: 13,
    color: colors.inkPrimary,
  },
  placeholderText: {
    color: colors.inkMuted,
  },
  chevron: {
    fontSize: 11,
    color: colors.inkSecondary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 23, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.inkPrimary,
    width: 320,
    maxHeight: 360,
    borderRadius: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  menuHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkSecondary,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#F2F4F0',
  },
  optionText: {
    fontSize: 13,
    color: colors.inkPrimary,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
});
