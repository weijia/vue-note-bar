<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { logBar } from './debug'

export interface NotebookItem {
  name: string
  type: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const props = withDefaults(
  defineProps<{
    notebooks: NotebookItem[]
    current: string
    saveStatus?: SaveStatus
    disabled?: boolean
  }>(),
  {
    saveStatus: 'idle',
    disabled: false
  }
)

const emit = defineEmits<{
  switch: [name: string]
  new: []
  delete: [name: string]
  config: []
  'manual-save': []
  'toggle-sidebar': []
}>()

const TYPE_ICONS: Record<string, string> = {
  pouchdb: '📦',
  git: '🔧',
  webdav: '🌐'
}

function iconFor(type: string): string {
  return TYPE_ICONS[type] || '📁'
}

const open = ref(false)
const currentType = computed(
  () => props.notebooks.find((n) => n.name === props.current)?.type ?? 'webdav'
)

function toggleDropdown() {
  if (props.disabled) {
    logBar.warn('toggleDropdown SKIP 组件已禁用')
    return
  }
  open.value = !open.value
  logBar.log('dropdown', open.value ? 'open' : 'close')
}

function selectNotebook(name: string) {
  open.value = false
  if (name === props.current) {
    logBar.log('selectNotebook 忽略重复选择', name)
    return
  }
  logBar.log('emit switch', { from: props.current, to: name })
  emit('switch', name)
}

function onNew() {
  if (props.disabled) return
  logBar.log('emit new')
  emit('new')
}

function onDelete() {
  if (props.disabled) return
  if (props.notebooks.length <= 1) {
    logBar.warn('onDelete SKIP 仅剩一个笔记本')
    return
  }
  const ok = window.confirm(`确定删除笔记本 "${props.current}"？此操作不可恢复`)
  logBar.log('onDelete confirmed', { name: props.current, confirmed: ok })
  if (ok) emit('delete', props.current)
}

function onConfig() {
  if (props.disabled) return
  logBar.log('emit config')
  emit('config')
}

function onManualSave() {
  if (props.disabled) return
  logBar.log('emit manual-save')
  emit('manual-save')
}

function onToggleSidebar() {
  if (props.disabled) return
  logBar.log('emit toggle-sidebar')
  emit('toggle-sidebar')
}

// 组件内部把 saved 状态在 3 秒后自动回 idle，父组件无需管理
const displayStatus = ref<SaveStatus>(props.saveStatus)
const statusText = computed(() => {
  switch (displayStatus.value) {
    case 'saving':
      return '保存中…'
    case 'saved':
      return '已保存'
    case 'error':
      return '保存失败'
    default:
      return ''
  }
})

let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  logBar.log('mounted', {
    current: props.current,
    notebooks: props.notebooks.length,
    disabled: props.disabled,
  })
})

watch(
  () => props.saveStatus,
  (val) => {
    logBar.log('saveStatus 变化', val)
    displayStatus.value = val
    if (val === 'saved') {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        displayStatus.value = 'idle'
        logBar.log('saved 状态自动回 idle')
      }, 3000)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  logBar.log('unmounted')
})
</script>

<template>
  <div class="nb-bar" :class="{ 'nb-disabled': disabled }">
    <button class="nb-btn nb-menu" type="button" aria-label="菜单" @click="onToggleSidebar">
      ☰
    </button>

    <div class="nb-dropdown" :class="{ open }">
      <button class="nb-select" type="button" :disabled="disabled" @click="toggleDropdown">
        <span class="nb-select-icon">{{ iconFor(currentType) }}</span>
        <span class="nb-select-name">{{ current }}</span>
        <span class="nb-caret">▾</span>
      </button>
      <ul v-if="open" class="nb-list">
        <li
          v-for="nb in notebooks"
          :key="nb.name"
          class="nb-item"
          :class="{ active: nb.name === current }"
          @click="selectNotebook(nb.name)"
        >
          <span class="nb-item-icon">{{ iconFor(nb.type) }}</span>
          <span class="nb-item-name">{{ nb.name }}</span>
        </li>
      </ul>
      <div v-if="open" class="nb-backdrop" @click="open = false" />
    </div>

    <button class="nb-btn" type="button" :disabled="disabled" aria-label="新建" @click="onNew">+</button>
    <button
      v-if="notebooks.length > 1"
      class="nb-btn"
      type="button"
      :disabled="disabled"
      aria-label="删除"
      @click="onDelete"
    >
      ×
    </button>

    <span class="nb-spacer" />

    <span class="nb-status" :class="`nb-status-${displayStatus}`">
      <span class="nb-dot" />
      <span class="nb-status-text">{{ statusText }}</span>
    </span>

    <button class="nb-btn" type="button" :disabled="disabled" aria-label="保存" @click="onManualSave">💾</button>
    <button class="nb-btn" type="button" :disabled="disabled" aria-label="配置" @click="onConfig">⚙</button>
  </div>
</template>

<style scoped>
.nb-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #1976d2;
  color: #fff;
  font-size: 14px;
  user-select: none;
}

.nb-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.nb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}

.nb-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.nb-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.nb-menu {
  display: none;
}

.nb-dropdown {
  position: relative;
}

.nb-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  max-width: 220px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.nb-select:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.nb-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nb-select-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nb-caret {
  font-size: 10px;
}

.nb-list {
  position: absolute;
  top: 36px;
  left: 0;
  min-width: 180px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  color: #333;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 200;
}

.nb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.nb-item:hover {
  background: #f0f4f8;
}

.nb-item.active {
  background: #e3f2fd;
  color: #1976d2;
}

.nb-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 150;
}

.nb-spacer {
  flex: 1 1 auto;
}

.nb-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.nb-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9e9e9e;
}

.nb-status-saving {
  color: #ffb300;
}
.nb-status-saving .nb-dot {
  background: #ffb300;
}

.nb-status-saved {
  color: #43a047;
}
.nb-status-saved .nb-dot {
  background: #43a047;
}

.nb-status-error {
  color: #e53935;
}
.nb-status-error .nb-dot {
  background: #e53935;
}

.nb-status-idle {
  display: none;
}

@media (max-width: 768px) {
  .nb-menu {
    display: inline-flex;
  }
  .nb-select {
    max-width: 120px;
  }
  .nb-select-name {
    max-width: 80px;
  }
  .nb-status-text {
    display: none;
  }
}
</style>
