import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext';

export default function BtnTheme({ compact = false }) {
  const { mode, toggle, colors } = useTheme();
  const isDark = mode === 'dark';

  const icon = isDark ? 'sunny-outline' : 'moon-outline';
  const bg = isDark ? colors.primary : colors.card;
  const border = isDark ? colors.primary : colors.border;
  const iconColor = isDark ? colors.onPrimary : colors.text;

  return (
    <TouchableOpacity
      onPress={toggle}
      style={{
        paddingHorizontal: compact ? 10 : 12,
        paddingVertical: compact ? 6 : 8,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: bg,
        borderColor: border,
        marginLeft: 8,
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={16} color={iconColor} />
    </TouchableOpacity>
  );
}
