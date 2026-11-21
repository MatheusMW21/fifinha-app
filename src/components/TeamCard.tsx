import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Team } from '../types'
import { colors, spacing, radius, fontSize } from '../constants/theme'

interface TeamCardProps {
  team: Team
  playerLabel: string
}

function getOverallColor(overall: number): string {
  if (overall >= 90) return '#FFD700'
  if (overall >= 85) return '#E8C84B'
  if (overall >= 80) return '#C0C0C0'
  if (overall >= 75) return '#CD9B50'
  return '#CD7F32'
}

export function TeamCard({ team, playerLabel }: TeamCardProps) {
  const overallColor = getOverallColor(team.overall)

  return (
    <View style={styles.card}>
      <Text style={styles.playerLabel}>{playerLabel}</Text>

      <View style={[styles.overallBadge, { borderColor: overallColor }]}>
        <Text style={[styles.overallText, { color: overallColor }]}>{team.overall}</Text>
      </View>

      <Text style={styles.teamName} numberOfLines={2}>
        {team.name}
      </Text>
      <Text style={styles.leagueName} numberOfLines={1}>
        {team.league}
      </Text>
      <Text style={styles.nationName} numberOfLines={1}>
        {team.nation}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  overallBadge: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  overallText: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
  },
  teamName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  leagueName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nationName: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
