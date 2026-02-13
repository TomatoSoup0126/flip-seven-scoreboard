<template>
  <div class="round-nav">
    <button
      class="round-nav__arrow round-nav__arrow--prev"
      :disabled="startRound === 0"
      @click="onPrev"
      :aria-label="t('prevRounds')"
    >
      ‹
    </button>
    <div class="round-nav__labels">
      <Transition :name="direction === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
        <div class="round-nav__labels-inner" :key="startRound">
          <span
            v-for="i in visibleCount"
            :key="startRound + i - 1"
            class="round-nav__label"
          >
            {{ t('roundLabel', { n: startRound + i }) }}
          </span>
        </div>
      </Transition>
    </div>
    <button
      class="round-nav__arrow round-nav__arrow--next"
      :disabled="startRound + visibleCount >= totalRounds"
      @click="onNext"
      :aria-label="t('nextRounds')"
    >
      ›
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  startRound: { type: Number, default: 0 },
  visibleCount: { type: Number, default: 3 },
  totalRounds: { type: Number, default: 3 }
})

const emit = defineEmits(['prev', 'next'])

const direction = ref('next')

function onPrev() {
  direction.value = 'prev'
  emit('prev')
}

function onNext() {
  direction.value = 'next'
  emit('next')
}
</script>

<style scoped>
.round-nav {
  position: relative;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  /* 
    Left padding = player-row padding-left(16px) + badge area(48px) = 64px
    Right padding = player-row padding-right(16px)
    This aligns labels with score cells below.
  */
  padding: var(--space-sm) 16px var(--space-sm) 64px;
}

.round-nav__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-light);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
  z-index: 1;
}

.round-nav__arrow--prev {
  left: 4px;
}

.round-nav__arrow--next {
  right: 4px;
}

.round-nav__arrow:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.round-nav__arrow:disabled {
  color: var(--color-disabled);
  cursor: default;
}

.round-nav__labels {
  overflow: hidden;
}

.round-nav__labels-inner {
  display: flex;
  align-items: center;
  gap: 6px; /* match score-cell gap */
}

.round-nav__label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-align: center;
  flex: 1;
}

/* Slide-left: next page */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Slide-right: prev page */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
