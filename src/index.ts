import _NotebookBar from './NotebookBar.vue'
import type { App, Plugin } from 'vue'

// 让组件既能作为组件直接使用，也能通过 app.use(NotebookBar) 注册为插件
const NotebookBar = _NotebookBar as typeof _NotebookBar & Plugin
;(NotebookBar as unknown as Plugin).install = (app: App) => {
  app.component('NotebookBar', _NotebookBar)
}

export default NotebookBar
export { _NotebookBar as NotebookBar }
export type { NotebookItem, SaveStatus } from './NotebookBar.vue'
