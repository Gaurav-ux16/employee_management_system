import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size = 'md',          // 'sm' | 'md' | 'lg'
  icon: IconComponent,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: isHovered ? colors.primaryHover : colors.primary,
          border: colors.primary,
          text: colors.inkContrast,
        };
      case 'secondary':
        return {
          bg: isHovered ? '#E5E7E2' : colors.surfaceSecondary,
          border: colors.border,
          text: colors.inkPrimary,
        };
      case 'outline':
        return {
          bg: isHovered ? colors.surfaceSecondary : 'transparent',
          border: colors.borderDark,
          text: colors.inkPrimary,
        };
      case 'danger':
        return {
          bg: isHovered ? '#991B1B' : '#B91C1C',
          border: '#B91C1C',
          text: colors.inkContrast,
        };
      case 'success':
        return {
          bg: isHovered ? '#046C4E' : '#047857',
          border: '#047857',
          text: colors.inkContrast,
        };
      case 'ghost':
        return {
          bg: isHovered ? colors.surfaceSecondary : 'transparent',
          border: 'transparent',
          text: colors.inkSecondary,
        };
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: colors.inkContrast,
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      // @ts-ignore for Web hover
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.button,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          opacity: disabled ? 0.5 : 1,
        },
        size === 'sm' && styles.btnSm,
        size === 'lg' && styles.btnLg,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.text} />
      ) : (
        <View style={styles.contentRow}>
          {IconComponent && (
            <IconComponent
              size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
              color={currentVariant.text}
              style={{ marginRight: title ? 6 : 0 }}
            />
          )}
          {title ? (
            <Text
              style={[
                styles.text,
                { color: currentVariant.text },
                size === 'sm' && styles.textSm,
                size === 'lg' && styles.textLg,
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnSm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  btnLg: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 11,
  },
  textLg: {
    fontSize: 13,
  },
});
