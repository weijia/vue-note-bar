import { createApp, ref } from 'vue'
import NotebookBar from './NotebookBar.vue'
import { logDemo } from './debug'

const App = {
  components: { NotebookBar },
  setup() {
    const notebooks = ref([
      { name: 'MyNotes', type: 'pouchdb' },
      { name: 'GitNotes', type: 'git' },
      { name: 'WebNotes', type: 'webdav' }
    ])
    const current = ref('MyNotes')
    const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('saved')

    return {
      notebooks,
      current,
      saveStatus,
      onSwitch: (n: string) => {
        current.value = n
        logDemo.log('switch', n)
      },
      onNew: () => logDemo.log('new'),
      onDelete: (n: string) => logDemo.log('delete', n),
      onConfig: () => logDemo.log('config'),
      onManualSave: () => logDemo.log('manual-save'),
      onToggleSidebar: () => logDemo.log('toggle-sidebar')
    }
  },
  template: `
    <NotebookBar
      :notebooks="notebooks"
      :current="current"
      :save-status="saveStatus"
      @switch="onSwitch"
      @new="onNew"
      @delete="onDelete"
      @config="onConfig"
      @manual-save="onManualSave"
      @toggle-sidebar="onToggleSidebar"
    />
  `
}

createApp(App).mount('#app')
