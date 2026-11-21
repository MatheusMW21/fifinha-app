import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { FifaVersionPicker } from '@/components/FifaVersionPicker'
import { useSessionStore } from '@/stores/sessionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getTeamsData } from '@/data'
import { drawTeams } from '@/services/draw'
import { colors, spacing, radius, fontSize } from '@/constants/theme'
import { FifaVersion } from '@/types'
import * as Haptics from 'expo-haptics'
import { UCL_TEAMS } from '@/data/ucl-teams'

export default function HomeScreen() {
  const { selectedVersion, setVersion, setCurrentResult, startTournament, advanceTournamentRound } = useSessionStore()
  const { ratingDiff, getLeagueFilter } = useSettingsStore()
  const [isDrawing, setIsDrawing] = useState(false)

  function handleDraw() {
    if (isDrawing || !selectedVersion) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsDrawing(true)
    setTimeout(() => {
      const data = getTeamsData(selectedVersion)
      const leagueFilter = getLeagueFilter(selectedVersion)
      const outcome = drawTeams(data.teams, leagueFilter, ratingDiff, selectedVersion)
      setIsDrawing(false)

      if (!outcome.ok) {
        if (outcome.error === 'NO_DATA') {
          Alert.alert(
            'Dados indisponíveis',
            'Os dados desta versão ainda não foram adicionados. Consulte o DATA.md para gerar ou adicionar manualmente.',
          )
          return
        }
        if (outcome.error === 'EMPTY_POOL') {
          Alert.alert(
            'Sem times disponíveis',
            'Nenhum time encontrado com os filtros selecionados. Ajuste as ligas nas configurações.',
          )
          return
        }
        if (outcome.error === 'NO_VALID_PAIR') {
          Alert.alert(
            'Diferença de rating inatingível',
            `Não foi possível encontrar dois times com diferença de até ${ratingDiff} ponto(s) para os filtros selecionados.\n\nTente aumentar a diferença ou usar "Livre" nas configurações.`,
          )
          return
        }
        return
      }

      setCurrentResult(outcome.result)
      router.push('/result')
    }, 0)
  }

  function handleStartTournament() {
    if (isDrawing || !selectedVersion) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsDrawing(true)
    setTimeout(() => {
      const data = getTeamsData(selectedVersion)
      const uclIds = UCL_TEAMS[selectedVersion] ?? []
      const pool = data.teams.filter((t) => uclIds.includes(t.id))
      if (pool.length < 2) {
        setIsDrawing(false)
        Alert.alert('Sem dados', 'Times da Champions League não disponíveis para esta versão.')
        return
      }
      const outcome = drawTeams(pool, null, ratingDiff, selectedVersion)
      setIsDrawing(false)
      if (!outcome.ok) {
        Alert.alert('Sem times suficientes', 'Não foi possível iniciar o torneio com os filtros atuais.')
        return
      }
      startTournament(selectedVersion, 'champions-league')
      advanceTournamentRound(outcome.result)
      setCurrentResult(outcome.result)
      router.push('/result')
    }, 0)
  }

  const canDraw = !!selectedVersion

  const availableTeamsCount = selectedVersion
    ? (() => {
      const data = getTeamsData(selectedVersion)
      const leagueFilter = getLeagueFilter(selectedVersion)
      if (!data.teams?.length) return 0
      if (leagueFilter === null) return data.teams.length
      return data.teams.filter((t) => leagueFilter.includes(t.leagueId)).length
    })()
    : 0

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/history')}
            accessibilityLabel="Histórico de sorteios"
          >
            <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Configurações"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>FIFINHA</Text>
          <Text style={styles.subtitle}>Selecione a versão do FIFA</Text>
        </View>

        {/* Version Picker */}
        <View style={styles.pickerSection}>
          <FifaVersionPicker
            selected={selectedVersion}
            onSelect={(v: FifaVersion) => setVersion(v)}
          />
        </View>

        {/* Config summary */}
        {selectedVersion && (
          <TouchableOpacity
            style={styles.configSummary}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={14} color={colors.textMuted} />
            <Text style={styles.configSummaryText}>
              Rating: {ratingDiff === 'free' ? 'Livre' : `±${ratingDiff} pts`}
              {'  ·  '}
              {getLeagueFilter(selectedVersion) === null
                ? 'Todas as ligas'
                : `${getLeagueFilter(selectedVersion)!.length} liga(s)`}
              {'  ·  '}
              {availableTeamsCount} time(s)
            </Text>
          </TouchableOpacity>
        )}

        {/* Draw Button */}
        <View style={styles.footer}>
          {!canDraw && (
            <Text style={styles.hint}>Selecione uma versão para continuar</Text>
          )}
          <TouchableOpacity
            style={[styles.drawButton, (!canDraw || isDrawing) && styles.drawButtonDisabled]}
            onPress={handleDraw}
            disabled={!canDraw || isDrawing}
            activeOpacity={0.85}
          >
            {isDrawing ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={canDraw ? colors.background : colors.textMuted}
                />
                <Text style={[styles.drawButtonText, !canDraw && styles.drawButtonTextDisabled]}>
                  Sortear Times
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tournamentButton, !canDraw && styles.tournamentButtonDisabled]}
            onPress={handleStartTournament}
            disabled={!canDraw || isDrawing}
            activeOpacity={0.85}
          >
            <Ionicons name="trophy-outline" size={20} color={canDraw ? colors.primary : colors.textMuted} />
            <Text style={[styles.tournamentButtonText, !canDraw && styles.tournamentButtonTextDisabled]}>
              Champions League
            </Text>
          </TouchableOpacity>
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
    paddingVertical: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pickerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  configSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  configSummaryText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  hint: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  drawButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  drawButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  drawButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.background,
    letterSpacing: 0.5,
  },
  drawButtonTextDisabled: {
    color: colors.textMuted,
  },
  tournamentButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tournamentButtonDisabled: {
    borderColor: colors.surfaceElevated,
  },
  tournamentButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  tournamentButtonTextDisabled: {
    color: colors.textMuted,
  },
})
