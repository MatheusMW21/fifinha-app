import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useSessionStore } from '@/stores/sessionStore'
import { colors, spacing, radius, fontSize } from '@/constants/theme'

export default function TournamentSummaryScreen() {
    const { tournament, endTournament } = useSessionStore()

    useEffect(() => {
        if (!tournament) {
            router.replace('/')
        }  
    }, [tournament])
    
    if (!tournament) return null

    function handleFinish() {
        router.replace('/')
        endTournament()
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="trophy" size={40} color={colors.primary} />
                    <Text style={styles.title}>Champions League</Text>
                    <Text style={styles.subtitle}>{tournament.rounds.length} jogos disputados</Text>
                </View>

                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {tournament.rounds.map((round, index) => (
                        <View key={index} style={styles.roundRow}>
                            <Text style={styles.roundLabel}>R{index + 1}</Text>
                            <Text style={styles.teamName} numberOfLines={1}>{round.team1.shortName}</Text>
                            <Text style={styles.vs}>vs</Text>
                            <Text style={styles.teamName} numberOfLines={1}>{round.team2.shortName}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} activeOpacity={0.85}>
                        <Ionicons name="trophy-outline" size={20} color={colors.background} />
                        <Text style={styles.primaryButtonText}>Novo Torneio</Text>
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
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.sm,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: '900',
        color: colors.text,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    list: {
        flex: 1,
    },
    roundRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    roundLabel: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.primary,
        width: 24,
    },
    teamName: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
    },
    vs: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        fontWeight: '700',
    },
    footer: {
        paddingBottom: spacing.xl,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        borderRadius: radius.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    primaryButtonText: {
        fontSize: fontSize.lg,
        fontWeight: '800',
        color: colors.background,
    },
})
