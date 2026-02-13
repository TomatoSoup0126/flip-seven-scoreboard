<template>
  <div class="player-row" :class="{ 'player-row--winner': isWinner }">
    <!-- Player badge & info -->
    <div class="player-info">
      <div class="player-badge" :style="{ background: player.color }">
        {{ player.initials }}
      </div>
      <div class="player-details">
        <span class="player-name">{{ player.name }}</span>
        <span class="player-total" :class="{ 'player-total--winner': isWinner }">
          <span v-if="isWinner" class="crown">👑</span>
          {{ total }}
        </span>
      </div>
      <button
        class="player-delete"
        @click="$emit('delete', player.id)"
        :aria-label="t('deletePlayer')"
      >
        ✕
      </button>
    </div>

    <!-- Round scores -->
    <div class="player-scores-wrapper">
      <Transition :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
        <div class="player-scores" :key="startRound">
          <button
            v-for="i in visibleCount"
            :key="startRound + i - 1"
            class="score-cell"
            :class="{
              'score-cell--filled': getScore(startRound + i - 1) !== null,
              'score-cell--bust': getScore(startRound + i - 1)?.isBust,
              'score-cell--flip7': getScore(startRound + i - 1)?.isFlip7
            }"
            @click="$emit('edit-score', player.id, startRound + i - 1)"
          >
            <template v-if="getScore(startRound + i - 1) !== null">
              <span v-if="getScore(startRound + i - 1).isBust" class="score-bust">{{ t('bust') }}</span>
              <span v-else class="score-value">{{ getScore(startRound + i - 1).score }}</span>
              <span v-if="getScore(startRound + i - 1)?.isFlip7" class="score-flip7">★</span>
            </template>
            <template v-else>
              <span class="score-empty">{{ t('emptyScore') }}</span>
            </template>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/game.js'

const { t } = useI18n()

const props = defineProps({
  player: { type: Object, required: true },
  startRound: { type: Number, default: 0 },
  visibleCount: { type: Number, default: 3 },
  slideDirection: { type: String, default: 'next' }
})

defineEmits(['edit-score', 'delete'])

const store = useGameStore()

const total = computed(() => store.getPlayerTotal(props.player.id))
const isWinner = computed(() => total.value >= 200)

function getScore(roundIndex) {
  return store.getPlayerRoundScore(props.player.id, roundIndex)
}
</script>

<style scoped>
.player-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: background var(--transition-fast);
}

.player-row--winner {
  background: linear-gradient(135deg, rgba(249, 221, 105, 0.2), rgba(249, 221, 105, 0.05));
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.player-badge {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-white);
  flex-shrink: 0;
  text-transform: uppercase;
}

.player-details {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
}

.player-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-total {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-primary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.player-total--winner {
  color: #D4A017;
}

.crown {
  font-size: 1rem;
}

.player-delete {
  min-width: 36px;
  min-height: 36px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-disabled);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.player-delete:hover,
.player-delete:active {
  background: var(--color-danger);
  color: var(--color-white);
}

.player-scores {
  display: flex;
  gap: 6px;
}

.score-cell {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  border: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  position: relative;
}

.score-cell:active {
  transform: scale(0.97);
}

.score-cell--filled {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.score-cell--bust {
  border-color: var(--color-danger);
  background: rgba(221, 89, 105, 0.08);
}

.score-cell--flip7 {
  border-color: var(--color-highlight);
  background: rgba(249, 221, 105, 0.15);
}

.score-value {
  color: var(--color-primary);
}

.score-bust {
  color: var(--color-danger);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.score-flip7 {
  color: var(--color-highlight);
  font-size: 0.75rem;
}

.score-empty {
  color: var(--color-disabled);
}

/* Scores wrapper for transition overflow clip */
.player-scores-wrapper {
  padding-left: 48px;
  overflow: hidden;
}

/* Slide-left: next page */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* Slide-right: prev page */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
