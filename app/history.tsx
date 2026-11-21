import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useSessionStore } from '@/stores/sessionStore'
import { colors, spacing, radius, fontSize } from '@/constants/theme'
import { DrawResult, FIFA_VERSIONS } from '@/types'

function HistoryItem({ item }: { item: DrawResult }) {
  const versionLabel =
    FIFA_VERSIONS.find((v) => v.value === item.version)?.label ?? item.version
  const time = new Date(item.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const ratingDiff = Math.abs(item.team1.overall - item.team2.overall)

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>{versionLabel}</Text>
        </View>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      <View style={styles.teamsRow}>
        {/* Team 1 */}
        <View style={styles.teamEntry}>
          <Text style={styles.overall}>{item.team1.overall}</Text>
          <View>
            <Text style={styles.teamName}>{item.team1.shortName}</Text>
            <Text style={styles.teamLeague} numberOfLines={1}>
              {item.team1.league}
            </Text>
          </View>
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.diffText}>±{ratingDiff}</Text>
        </View>

        {/* Team 2 */}
        <View style={[styles.teamEntry, styles.teamEntryRight]}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.teamName}>{item.team2.shortName}</Text>
            <Text style={styles.teamLeague} numberOfLines={1}>
              {item.team2.league}
            </Text>
          </View>
          <Text style={styles.overall}>{item.team2.overall}</Text>
        </View>
      </View>
    </View>
  )
}

export default function HistoryScreen() {
  const { history } = useSessionStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Histórico</Text>

          {/* Spacer to center title */}
          <View style={{ width: 64 }} />
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={52} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum sorteio ainda</Text>
            <Text style={styles.emptyDesc}>
              Os sorteios desta sessão aparecerão aqui
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.timestamp)}
            renderItem={({ item }) => <HistoryItem item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyDesc: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  versionText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamEntryRight: {
    justifyContent: 'flex-end',
  },
  overall: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.primary,
    minWidth: 28,
    textAlign: 'center',
  },
  teamName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  teamLeague: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    maxWidth: 90,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  vsText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  diffText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
})
