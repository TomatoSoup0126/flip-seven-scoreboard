<template>
  <div class="score-table">
    <!-- Round Navigation -->
    <RoundNav
      :start-round="startRound"
      :visible-count="visibleRounds"
      :total-rounds="store.rounds"
      @prev="prevPage"
      @next="nextPage"
    />

    <!-- Player List -->
    <div class="score-table__body">
      <div v-if="store.playersSortedByScore.length === 0" class="score-table__empty">
        <p>{{ t('emptyState') }}</p>
      </div>
      <TransitionGroup name="player-reorder" tag="div">
        <PlayerRow
          v-for="player in store.playersSortedByScore"
          :key="player.id"
          :player="player"
          :start-round="startRound"
          :visible-count="visibleRounds"
          :slide-direction="slideDirection"
          @edit-score="onEditScore"
          @delete="onDeletePlayer"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/game.js'
import RoundNav from './RoundNav.vue'
import PlayerRow from './PlayerRow.vue'

const { t } = useI18n()
const store = useGameStore()

const emit = defineEmits(['edit-score', 'delete-player'])

const startRound = ref(0)
const slideDirection = ref('next') // 'next' | 'prev'
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

// Reset to first round when a new game starts (scores cleared)
watch(
  () => Object.keys(store.scores).length,
  (len) => {
    if (len === 0) {
      startRound.value = 0
      slideDirection.value = 'next'
    }
  }
)

const visibleRounds = computed(() => {
  const isCompactLandscape = windowWidth.value >= 700
    && windowHeight.value <= 620
    && (windowWidth.value / Math.max(windowHeight.value, 1)) >= 1.45

  if (isCompactLandscape) {
    if (windowWidth.value >= 1180) return 5
    if (windowWidth.value >= 900) return 4
    return 3
  }
  if (windowWidth.value <= 480) return 2
  if (windowWidth.value <= 768) return 2
  if (windowWidth.value >= 1200) return 4
  return 3
})

watch([() => store.rounds, visibleRounds], () => {
  const maxStart = Math.max(0, store.rounds - visibleRounds.value)
  if (startRound.value > maxStart) {
    startRound.value = maxStart
  }
})

function prevPage() {
  slideDirection.value = 'prev'
  startRound.value = Math.max(0, startRound.value - visibleRounds.value)
}

function nextPage() {
  slideDirection.value = 'next'
  const maxStart = Math.max(0, store.rounds - visibleRounds.value)
  startRound.value = Math.min(maxStart, startRound.value + visibleRounds.value)
}

function onEditScore(playerId, roundIndex) {
  emit('edit-score', playerId, roundIndex)
}

function onDeletePlayer(playerId) {
  emit('delete-player', playerId)
}
</script>

<style scoped>
.score-table {
  --score-grid-offset: 64px;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
}

.score-table__body {
  flex: 1;
  background: var(--color-content);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  overflow-y: auto;
  min-height: 120px;
}

.score-table__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: var(--space-lg);
}

.score-table__empty p {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  opacity: 0.6;
}

/* Player reorder transition (FLIP animation) */
.player-reorder-move {
  transition: transform 0.4s ease;
}

.player-reorder-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.player-reorder-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  width: 100%;
}

.player-reorder-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.player-reorder-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (orientation: landscape) and (max-height: 620px) {
  .score-table {
    --score-grid-offset: 228px;
  }

  .score-table__empty {
    min-height: 120px;
    padding: var(--space-md);
  }
}
</style>
