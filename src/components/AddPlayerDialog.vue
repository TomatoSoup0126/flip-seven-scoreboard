<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="dialog-overlay" ref="overlayRef" @click.self="onCancel" @keydown.escape="onCancel">
        <div class="dialog-box">
          <h3 class="dialog-title">{{ t('addPlayerTitle') }}</h3>
          <div class="dialog-input-wrap">
            <input
              ref="inputRef"
              v-model="playerName"
              class="dialog-input"
              :class="{ 'dialog-input--error': errorMsg }"
              type="text"
              :placeholder="t('playerNamePlaceholder')"
              maxlength="10"
              @keyup.enter="onConfirm"
              @input="errorMsg = ''"
            />
            <p v-if="errorMsg" class="dialog-error">{{ errorMsg }}</p>
          </div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn--cancel" @click="onCancel">
              {{ t('cancel') }}
            </button>
            <button
              class="dialog-btn dialog-btn--confirm"
              :disabled="!playerName.trim()"
              @click="onConfirm"
            >
              {{ t('add') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusTrap } from '../composables/useFocusTrap.js'
import { useGameStore } from '../stores/game.js'

const { t } = useI18n()
const store = useGameStore()

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])

const playerName = ref('')
const errorMsg = ref('')
const inputRef = ref(null)
const overlayRef = ref(null)

useFocusTrap(overlayRef, () => props.visible)

watch(() => props.visible, async (val) => {
  if (val) {
    playerName.value = ''
    errorMsg.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

function onConfirm() {
  const name = playerName.value.trim()
  if (!name) return
  if (store.hasPlayerName(name)) {
    errorMsg.value = t('duplicatePlayerName')
    return
  }
  emit('confirm', name)
  playerName.value = ''
  errorMsg.value = ''
}

function onCancel() {
  playerName.value = ''
  errorMsg.value = ''
  emit('cancel')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.dialog-box {
  background: var(--color-content);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: var(--space-md);
}

.dialog-input-wrap {
  margin-bottom: var(--space-lg);
}

.dialog-input {
  width: 100%;
  padding: 12px var(--space-md);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  color: var(--color-text-dark);
  background: var(--color-white);
  text-align: center;
}

.dialog-input::placeholder {
  color: var(--color-disabled);
}

.dialog-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(105, 189, 185, 0.3);
}

.dialog-input--error {
  border-color: var(--color-danger);
}

.dialog-input--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(221, 89, 105, 0.3);
}

.dialog-error {
  color: var(--color-danger);
  font-size: 0.82rem;
  text-align: center;
  margin-top: var(--space-xs);
}

.dialog-actions {
  display: flex;
  gap: var(--space-sm);
}

.dialog-btn {
  flex: 1;
  padding: 12px var(--space-md);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: opacity var(--transition-fast);
}

.dialog-btn:active {
  opacity: 0.8;
}

.dialog-btn--cancel {
  background: var(--color-gray-light);
  color: var(--color-text-dark);
}

.dialog-btn--confirm {
  background: var(--color-primary);
  color: var(--color-white);
}

.dialog-btn--confirm:disabled {
  background: var(--color-disabled);
  cursor: not-allowed;
}

/* Transition */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity var(--transition-normal);
}
.dialog-enter-active .dialog-box,
.dialog-leave-active .dialog-box {
  transition: transform var(--transition-normal);
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .dialog-box {
  transform: scale(0.9);
}
.dialog-leave-to .dialog-box {
  transform: scale(0.9);
}
</style>
