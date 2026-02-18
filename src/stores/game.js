import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'flip7-game-state'
const UNDO_LIMIT = 20
export const GAME_MODES = Object.freeze({
  CLASSIC: 'classic',
  VENGEANCE: 'vengeance'
})

const PLAYER_COLORS = [
  '#30348A', '#DD5969', '#69BDB9', '#E8873D',
  '#7B61C4', '#4CAF50', '#F9DD69', '#FF6B9D'
]

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load game state:', e)
  }
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save game state:', e)
  }
}

function isValidGameMode(mode) {
  return mode === GAME_MODES.CLASSIC || mode === GAME_MODES.VENGEANCE
}

export const useGameStore = defineStore('game', () => {
  const saved = loadState()

  // --- State ---
  const players = ref(saved?.players ?? [])
  const rounds = ref(saved?.rounds ?? 3)
  const scores = ref(saved?.scores ?? {})
  // scores structure: { [playerId]: { [roundIndex]: { score, cards, modifiers, hasX2, isFlip7, isBust } } }
  const undoStack = ref(saved?.undoStack ?? [])
  const nextPlayerId = ref(saved?.nextPlayerId ?? 1)
  const gameMode = ref(isValidGameMode(saved?.gameMode) ? saved.gameMode : GAME_MODES.CLASSIC)

  // --- Computed ---
  const playersSortedByScore = computed(() => {
    return [...players.value].sort((a, b) => {
      const totalB = getPlayerTotal(b.id)
      const totalA = getPlayerTotal(a.id)
      return totalB - totalA
    })
  })

  const canUndo = computed(() => undoStack.value.length > 0)

  // --- Helpers ---
  function getPlayerTotal(playerId) {
    const playerScores = scores.value[playerId]
    if (!playerScores) return 0
    return Object.values(playerScores).reduce((sum, entry) => sum + (entry.score ?? 0), 0)
  }

  function getPlayerRoundScore(playerId, roundIndex) {
    return scores.value[playerId]?.[roundIndex] ?? null
  }

  function getInitials(name) {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase()
  }

  // --- Actions ---
  function hasPlayerName(name) {
    const normalized = name.trim().toLowerCase()
    return players.value.some(p => p.name.toLowerCase() === normalized)
  }

  function addPlayer(name) {
    if (players.value.length >= 8) return
    const id = nextPlayerId.value++
    const colorIndex = (players.value.length) % PLAYER_COLORS.length
    players.value.push({
      id,
      name: name.trim(),
      initials: getInitials(name),
      color: PLAYER_COLORS[colorIndex]
    })
    scores.value[id] = {}
  }

  function removePlayer(playerId) {
    players.value = players.value.filter(p => p.id !== playerId)
    delete scores.value[playerId]
    // clean undo stack of entries referencing this player
    undoStack.value = undoStack.value.filter(u => u.playerId !== playerId)
  }

  function setScore(playerId, roundIndex, scoreData) {
    // Push to undo stack
    const previousScore = scores.value[playerId]?.[roundIndex] ?? null
    undoStack.value.push({
      type: 'setScore',
      playerId,
      roundIndex,
      previousScore,
      newScore: { ...scoreData }
    })
    if (undoStack.value.length > UNDO_LIMIT) {
      undoStack.value.shift()
    }

    // Apply score
    if (!scores.value[playerId]) {
      scores.value[playerId] = {}
    }
    scores.value[playerId][roundIndex] = { ...scoreData }

    // Auto-expand rounds if needed
    if (roundIndex >= rounds.value - 1) {
      rounds.value = roundIndex + 2
    }
  }

  function undo() {
    if (undoStack.value.length === 0) return
    const action = undoStack.value.pop()
    if (action.type === 'setScore') {
      if (action.previousScore === null) {
        delete scores.value[action.playerId]?.[action.roundIndex]
      } else {
        if (!scores.value[action.playerId]) {
          scores.value[action.playerId] = {}
        }
        scores.value[action.playerId][action.roundIndex] = action.previousScore
      }
    }
  }

  function newGame() {
    scores.value = {}
    rounds.value = 3
    undoStack.value = []
    // Keep players
  }

  function setGameMode(mode) {
    if (!isValidGameMode(mode) || gameMode.value === mode) return
    gameMode.value = mode
    // A rule change starts a brand new game, while preserving player setup.
    newGame()
  }

  function resetAll() {
    players.value = []
    scores.value = {}
    rounds.value = 3
    undoStack.value = []
    nextPlayerId.value = 1
  }

  function getWinners() {
    return players.value.filter(p => getPlayerTotal(p.id) >= 200)
  }

  // --- Calculate score from card selections ---
  function calculateScore(cards, modifiers, hasX2, options = {}) {
    const mode = options.mode ?? gameMode.value

    if (mode === GAME_MODES.VENGEANCE) {
      const extraLucky13 = options.extraLucky13 === true
      const cardCount = cards.length + (extraLucky13 ? 1 : 0)
      const hasZeroCard = cards.includes(0)

      // Lucky 13 allows one extra 13 card in the same line.
      const numberSum = cards.reduce((sum, c) => sum + c, 0) + (extraLucky13 ? 13 : 0)
      const afterDivideBy2 = hasX2 ? Math.floor(numberSum / 2) : null
      const modifierSum = modifiers.reduce((sum, m) => sum + m, 0)
      const isFlip7 = cardCount === 7

      let subtotal = hasX2 ? afterDivideBy2 : numberSum

      // ZERO card forces score to 0 unless the player reaches Flip 7.
      if (hasZeroCard && !isFlip7) {
        subtotal = 0
      } else {
        subtotal = Math.max(0, subtotal - modifierSum)
      }

      const flip7Bonus = isFlip7 ? 15 : 0

      return {
        numberSum,
        afterX2: null,
        afterDivideBy2,
        modifierSum,
        flip7Bonus,
        total: subtotal + flip7Bonus,
        cardCount,
        hasZeroCard,
        extraLucky13
      }
    }

    // Classic mode:
    // 1. Sum selected number cards
    const numberSum = cards.reduce((sum, c) => sum + c, 0)

    // 2. If x2, multiply
    const afterX2 = hasX2 ? numberSum * 2 : null
    const subtotal = hasX2 ? afterX2 : numberSum

    // 3. Add modifier bonuses
    const modifierSum = modifiers.reduce((sum, m) => sum + m, 0)

    // 4. Flip 7 bonus (exactly 7 number cards)
    const flip7Bonus = cards.length === 7 ? 15 : 0

    return {
      numberSum,
      afterX2,
      afterDivideBy2: null,
      modifierSum,
      flip7Bonus,
      total: subtotal + modifierSum + flip7Bonus,
      cardCount: cards.length,
      hasZeroCard: false,
      extraLucky13: false
    }
  }

  // --- Persist ---
  watch(
    () => ({
      players: players.value,
      rounds: rounds.value,
      scores: scores.value,
      undoStack: undoStack.value,
      nextPlayerId: nextPlayerId.value,
      gameMode: gameMode.value
    }),
    (state) => saveState(state),
    { deep: true }
  )

  return {
    players,
    rounds,
    scores,
    undoStack,
    nextPlayerId,
    gameMode,
    playersSortedByScore,
    canUndo,
    getPlayerTotal,
    getPlayerRoundScore,
    hasPlayerName,
    addPlayer,
    removePlayer,
    setScore,
    undo,
    newGame,
    setGameMode,
    resetAll,
    getWinners,
    calculateScore,
    GAME_MODES
  }
})
