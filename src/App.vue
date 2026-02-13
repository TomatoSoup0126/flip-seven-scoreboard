<template>
  <div class="app">
    <div class="app-container">
      <GameHeader>
        <template #right>
          <button class="menu-toggle" @click="showMenu = !showMenu" :aria-label="t('menu')">
            <span class="menu-toggle__bar"></span>
            <span class="menu-toggle__bar"></span>
            <span class="menu-toggle__bar"></span>
          </button>
        </template>
      </GameHeader>

      <div class="app-content">
        <ScoreTable
          @edit-score="openScorer"
          @delete-player="confirmDeletePlayer"
        />
      </div>

      <!-- Bottom Toolbar -->
      <div class="app-toolbar">
        <button class="toolbar-btn toolbar-btn--new" @click="confirmNewGame">
          {{ t('newGame') }}
        </button>
        <button
          v-if="store.canUndo"
          class="toolbar-btn toolbar-btn--undo"
          @click="store.undo()"
        >
          {{ t('undo') }}
        </button>
        <button
          class="toolbar-btn toolbar-btn--add"
          :disabled="store.players.length >= 8"
          @click="showAddPlayer = true"
        >
          {{ t('addPlayer') }}
        </button>
      </div>
    </div>

    <!-- Winner Banner -->
    <Transition name="banner">
      <div v-if="winners.length > 0" class="winner-banner" role="alert" aria-live="assertive" @click="winnerDismissed = true">
        <span class="winner-banner__text">
          {{ t('winnerAnnouncement', { names: winnersText }) }}
        </span>
        <span class="winner-banner__sub">{{ t('tapToDismiss') }}</span>
      </div>
    </Transition>

    <!-- Drawer Menu -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showMenu" class="drawer-overlay" ref="drawerOverlayRef" tabindex="-1" @click.self="showMenu = false" @keydown.escape="showMenu = false">
          <div class="drawer-panel">
            <div class="drawer-header">
              <span class="drawer-header__title">{{ t('menu') }}</span>
              <button class="drawer-close" @click="showMenu = false" :aria-label="t('close')">
                ✕
              </button>
            </div>

            <!-- Language -->
            <div class="drawer-item">
              <span class="drawer-item__label">{{ t('language') }}</span>
              <div class="drawer-lang-switch">
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': locale === 'zh-TW' }"
                  @click="switchLocale('zh-TW')"
                >
                  中文
                </button>
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': locale === 'en' }"
                  @click="switchLocale('en')"
                >
                  EN
                </button>
              </div>
            </div>

            <!-- GitHub -->
            <a
              class="drawer-item drawer-item--link"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              @click="showMenu = false"
            >
              <svg class="drawer-item__icon" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span class="drawer-item__label">{{ t('sourceCode') }}</span>
              <span class="drawer-item__arrow">›</span>
            </a>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modals -->
    <AddPlayerDialog
      :visible="showAddPlayer"
      @confirm="onAddPlayer"
      @cancel="showAddPlayer = false"
    />

    <CardScorer
      :visible="scorerState.visible"
      :player-id="scorerState.playerId"
      :player-name="scorerState.playerName"
      :round-index="scorerState.roundIndex"
      :existing-score="scorerState.existingScore"
      @confirm="onScoreConfirm"
      @cancel="closeScorer"
    />

    <ConfirmDialog
      :visible="confirmState.visible"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      @confirm="confirmState.onConfirm"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import confetti from 'canvas-confetti'
import { setLocale } from './i18n/index.js'
import { useGameStore } from './stores/game.js'
import { useFocusTrap } from './composables/useFocusTrap.js'
import GameHeader from './components/GameHeader.vue'
import ScoreTable from './components/ScoreTable.vue'
import CardScorer from './components/CardScorer.vue'
import AddPlayerDialog from './components/AddPlayerDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const { t, locale } = useI18n()
const store = useGameStore()

// --- Menu ---
const showMenu = ref(false)
const drawerOverlayRef = ref(null)

useFocusTrap(drawerOverlayRef, showMenu)

watch(showMenu, async (val) => {
  if (val) {
    await nextTick()
    drawerOverlayRef.value?.focus()
  }
})

function switchLocale(loc) {
  setLocale(loc)
}

// --- Add Player ---
const showAddPlayer = ref(false)

function onAddPlayer(name) {
  store.addPlayer(name)
  showAddPlayer.value = false
}

// --- Card Scorer ---
const scorerState = reactive({
  visible: false,
  playerId: null,
  playerName: '',
  roundIndex: 0,
  existingScore: null
})

function openScorer(playerId, roundIndex) {
  const player = store.players.find(p => p.id === playerId)
  if (!player) return
  scorerState.playerId = playerId
  scorerState.playerName = player.name
  scorerState.roundIndex = roundIndex
  scorerState.existingScore = store.getPlayerRoundScore(playerId, roundIndex)
  scorerState.visible = true
}

function closeScorer() {
  scorerState.visible = false
}

function onScoreConfirm(scoreData) {
  store.setScore(scorerState.playerId, scorerState.roundIndex, scoreData)
  scorerState.visible = false
}

// --- Confirm Dialog ---
const confirmState = reactive({
  visible: false,
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: () => {}
})

function confirmNewGame() {
  if (store.players.length === 0) return
  confirmState.message = t('confirmNewGame')
  confirmState.confirmText = t('confirm')
  confirmState.cancelText = t('cancel')
  confirmState.onConfirm = () => {
    store.newGame()
    confirmState.visible = false
    winnerDismissed.value = false
  }
  confirmState.visible = true
}

let pendingDeletePlayerId = null

function confirmDeletePlayer(playerId) {
  const player = store.players.find(p => p.id === playerId)
  if (!player) return
  pendingDeletePlayerId = playerId
  confirmState.message = t('confirmDeletePlayer', { name: player.name })
  confirmState.confirmText = t('delete')
  confirmState.cancelText = t('cancel')
  confirmState.onConfirm = () => {
    store.removePlayer(pendingDeletePlayerId)
    confirmState.visible = false
    pendingDeletePlayerId = null
  }
  confirmState.visible = true
}

// --- Winner ---
const winnerDismissed = ref(false)
const prevWinnerIds = ref(new Set())

const winners = computed(() => {
  if (winnerDismissed.value) return []
  return store.getWinners()
})

const winnersText = computed(() => {
  const sep = locale.value === 'zh-TW' ? '、' : ', '
  return winners.value.map(w => w.name).join(sep)
})

function fireConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const colors = ['#30348A', '#DD5969', '#F9DD69', '#69BDB9', '#FF6B9D', '#FFB347']

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors
  })

  frame()
}

watch(() => store.scores, () => {
  const w = store.getWinners()
  if (w.length > 0) {
    const hasNewWinner = w.some(p => !prevWinnerIds.value.has(p.id))

    if (hasNewWinner) {
      winnerDismissed.value = false
      nextTick(() => fireConfetti())
    }
    prevWinnerIds.value = new Set(w.map(p => p.id))
  }
}, { deep: true })

watch(() => store.rounds, (val) => {
  if (val === 3 && Object.keys(store.scores).length === 0) {
    prevWinnerIds.value = new Set()
  }
})
</script>

<style scoped>
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
}

.app-container {
  width: 100%;
  max-width: 600px;
  background: var(--color-container);
  border: 2px solid var(--color-container-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--space-xl));
  overflow: hidden;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-sm);
  min-height: 0;
}

/* Bottom Toolbar */
.app-toolbar {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-sm) var(--space-md);
}

.toolbar-btn {
  flex: 1;
  padding: 14px var(--space-md);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  transition: opacity var(--transition-fast);
}

.toolbar-btn:active {
  opacity: 0.85;
}

.toolbar-btn--new {
  background: var(--color-primary-dark);
  color: var(--color-white);
}

.toolbar-btn--add {
  background: var(--color-primary);
  color: var(--color-white);
}

.toolbar-btn--add:disabled {
  background: var(--color-disabled);
  cursor: not-allowed;
}

.toolbar-btn--undo {
  background: var(--color-accent);
  color: var(--color-white);
  flex: 0.6;
}

/* Winner Banner */
.winner-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--color-highlight), #FFB347);
  padding: var(--space-md);
  text-align: center;
  z-index: 900;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.winner-banner__text {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--color-primary);
  display: block;
}

.winner-banner__sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.banner-enter-active,
.banner-leave-active {
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}
.banner-enter-from,
.banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Hamburger Menu Toggle (in header) */
.menu-toggle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: opacity var(--transition-fast);
}

.menu-toggle:active {
  opacity: 0.5;
}

.menu-toggle__bar {
  display: block;
  width: 22px;
  height: 2.5px;
  background: var(--color-primary);
  border-radius: 2px;
}

/* Drawer Overlay */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
}

/* Drawer Panel */
.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100%;
  background: var(--color-white);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-md);
  border-bottom: 1px solid var(--color-gray-light);
}

.drawer-header__title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.drawer-close {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: transparent;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.drawer-close:active {
  background: var(--color-teal-light);
}

/* Drawer Items */
.drawer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--space-md);
  border-bottom: 1px solid var(--color-gray-light);
}

.drawer-item:last-child {
  border-bottom: none;
}

.drawer-item--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  gap: 12px;
  justify-content: flex-start;
  transition: background var(--transition-fast);
}

.drawer-item--link:active {
  background: var(--color-teal-light);
}

.drawer-item__icon {
  flex-shrink: 0;
  color: var(--color-text-dark);
}

.drawer-item__label {
  font-family: var(--font-primary);
  font-size: 0.95rem;
  color: var(--color-text-dark);
}

.drawer-item__arrow {
  margin-left: auto;
  font-size: 1.4rem;
  color: var(--color-text-muted);
  line-height: 1;
}

/* Language Switch */
.drawer-lang-switch {
  display: flex;
  gap: 4px;
  background: var(--color-teal-light);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.drawer-lang-btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  background: transparent;
  transition: all var(--transition-fast);
}

.drawer-lang-btn--active {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* Drawer Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: background 0.3s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  background: rgba(0, 0, 0, 0);
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

/* RWD */
@media (max-width: 480px) {
  .app {
    padding: var(--space-sm);
  }
  .app-container {
    min-height: calc(100dvh - var(--space-md));
    border-radius: var(--radius-md);
  }
  .toolbar-btn {
    font-size: 0.9rem;
    padding: 12px var(--space-sm);
  }
}
</style>
