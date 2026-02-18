<template>
  <div class="app">
    <div class="app-container">
      <GameHeader data-tour="header-logo">
        <template #right>
          <button class="menu-toggle" data-tour="menu-toggle" @click="showMenu = !showMenu" :aria-label="t('menu')">
            <span class="menu-toggle__bar"></span>
            <span class="menu-toggle__bar"></span>
            <span class="menu-toggle__bar"></span>
          </button>
        </template>
      </GameHeader>

      <div class="app-content">
        <ScoreTable
          data-tour="score-table"
          @edit-score="openScorer"
          @delete-player="confirmDeletePlayer"
        />
      </div>

      <!-- Bottom Toolbar -->
      <div class="app-toolbar">
        <button class="toolbar-btn toolbar-btn--new" data-tour="new-game-btn" @click="confirmNewGame">
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
          data-tour="add-player-btn"
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

            <!-- Dark Mode -->
            <div class="drawer-item">
              <span class="drawer-item__label">{{ t('darkMode') }}</span>
              <div class="drawer-lang-switch">
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': !isDark }"
                  @click="setDarkMode(false)"
                  aria-label="Light mode"
                >
                  Light
                </button>
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': isDark }"
                  @click="setDarkMode(true)"
                  aria-label="Dark mode"
                >
                  Dark
                </button>
              </div>
            </div>

            <!-- Rule Mode -->
            <div class="drawer-item drawer-item--mode">
              <span class="drawer-item__label">{{ t('ruleMode') }}</span>
              <div class="drawer-lang-switch">
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': store.gameMode === store.GAME_MODES.CLASSIC }"
                  @click="confirmSwitchMode(store.GAME_MODES.CLASSIC)"
                >
                  {{ t('classicModeShort') }}
                </button>
                <button
                  class="drawer-lang-btn"
                  :class="{ 'drawer-lang-btn--active': store.gameMode === store.GAME_MODES.VENGEANCE }"
                  @click="confirmSwitchMode(store.GAME_MODES.VENGEANCE)"
                >
                  {{ t('vengeanceModeShort') }}
                </button>
              </div>
            </div>

            <!-- Guided Tour -->
            <button class="drawer-item drawer-item--action" @click="startGuidedTour">
              <span class="drawer-item__label">{{ tourMenuLabel }}</span>
              <span class="drawer-item__arrow">›</span>
            </button>

            <!-- Game Rules -->
            <a
              class="drawer-item drawer-item--link"
              href="https://theop.games/pages/flip-7"
              target="_blank"
              rel="noopener noreferrer"
              @click="showMenu = false"
            >
              <span class="drawer-item__label">{{ t('gameRules') }}</span>
              <span class="drawer-item__arrow">›</span>
            </a>

            <!-- Reset All -->
            <button class="drawer-item drawer-item--danger" @click="confirmResetAll">
              <span class="drawer-item__label">{{ t('resetAll') }}</span>
            </button>

            <!-- Footer links (pinned to bottom) -->
            <div class="drawer-footer">
              <a
                class="drawer-footer-link"
                href="https://www.buymeacoffee.com/tomatosoup"
                target="_blank"
                rel="noopener noreferrer"
                @click="showMenu = false"
              >
                <svg class="drawer-footer-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                  <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="2" x2="6" y2="4"/>
                  <line x1="10" y1="2" x2="10" y2="4"/>
                  <line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
                <span class="drawer-footer-link__label">{{ t('supportUs') }}</span>
              </a>
              <a
                class="drawer-footer-link"
                href="https://github.com/TomatoSoup0126/flip-seven-scoreboard"
                target="_blank"
                rel="noopener noreferrer"
                @click="showMenu = false"
              >
                <svg class="drawer-footer-link__icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span class="drawer-footer-link__label">{{ t('sourceCode') }}</span>
              </a>
            </div>
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

    <VTour
      ref="tourRef"
      name="flip7-scoreboard-tour"
      :steps="tourSteps"
      :button-labels="tourButtonLabels"
      :jump-options="{ offset: -24, duration: 350 }"
      :aria-label="t('guidedTour')"
      @onTourEnd="onTourEnd"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import confetti from 'canvas-confetti'
import { VTour } from '@globalhive/vuejs-tour'
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
const TOUR_COMPLETED_KEY = 'flip7-tour-completed'
const tourRef = ref(null)
const tourCompleted = ref(localStorage.getItem(TOUR_COMPLETED_KEY) === 'true')

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

const tourButtonLabels = computed(() => ({
  next: t('tourNext'),
  back: t('tourBack'),
  done: t('tourDone'),
  skip: t('tourSkip')
}))

const tourSteps = computed(() => ([
  {
    target: '[data-tour="header-logo"]',
    content: t('tourStepHeader'),
    placement: 'bottom'
  },
  {
    target: '[data-tour="score-table"]',
    content: t('tourStepScoreTable'),
    placement: 'bottom'
  },
  {
    target: '[data-tour="add-player-btn"]',
    content: t('tourStepAddPlayer'),
    placement: 'top'
  },
  {
    target: '[data-tour="new-game-btn"]',
    content: t('tourStepNewGame'),
    placement: 'top'
  },
  {
    target: '[data-tour="menu-toggle"]',
    content: t('tourStepMenu'),
    placement: 'left'
  }
]))

const tourMenuLabel = computed(() => {
  return tourCompleted.value ? t('restartTour') : t('startTour')
})

async function startGuidedTour() {
  showMenu.value = false
  await nextTick()
  await tourRef.value?.startTour()
}

function onTourEnd() {
  tourCompleted.value = true
  localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
}

// --- Dark Mode ---
const DARK_KEY = 'flip7-dark-mode'
const isDark = ref(localStorage.getItem(DARK_KEY) === 'true')

function applyDarkMode(val) {
  document.documentElement.classList.toggle('dark', val)
}

function setDarkMode(val) {
  isDark.value = val
  localStorage.setItem(DARK_KEY, val)
  applyDarkMode(val)
}

// Apply on load
applyDarkMode(isDark.value)

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

function confirmResetAll() {
  showMenu.value = false
  confirmState.message = t('confirmResetAll')
  confirmState.confirmText = t('confirm')
  confirmState.cancelText = t('cancel')
  confirmState.onConfirm = () => {
    store.resetAll()
    confirmState.visible = false
    winnerDismissed.value = false
  }
  confirmState.visible = true
}

function confirmSwitchMode(mode) {
  if (mode === store.gameMode) return
  showMenu.value = false
  const modeLabel = mode === store.GAME_MODES.VENGEANCE
    ? t('vengeanceMode')
    : t('classicMode')

  confirmState.message = t('confirmSwitchMode', { mode: modeLabel })
  confirmState.confirmText = t('confirm')
  confirmState.cancelText = t('cancel')
  confirmState.onConfirm = () => {
    store.setGameMode(mode)
    winnerDismissed.value = false
    prevWinnerIds.value = new Set()
    confirmState.visible = false
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
  max-width: 980px;
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

.drawer-item__label {
  font-family: var(--font-primary);
  font-size: 0.95rem;
  color: var(--color-text-dark);
}

.drawer-item__arrow {
  font-size: 1.4rem;
  color: var(--color-text-muted);
  line-height: 1;
}

.drawer-item--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.drawer-item--action {
  width: 100%;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.drawer-item--mode {
  align-items: flex-start;
  gap: var(--space-sm);
}

.drawer-item--link:active {
  background: var(--color-teal-light);
}

.drawer-item--action:active {
  background: var(--color-teal-light);
}

.drawer-item--danger {
  cursor: pointer;
  background: none;
  width: 100%;
  text-align: left;
  transition: background var(--transition-fast);
}

.drawer-item--danger .drawer-item__label {
  color: var(--color-danger);
}

.drawer-item--danger:active {
  background: rgba(221, 89, 105, 0.08);
}

/* Drawer Footer */
.drawer-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-gray-light);
}

.drawer-footer-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px var(--space-md);
  text-decoration: none;
  color: var(--color-text-muted);
  transition: background var(--transition-fast);
}

.drawer-footer-link + .drawer-footer-link {
  border-top: 1px solid var(--color-gray-light);
}

.drawer-footer-link:active {
  background: var(--color-teal-light);
}

.drawer-footer-link__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
}

.drawer-footer-link__label {
  font-family: var(--font-primary);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* Language Switch */
.drawer-lang-switch {
  display: flex;
  gap: 4px;
  background: var(--color-teal-light);
  border-radius: var(--radius-sm);
  padding: 3px;
  flex-shrink: 0;
}

.drawer-lang-btn {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-muted);
  background: transparent;
  text-align: center;
  white-space: nowrap;
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

@media (orientation: landscape) and (max-height: 620px) {
  .app {
    padding: var(--space-xs) var(--space-sm);
  }

  .app-container {
    min-height: calc(100dvh - var(--space-sm));
    border-radius: var(--radius-md);
  }

  .app-content {
    padding: 0 var(--space-xs);
  }

  .app-toolbar {
    padding: var(--space-xs) var(--space-xs) var(--space-sm);
    gap: 6px;
  }

  .toolbar-btn {
    padding: 10px var(--space-sm);
    font-size: 0.86rem;
  }
}
</style>
