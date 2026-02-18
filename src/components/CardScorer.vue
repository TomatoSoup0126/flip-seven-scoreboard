<template>
  <Teleport to="body">
    <Transition name="scorer">
      <div v-if="visible" class="scorer-overlay" ref="overlayRef" tabindex="-1" @click.self="onCancel" @keydown.escape="onCancel">
        <div class="scorer-panel">
          <!-- Header -->
          <div class="scorer-header">
            <span class="scorer-title">{{ t('scorerTitle', { name: playerName, round: roundNumber }) }}</span>
            <button class="scorer-close" @click="onCancel" :aria-label="t('close')">✕</button>
          </div>

          <!-- Number Cards -->
          <div class="scorer-section">
            <div class="scorer-label">{{ t('numberCards') }}</div>
            <div class="scorer-cards">
              <button
                v-for="n in numberCardValues"
                :key="n"
                class="card-btn"
                :class="{ 'card-btn--active': selectedCards.has(n) }"
                @click="toggleCard(n)"
              >
                {{ n }}
              </button>
            </div>
            <p v-if="isVengeanceMode" class="scorer-hint">
              {{ t('vengeanceNumberHint') }}
            </p>
          </div>

          <!-- Modifier Cards -->
          <div class="scorer-section">
            <div class="scorer-label">{{ t('modifierCards') }}</div>
            <div class="scorer-modifiers">
              <button
                v-for="m in modifierValues"
                :key="'mod-' + m"
                class="mod-btn"
                :class="{ 'mod-btn--active': selectedModifiers.has(m) }"
                @click="toggleModifier(m)"
              >
                {{ isVengeanceMode ? '-' : '+' }}{{ m }}
              </button>
              <button
                class="mod-btn mod-btn--x2"
                :class="{ 'mod-btn--active': hasX2 }"
                @click="hasX2 = !hasX2"
              >
                {{ isVengeanceMode ? t('divideByTwo') : t('multiplier') }}
              </button>
            </div>
          </div>

          <!-- Vengeance Special Cards -->
          <div v-if="isVengeanceMode" class="scorer-section">
            <div class="scorer-label">{{ t('vengeanceSpecialCards') }}</div>
            <label class="special-toggle" :class="{ 'special-toggle--disabled': !canEnableExtraLucky13 }">
              <input
                v-model="extraLucky13"
                type="checkbox"
                :disabled="!canEnableExtraLucky13"
              >
              <span>{{ t('lucky13Extra') }}</span>
            </label>
            <p class="scorer-hint">{{ t('lucky13Hint') }}</p>
          </div>

          <!-- Score Preview -->
          <div class="scorer-preview">
            <div class="preview-row">
              <span>{{ t('numberCardSum') }}</span>
              <span>{{ scoreBreakdown.numberSum }}</span>
            </div>
            <div v-if="scoreBreakdown.afterX2 !== null" class="preview-row preview-row--accent">
              <span>{{ t('multiplier') }}</span>
              <span>{{ scoreBreakdown.afterX2 }}</span>
            </div>
            <div v-if="scoreBreakdown.afterDivideBy2 !== null" class="preview-row preview-row--accent">
              <span>{{ t('divideByTwo') }}</span>
              <span>{{ scoreBreakdown.afterDivideBy2 }}</span>
            </div>
            <div v-if="scoreBreakdown.modifierSum > 0" class="preview-row">
              <span>{{ isVengeanceMode ? t('modifierPenalty') : t('modifierBonus') }}</span>
              <span>{{ isVengeanceMode ? '-' : '+' }}{{ scoreBreakdown.modifierSum }}</span>
            </div>
            <div
              v-if="isVengeanceMode && scoreBreakdown.hasZeroCard && scoreBreakdown.flip7Bonus === 0"
              class="preview-row preview-row--danger"
            >
              <span>{{ t('zeroCardEffect') }}</span>
              <span>{{ t('scoreForcedToZero') }}</span>
            </div>
            <div v-if="scoreBreakdown.flip7Bonus > 0" class="preview-row preview-row--flip7">
              <span>{{ t('flip7Bonus') }}</span>
              <span>+{{ scoreBreakdown.flip7Bonus }}</span>
            </div>
            <div class="preview-total">
              <span>{{ t('roundTotal') }}</span>
              <span class="preview-total__score">{{ scoreBreakdown.total }}</span>
            </div>
          </div>

          <!-- Flip 7 indicator -->
          <div v-if="scoreBreakdown.cardCount === 7" class="flip7-badge">
            {{ t('flip7Badge') }}
          </div>

          <!-- Actions -->
          <div class="scorer-actions">
            <button class="scorer-btn scorer-btn--bust" @click="onBust">
              {{ t('bust') }}
            </button>
            <button class="scorer-btn scorer-btn--confirm" @click="onConfirm">
              {{ t('confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/game.js'
import { useFocusTrap } from '../composables/useFocusTrap.js'

const { t } = useI18n()

const overlayRef = ref(null)

const props = defineProps({
  visible: { type: Boolean, default: false },
  playerId: { type: Number, default: null },
  playerName: { type: String, default: '' },
  roundIndex: { type: Number, default: 0 },
  existingScore: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel'])

useFocusTrap(overlayRef, () => props.visible)

const store = useGameStore()

const selectedCards = ref(new Set())
const selectedModifiers = ref(new Set())
const hasX2 = ref(false)
const extraLucky13 = ref(false)

const roundNumber = computed(() => props.roundIndex + 1)
const isVengeanceMode = computed(() => store.gameMode === store.GAME_MODES.VENGEANCE)

const numberCardValues = computed(() => {
  const upperBound = isVengeanceMode.value ? 13 : 12
  return Array.from({ length: upperBound + 1 }, (_, index) => index)
})

const modifierValues = [2, 4, 6, 8, 10]

const canEnableExtraLucky13 = computed(() => {
  return isVengeanceMode.value && selectedCards.value.has(13)
})

watch(() => props.visible, async (val) => {
  if (val) {
    if (props.existingScore && !props.existingScore.isBust) {
      selectedCards.value = new Set(props.existingScore.cards ?? [])
      selectedModifiers.value = new Set(props.existingScore.modifiers ?? [])
      hasX2.value = props.existingScore.hasX2 ?? false
      extraLucky13.value = props.existingScore.extraLucky13 ?? false
    } else {
      selectedCards.value = new Set()
      selectedModifiers.value = new Set()
      hasX2.value = false
      extraLucky13.value = false
    }
    await nextTick()
    overlayRef.value?.focus()
  }
})

watch(canEnableExtraLucky13, (enabled) => {
  if (!enabled) {
    extraLucky13.value = false
  }
})

const scoreBreakdown = computed(() => {
  const cards = [...selectedCards.value]
  const modifiers = [...selectedModifiers.value]
  return store.calculateScore(cards, modifiers, hasX2.value, {
    mode: store.gameMode,
    extraLucky13: extraLucky13.value
  })
})

function toggleCard(num) {
  const s = new Set(selectedCards.value)
  if (s.has(num)) {
    s.delete(num)
  } else {
    s.add(num)
  }
  selectedCards.value = s
}

function toggleModifier(mod) {
  const s = new Set(selectedModifiers.value)
  if (s.has(mod)) {
    s.delete(mod)
  } else {
    s.add(mod)
  }
  selectedModifiers.value = s
}

function onConfirm() {
  const cards = [...selectedCards.value]
  const modifiers = [...selectedModifiers.value]
  const extraLucky13Active = canEnableExtraLucky13.value && extraLucky13.value
  const breakdown = store.calculateScore(cards, modifiers, hasX2.value, {
    mode: store.gameMode,
    extraLucky13: extraLucky13Active
  })
  emit('confirm', {
    score: breakdown.total,
    cards,
    modifiers,
    hasX2: hasX2.value,
    extraLucky13: extraLucky13Active,
    isFlip7: breakdown.flip7Bonus > 0,
    isBust: false,
    mode: store.gameMode
  })
}

function onBust() {
  emit('confirm', {
    score: 0,
    cards: [],
    modifiers: [],
    hasX2: false,
    isFlip7: false,
    isBust: true
  })
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.scorer-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.scorer-panel {
  background: var(--color-content);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90dvh;
  overflow-y: auto;
  padding: var(--space-md) var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-lg);
}

.scorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.scorer-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.scorer-close {
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-gray-light);
  color: var(--color-text-dark);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scorer-section {
  margin-bottom: var(--space-md);
}

.scorer-label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--space-sm);
}

.scorer-cards {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.scorer-hint {
  margin-top: var(--space-xs);
  font-size: 0.78rem;
  color: var(--color-text-muted);
  line-height: 1.35;
}

.card-btn {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: var(--color-white);
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-btn:active {
  transform: scale(0.95);
}

.card-btn--active {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(48, 52, 138, 0.4);
}

.scorer-modifiers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.special-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-white);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
}

.special-toggle input {
  width: 16px;
  height: 16px;
}

.special-toggle--disabled {
  border-color: var(--color-disabled);
  color: var(--color-text-muted);
}

.mod-btn {
  flex: 1;
  min-width: 52px;
  padding: 10px 4px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  transition: all var(--transition-fast);
}

.mod-btn:active {
  transform: scale(0.95);
}

.mod-btn--active {
  background: var(--color-accent);
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(105, 189, 185, 0.4);
}

.mod-btn--x2 {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.mod-btn--x2.mod-btn--active {
  background: var(--color-danger);
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(221, 89, 105, 0.4);
}

/* Score Preview */
.scorer-preview {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.preview-row--accent {
  color: var(--color-danger);
  font-weight: 700;
}

.preview-row--flip7 {
  color: var(--color-primary);
  font-weight: 700;
}

.preview-row--danger {
  color: var(--color-danger);
  font-weight: 700;
}

.preview-total {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-sm);
  margin-top: var(--space-sm);
  border-top: 2px solid var(--color-primary);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.preview-total__score {
  font-size: 1.5rem;
}

/* Flip 7 Badge */
.flip7-badge {
  text-align: center;
  padding: var(--space-sm);
  margin-bottom: var(--space-md);
  background: linear-gradient(135deg, var(--color-highlight), #FFB347);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 2px;
  animation: flip7-pulse 0.8s ease infinite alternate;
}

@keyframes flip7-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.03); }
}

/* Actions */
.scorer-actions {
  display: flex;
  gap: var(--space-sm);
}

.scorer-btn {
  flex: 1;
  padding: 14px var(--space-md);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 900;
  text-transform: uppercase;
  transition: opacity var(--transition-fast);
}

.scorer-btn:active {
  opacity: 0.8;
}

.scorer-btn--bust {
  background: var(--color-danger);
  color: var(--color-white);
}

.scorer-btn--confirm {
  background: var(--color-primary);
  color: var(--color-white);
}

/* Transition */
.scorer-enter-active,
.scorer-leave-active {
  transition: opacity var(--transition-normal);
}
.scorer-enter-active .scorer-panel,
.scorer-leave-active .scorer-panel {
  transition: transform var(--transition-normal);
}
.scorer-enter-from,
.scorer-leave-to {
  opacity: 0;
}
.scorer-enter-from .scorer-panel {
  transform: translateY(100%);
}
.scorer-leave-to .scorer-panel {
  transform: translateY(100%);
}

/* RWD */
@media (min-width: 769px) {
  .scorer-overlay {
    align-items: center;
  }
  .scorer-panel {
    border-radius: var(--radius-lg);
    max-height: 80dvh;
  }
}
</style>
