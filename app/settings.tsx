import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useSettingsStore } from '@/stores/settingsStore'
import { useSessionStore } from '@/stores/sessionStore'
import { getTeamsData } from '@/data'
import { colors, spacing, radius, fontSize } from '@/constants/theme'
import { RatingDiff, RATING_DIFF_OPTIONS, League } from '@/types'
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { ratingDiff, setRatingDiff, setLeagueFilter, getLeagueFilter, playerNames, setPlayerName } = useSettingsStore()
  const { selectedVersion } = useSessionStore()

  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[] | null>(null)
  useEffect(() => {
    if (!selectedVersion) return
    const data = getTeamsData(selectedVersion)
    setLeagues(data.leagues)
    setSelectedLeagueIds(getLeagueFilter(selectedVersion))
  }, [selectedVersion])

  function isLeagueSelected(leagueId: string): boolean {
    return selectedLeagueIds === null || selectedLeagueIds.includes(leagueId)
  }

  function toggleLeague(leagueId: string) {
    const allIds = leagues.map((l) => l.id)
    const currentlySelected = selectedLeagueIds === null ? allIds : selectedLeagueIds
    const isSelected = currentlySelected.includes(leagueId)

    if (isSelected && currentlySelected.length === 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }

    const next = isSelected
      ? currentlySelected.filter((id) => id !== leagueId)
      : [...currentlySelected, leagueId]

    // If all leagues are selected, normalize to null
    const normalized = next.length === allIds.length ? null : next

    setSelectedLeagueIds(normalized)
    if (selectedVersion) setLeagueFilter(selectedVersion, normalized)
  }

  function handleSelectAll() {
    setSelectedLeagueIds(null)
    if (selectedVersion) setLeagueFilter(selectedVersion, null)
  }

  function handleClose() {
    router.back()
  }

  const allSelected = selectedLeagueIds === null

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Fechar configurações"
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Rating Diff */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diferença de Rating</Text>
            <Text style={styles.sectionDesc}>
              Limita a diferença entre os overalls dos dois times sorteados
            </Text>
            <View style={styles.optionRow}>
              {RATING_DIFF_OPTIONS.map(({ value, label }) => {
                const isSelected = ratingDiff === value
                return (
                  <TouchableOpacity
                    key={String(value)}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => setRatingDiff(value as RatingDiff)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextSelected]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nomes dos Jogadores</Text>
            <View style={styles.playerInputRow}>
              <TextInput
                style={styles.playerInput}
                value={playerNames.p1}
                onChangeText={(t) => setPlayerName('p1', t)}
                placeholder="Jogador 1"
                placeholderTextColor={colors.textMuted}
                maxLength={20}
              />
              <TextInput
                style={styles.playerInput}
                value={playerNames.p2}
                onChangeText={(t) => setPlayerName('p2', t)}
                placeholder="Jogador 2"
                placeholderTextColor={colors.textMuted}
                maxLength={20}
              />
            </View>
          </View>

          {/* League Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filtrar por Liga</Text>

            {!selectedVersion ? (
              <View style={styles.emptyHint}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
                <Text style={styles.emptyHintText}>
                  Selecione uma versão do FIFA na tela principal para filtrar por liga.
                </Text>
              </View>
            ) : leagues.length === 0 ? (
              <View style={styles.emptyHint}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.textMuted} />
                <Text style={styles.emptyHintText}>
                  Nenhuma liga disponível para esta versão. Adicione os dados via script Kaggle.
                </Text>
              </View>
            ) : (
              <>
                {/* Select All */}
                <TouchableOpacity style={styles.leagueRow} onPress={handleSelectAll}>
                  <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
                    {allSelected && (
                      <Ionicons name="checkmark" size={13} color={colors.background} />
                    )}
                  </View>
                  <Text style={[styles.leagueName, { fontWeight: '700' }]}>
                    Todas as ligas
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {leagues.map((league) => {
                  const selected = isLeagueSelected(league.id)
                  return (
                    <TouchableOpacity
                      key={league.id}
                      style={styles.leagueRow}
                      onPress={() => toggleLeague(league.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && (
                          <Ionicons name="checkmark" size={13} color={colors.background} />
                        )}
                      </View>
                      <View style={styles.leagueInfo}>
                        <Text style={styles.leagueName}>{league.name}</Text>
                        <Text style={styles.leagueNation}>{league.nation}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceActive,
  },
  optionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyHintText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  leagueNation: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  playerInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
  },
})
