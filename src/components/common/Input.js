import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  helperText,
  style,
  inputStyle,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          multiline && { height: 24 * numberOfLines + 12, textAlignVertical: 'top' },
          inputStyle,
        ]}
      />
      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.inkPrimary,
    fontFamily: 'System',
  },
  inputFocused: {
    borderColor: colors.inkPrimary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#B91C1C',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  helperText: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
