import { createApp, ref } from 'vue'
import NotebookBar from './NotebookBar.vue'

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
        console.log('switch', n)
      },
      onNew: () => console.log('new'),
      onDelete: (n: string) => console.log('delete', n),
      onConfig: () => console.log('config'),
      onManualSave: () => console.log('manual-save'),
      onToggleSidebar: () => console.log('toggle-sidebar')
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
