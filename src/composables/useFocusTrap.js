import { watch, nextTick, onUnmounted } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Traps focus within a container element while a reactive `active` flag is true.
 * Restores focus to the previously focused element when deactivated.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - ref to the container element
 * @param {import('vue').Ref<boolean>|() => boolean} active - reactive boolean or getter
 */
export function useFocusTrap(containerRef, active) {
  let previouslyFocused = null

  function getFocusableElements() {
    if (!containerRef.value) return []
    return [...containerRef.value.querySelectorAll(FOCUSABLE_SELECTOR)]
      .filter(el => el.offsetParent !== null) // visible only
  }

  function onKeydown(e) {
    if (e.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === first || !containerRef.value.contains(document.activeElement)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === last || !containerRef.value.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  function activate() {
    previouslyFocused = document.activeElement
    document.addEventListener('keydown', onKeydown, true)
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown, true)
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      nextTick(() => previouslyFocused.focus())
    }
    previouslyFocused = null
  }

  const getter = typeof active === 'function' ? active : () => active.value

  watch(getter, (val) => {
    if (val) {
      nextTick(() => activate())
    } else {
      deactivate()
    }
  })

  onUnmounted(() => {
    deactivate()
  })
}
