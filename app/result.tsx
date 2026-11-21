import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { TeamCard } from '@/components/TeamCard'
import { useSessionStore } from '@/stores/sessionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getTeamsData } from '@/data'
import { drawTeams } from '@/services/draw'
import { colors, spacing, radius, fontSize } from '@/constants/theme'
import { FIFA_VERSIONS } from '@/types'
import * as Haptics from 'expo-haptics'
import { UCL_TEAMS } from '@/data/ucl-teams'

export default function ResultScreen() {
  const { currentResult, selectedVersion, setCurrentResult, tournament, advanceTournamentRound } = useSessionStore()
  const { ratingDiff, getLeagueFilter, playerNames } = useSettingsStore()

  const anim1 = useRef(new Animated.Value(0)).current
  const animVs = useRef(new Animated.Value(0)).current
  const anim2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!currentResult || !selectedVersion) {
      router.replace('/')
      return
    }
    anim1.setValue(0)
    animVs.setValue(0)
    anim2.setValue(0)
    Animated.stagger(120, [
      Animated.spring(anim1, { toValue: 1, useNativeDriver: true }),
      Animated.spring(animVs, { toValue: 1, useNativeDriver: true }),
      Animated.spring(anim2, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }, [currentResult])

  function animStyle(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [
        { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      ],
    }
  }

  if (!currentResult || !selectedVersion) return null

  const versionLabel =
    FIFA_VERSIONS.find((v) => v.value === selectedVersion)?.label ?? selectedVersion
  const ratingDiffActual = Math.abs(
    currentResult.team1.overall - currentResult.team2.overall,
  )

  function handleRedraw() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (!selectedVersion) return

    const data = getTeamsData(selectedVersion)
    const excludedIds = tournament?.active ? tournament.usedTeamIds : undefined

    let pool: typeof data.teams
    if (tournament?.active && tournament.competition === 'champions-league') {
      const uclIds = UCL_TEAMS[selectedVersion] ?? []
      pool = data.teams.filter((t) => uclIds.includes(t.id))
    } else {
      const leagueFilter = getLeagueFilter(selectedVersion)
      pool = leagueFilter ? data.teams.filter((t) => leagueFilter.includes(t.leagueId)) : data.teams
    }

    const outcome = drawTeams(pool, null, ratingDiff, selectedVersion, excludedIds)

    if (!outcome.ok) {
      if (tournament?.active) {
        router.replace('/tournament-summary')
        return
      }
      Alert.alert('Erro no sorteio', 'Não foi possível sortear com os filtros atuais.')
      return
    }

    if (tournament?.active) advanceTournamentRound(outcome.result)
    setCurrentResult(outcome.result)
  }

  function handleEncerrar() {
    router.replace('/tournament-summary')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => tournament?.active ? handleEncerrar() : router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{versionLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/history')}
              accessibilityLabel="Histórico de sorteios"
            >
              <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        {tournament?.active && (
          <View style={styles.roundBadge}>
            <Text style={styles.roundBadgeText}>Rodada {tournament.rounds.length}</Text>
          </View>
        )}
        <Text style={styles.title}>Resultado</Text>

        {/* Teams */}
        <View style={styles.teamsSection}>
          <View style={styles.teamsRow}>
            <Animated.View style={[{ flex: 1 }, animStyle(anim1)]}>
              <TeamCard team={currentResult.team1} playerLabel={playerNames.p1 || 'Jogador 1'} />
            </Animated.View>

            <Animated.View style={[styles.vsContainer, animStyle(animVs)]}>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
            </Animated.View>

            <Animated.View style={[{ flex: 1 }, animStyle(anim2)]}>
              <TeamCard team={currentResult.team2} playerLabel={playerNames.p2 || 'Jogador 2'} />
            </Animated.View>
          </View>

          {/* Rating diff badge */}
          <View style={styles.ratingInfo}>
            {ratingDiff !== 'free' && (
              <Text style={styles.ratingInfoText}>
                Diferença:{' '}
                <Text style={styles.ratingDiffValue}>{ratingDiffActual} pt(s)</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.redrawButton}
            onPress={handleRedraw}
            activeOpacity={0.85}
          >
            <Ionicons name="shuffle" size={20} color={colors.background} />
            <Text style={styles.redrawButtonText}>
              {tournament?.active ? 'Próxima Rodada' : 'Sortear Novamente'}
            </Text>
          </TouchableOpacity>
          {tournament?.active && (
            <TouchableOpacity
              style={styles.endTournamentButton}
              onPress={handleEncerrar}
              activeOpacity={0.85}
            >
              <Text style={styles.endTournamentButtonText}>Encerrar Torneio</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  versionBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  versionBadgeText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  teamsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.primary,
  },
  ratingInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 28,
  },
  ratingInfoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  ratingDiffValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  roundBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  roundBadgeText: {
    color: colors.background,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  endTournamentButton: {
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  endTournamentButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  redrawButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  redrawButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.background,
  },
})
