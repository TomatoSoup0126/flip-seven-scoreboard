<template>
  <header class="game-header">
    <div class="game-header__center">
      <div class="game-header__logo">
        <div class="game-header__icon">
          <span class="game-header__flip">FLIP</span>
          <span class="game-header__seven">7</span>
        </div>
      </div>
      <p class="game-header__subtitle">{{ t('scoreboard') }}</p>
    </div>
    <div class="game-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.game-header {
  display: flex;
  align-items: center;
  padding: var(--space-md) var(--space-sm) var(--space-sm) var(--space-md);
  position: relative;
}

.game-header__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-header__right {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
}

.game-header__logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-header__icon {
  display: flex;
  align-items: baseline;
  gap: 2px;
  user-select: none;
}

.game-header__flip {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 2px;
  text-shadow: 2px 2px 0 var(--color-highlight);
}

.game-header__seven {
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--color-danger);
  text-shadow: 2px 2px 0 var(--color-highlight);
  transform: rotate(8deg);
  display: inline-block;
}

.game-header__subtitle {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 6px;
  margin-top: -4px;
}

@media (max-width: 480px) {
  .game-header__flip {
    font-size: 2rem;
  }
  .game-header__seven {
    font-size: 2.8rem;
  }
  .game-header__subtitle {
    font-size: 0.75rem;
    letter-spacing: 4px;
  }
}
</style>
