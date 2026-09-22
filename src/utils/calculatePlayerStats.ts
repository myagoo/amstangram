import type { CompletionMap, SavedTangram, StarMap } from "../types"

interface PlayerStats {
  stars: number
  completed: number
  created: number
}

export const EMPTY_PLAYER_STATS: Readonly<PlayerStats> = {
  stars: 0,
  completed: 0,
  created: 0,
}

export function calculatePlayerStats(
  tangrams: readonly Pick<SavedTangram, "id" | "uid" | "approved">[],
  starredBy: StarMap,
  completedBy: CompletionMap
): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = Object.create(null)
  const forUser = (uid: string) => (stats[uid] ??= { ...EMPTY_PLAYER_STATS })

  for (const { id, uid, approved } of tangrams) {
    if (!approved) continue
    const creator = forUser(uid)
    creator.created++
    for (const [userId, starred] of Object.entries(starredBy[id] ?? {})) {
      if (userId !== uid && starred) creator.stars++
    }
    for (const [userId, time] of Object.entries(completedBy[id] ?? {})) {
      if (time !== undefined) forUser(userId).completed++
    }
  }
  return stats
}
