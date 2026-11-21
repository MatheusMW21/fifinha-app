import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FifaVersion, FIFA_VERSIONS } from '../types'
import { colors, spacing, radius, fontSize } from '../constants/theme'

interface FifaVersionPickerProps {
  selected: FifaVersion | null
  onSelect: (version: FifaVersion) => void
}

export function FifaVersionPicker({ selected, onSelect }: FifaVersionPickerProps) {
  return (
    <View style={styles.grid}>
      {FIFA_VERSIONS.map(({ value, label }) => {
        const isSelected = selected === value
        return (
          <TouchableOpacity
            key={value}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  card: {
    // 3 columns with gap: (100% - 2*gap) / 3, approximated with minWidth
    flexBasis: '30%',
    flexGrow: 1,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: colors.surfaceActive,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
})
