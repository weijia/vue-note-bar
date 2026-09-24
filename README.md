# vue-note-bar

一个 Vue 3 顶栏组件 `<NotebookBar>`：负责笔记本的**切换 / 新建 / 删除 / 触发配置 / 手动保存状态显示**。它不碰笔记内容、不创建任何数据连接、不操作 localStorage。

## 安装

```bash
npm install vue-note-bar
```

> 需要 `vue@^3.3` 作为 peerDependency。

## 在打包工具中使用（ESM）

```ts
import { createApp } from 'vue'
import NotebookBar from 'vue-note-bar'
import App from './App.vue'

// 方式一：作为插件全局注册
createApp(App).use(NotebookBar).mount('#app')

// 方式二：局部引入
// import { NotebookBar } from 'vue-note-bar'
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NotebookBar } from 'vue-note-bar'

const notebooks = ref([
  { name: 'MyNotes', type: 'pouchdb' },
  { name: 'GitNotes', type: 'git' }
])
const current = ref('MyNotes')
</script>

<template>
  <NotebookBar
    :notebooks="notebooks"
    :current="current"
    save-status="saved"
    @switch="(n) => (current = n)"
    @new="onCreate"
    @delete="onDelete"
    @config="onConfig"
    @manual-save="onSave"
    @toggle-sidebar="onToggle"
  />
</template>
```

> 样式已随 JS 自动注入，无需额外引入 CSS 文件。

## 在网页中直接使用（CDN / `<script>`）

无需打包工具，直接通过 `<script>` 引入即可（样式会自动注入）：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/vue-note-bar/dist/vue-note-bar.umd.cjs"></script>

<div id="app">
  <notebook-bar
    :notebooks="notebooks"
    current="MyNotes"
    save-status="saved"
    @switch="onSwitch"
    @new="onCreate"
    @delete="onDelete"
    @config="onConfig"
    @manual-save="onSave"
    @toggle-sidebar="onToggle"
  ></notebook-bar>
</div>

<script>
  const { createApp, ref } = Vue
  createApp({
    setup() {
      const notebooks = ref([{ name: 'MyNotes', type: 'pouchdb' }])
      return {
        notebooks,
        onSwitch: (n) => console.log('switch', n),
        onCreate: () => console.log('new'),
        onDelete: (n) => console.log('delete', n),
        onConfig: () => console.log('config'),
        onSave: () => console.log('manual-save'),
        onToggle: () => console.log('toggle-sidebar')
      }
    }
  })
    // UMD 全局 NotebookBar 是命名空间，默认导出（带 install 的组件）为 .default
    .use(NotebookBar.default)
    .mount('#app')
</script>
```

## Props

| Prop          | 类型                                  | 必填 | 说明                                            |
| ------------- | ------------------------------------- | ---- | ----------------------------------------------- |
| `notebooks`   | `{ name: string; type: string }[]`    | ✅   | 已有笔记本列表，`type` 用于显示图标             |
| `current`     | `string`                              | ✅   | 当前选中的笔记本 `name`                         |
| `saveStatus`  | `'idle' \| 'saving' \| 'saved' \| 'error'` | ❌  | 默认 `'idle'`，保存状态指示器（仅显示）         |
| `disabled`    | `boolean`                             | ❌   | 默认 `false`，加载中时禁用所有操作              |

## Emits

| Emit             | 载荷           | 触发时机                                   |
| ---------------- | -------------- | ------------------------------------------ |
| `switch`         | `name: string` | 下拉切换笔记本                             |
| `new`            | —              | 点击 `+` 新建按钮                          |
| `delete`         | `name: string` | 点击 `×`（先 `confirm` 确认，确认后才抛出）|
| `config`         | —              | 点击齿轮按钮                               |
| `manual-save`    | —              | 点击保存按钮                               |
| `toggle-sidebar` | —              | 点击移动端菜单按钮                         |

## 行为说明

- 下拉为**受控**自定义 `div` 下拉（非原生 `select`），点击项直接 `emit('switch')`。
- `delete` 仅在 `notebooks.length > 1` 时显示，且内部先 `confirm()`，确认后才 `emit`。
- `saved` 状态由组件内部在 **3 秒后自动回 `idle`**，父组件无需管理。
- `saveStatus` 映射：`idle` 隐藏 / `saving` 黄色「保存中…」/ `saved` 绿色「已保存」/ `error` 红色「保存失败」。
- `< 768px` 时：菜单按钮显示、笔记本名截断、保存状态只留圆点不显示文字。

## 边界（明确不做）

不创建 PouchDB / Git / WebDAV 连接，不存储到 localStorage，不渲染配置表单，不控制侧栏 `open` 状态，不处理笔记 CRUD。

## 发布

打 `v*` tag 推送后会触发 GitHub Actions 自动构建并发布到 npm：

```bash
npm version patch
git push && git push --tags
```

需在仓库 `Settings → Secrets` 配置 `NPM_TOKEN`（npm 账号的 Automation Token）。
