<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="dialog-overlay" ref="overlayRef" tabindex="-1" @click.self="onCancel" @keydown.escape="onCancel">
        <div class="dialog-box">
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn--cancel" @click="onCancel">
              {{ cancelText }}
            </button>
            <button class="dialog-btn dialog-btn--confirm" @click="onConfirm">
              {{ confirmText }}
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

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const overlayRef = ref(null)

useFocusTrap(overlayRef, () => props.visible)

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    overlayRef.value?.focus()
  }
})

function onConfirm() {
  emit('confirm')
}
function onCancel() {
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

.dialog-message {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-dark);
  text-align: center;
  margin-bottom: var(--space-lg);
  line-height: 1.5;
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
  background: var(--color-danger);
  color: var(--color-white);
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
