# 通用 CRUD 内核使用指南

## 适用范围

本文档说明 Avalon Admin UI 当前的通用 CRUD 内核如何使用。

这套内核的目标不是再维护一组固定的 `type: 'input' | 'select' | ...` 分支，而是：

- 让业务页通过 schema 描述表单、搜索区和表格
- 让 CRUD 内核只负责分页、加载、提交、删除、校验和弹窗
- 让业务页可以直接接入任意 Naive UI 组件，必要时也可以接入自定义组件

如果你要新增一个 CRUD 页面，优先复用这套内核，而不是重新写一套页面骨架。

## 设计思路

当前内核采用“组件驱动”的字段协议：

- 字段通过 `component` 指定要渲染的控件
- 可以使用内置别名：`input`、`number`、`select`、`radio`
- 也可以直接传入 Vue 组件或 Naive UI 组件
- 通过 `modelProp` 和 `updateEvent` 适配不同组件的值绑定协议
- 通过 `props`、`options`、`slots`、`render` 扩展复杂 UI

因此，后续新增 `NDatePicker`、`NSwitch`、`NTreeSelect`、`NUpload` 这类组件时，不需要修改 CRUD 核心，只需要在业务页字段上配置即可。

界面动作配置也已经统一收敛到三组：

- `create`
  - 控制新增按钮、弹窗标题、提交成功文案
- `edit`
  - 控制编辑弹窗标题、提交成功文案
- `delete`
  - 控制删除确认文案、删除成功文案

## 核心组成

通用 CRUD 由以下部分组成：

- `CrudPage`
  - 用于分页场景
- `CrudList`
  - 用于非分页场景
- `CrudFieldControl`
  - 统一渲染搜索字段和表单字段
- `createCrudConfig`
  - 组装分页 CRUD 配置
- `createCrudListConfig`
  - 组装列表 CRUD 配置
- `createFlatCrudInterfaceSchema`
  - 用更扁平的方式定义字段
- `createFlatCrudPageSchema`
  - 用扁平字段定义分页 CRUD 的页面逻辑
- `createFlatCrudListSchema`
  - 用扁平字段定义列表 CRUD 的页面逻辑
- `toFlagValue` / `fromFlagValue`
  - 处理 `boolean` 和 `1/0` 互转
- `splitCommaSeparatedValues` / `joinCommaSeparatedValues`
  - 处理逗号串和数组互转
- `pickRelationId` / `collectRelationIds`
  - 从关联对象或关联数组中提取 ID
- `createRelation` / `createRelations`
  - 把 ID 或 ID 数组转回 `{ id }` 结构
- `useQuery` / `useMutation`
  - 管理请求状态、错误和成功回调
- `useCrudPageData` / `useCrudListData`
  - 管理 CRUD 列表加载、查询和分页
- `useCrudDialog`
  - 管理 CRUD 弹窗、编辑态详情加载和表单回填

## 请求与状态分层

当前仓库已经把请求层拆成三层：

- `src/api/*`
  - 纯接口函数
  - 只负责 HTTP、参数组装、响应 `Zod parse`
- `src/composables/request/*`
  - 通用请求状态机
  - 包括 `useAsyncTask`、`useQuery`、`useMutation`
- `src/composables/crud/*`
  - CRUD 页面级编排
  - 包括 `useCrudPageData`、`useCrudListData`、`useCrudDialog`

这样拆的原因很直接：

- API 层应该保持纯函数，方便在组件、store、路由守卫里复用
- 请求状态如 `loading / error / refresh / mutate` 不应该散落在每个页面里
- CRUD 内核组件应该只关心渲染和少量页面编排，不再手写整套请求状态机

### 为什么不是一个万能 `useRequest`

当前实现没有做一个“大而全”的 `useRequest`，而是拆成：

- `useAsyncTask`
  - 最底层执行器
  - 负责最近一次请求生效、状态更新和事件钩子
- `useQuery`
  - 负责读取类请求
- `useMutation`
  - 负责提交类请求

这样比万能胶式的 `useRequest` 更稳定：

- 读写职责清晰
- 不会把分页、搜索、提交、删除全部塞进一个 composable
- 后续在业务页组合时更自然

### VueUse 的使用位置

当前请求组合式没有为了“用了 VueUse”而强行依赖一堆函数，而是只借用了合适的能力：

- `tryOnMounted`
  - 用于在 composable 内安全地触发初始化加载
- `createEventHook`
  - 用于暴露成功 / 失败事件钩子

这类能力适合放在请求状态层。

反过来，不建议：

- 把 API 层直接做成 composable
- 用 VueUse 直接替代整个请求架构
- 在每个业务页里重复手写 `loading / error / refresh`

### 非标准页面如何处理

并不是所有页面都应该强行套进 `CrudPage` / `CrudList`。

像菜单页这类“左侧树 + 右侧表格 + 自定义弹窗”的页面，更适合：

- 继续保留页面自己的业务布局
- 直接在页面里组合 `useQuery` / `useMutation`
- 只把通用请求状态机抽走，不硬塞进通用 CRUD 内核

判断标准：

- 如果页面骨架接近标准 CRUD，优先复用 `CrudPage` / `CrudList`
- 如果页面布局已经明显超出标准 CRUD，就直接组合请求 composable

## 字段协议

### `CrudFieldConfig`

一个字段的核心结构如下：

```ts
interface CrudFieldConfig {
  key: string
  label: string
  component?: 'input' | 'number' | 'select' | 'radio' | Component
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  props?: Record<string, unknown> | ((context) => Record<string, unknown>)
  options?: SelectOption[] | Ref<SelectOption[]> | ((context) => SelectOption[])
  loading?: boolean | Ref<boolean> | ((context) => boolean)
  disabled?: boolean | Ref<boolean> | ((context) => boolean)
  modelProp?: string
  updateEvent?: string
  slots?: (context) => Record<string, () => VNodeChild>
  render?: (context) => VNodeChild
}
```

字段中的重点属性：

- `key`
  - 对应表单模型 / 搜索模型的字段名
- `label`
  - 表单项标题
- `component`
  - 控件类型或组件本体
- `props`
  - 传给组件的属性
- `options`
  - 选项型组件的数据源
- `modelProp`
  - 组件值绑定属性名，默认是 `value`
- `updateEvent`
  - 组件更新事件名，默认是 `update:value`
- `render`
  - 自定义渲染，优先级最高

### `CrudFieldContext`

以下属性可用于动态 `props` / `options` / `disabled`：

```ts
interface CrudFieldContext {
  mode: 'create' | 'edit'
  model: object
}
```

适用场景：

- 编辑态禁用主键
- 根据其它字段值动态切换候选项
- 仅创建态显示某些组件属性

示例：

```ts
{
  key: 'clientId',
  label: '客户端 ID',
  component: 'input',
  disabled: ({ mode }) => mode === 'edit',
}
```

## 内置组件别名

为了减少重复配置，内核内置了四个常用别名：

- `input`
  - 对应普通文本输入
- `number`
  - 对应数字输入
- `select`
  - 对应下拉选择
- `radio`
  - 对应单选组

这几个别名只是语法糖。

如果需求超出这四类，请直接传真实组件。

## 值绑定规则

默认情况下，CRUD 字段按下面的规则绑定值：

- `modelProp`
  - 默认值：`value`
- `updateEvent`
  - 默认值：`update:value`

这意味着绝大多数 Naive UI 表单组件可以直接接入。

如果某个组件不是 `value` / `update:value` 协议，可以显式指定：

```ts
{
  key: 'enabled',
  label: '启用',
  component: NSwitch,
  modelProp: 'value',
  updateEvent: 'update:value',
}
```

如果未来接入的组件是 `checked` / `update:checked` 风格，也可以这样配置：

```ts
{
  key: 'checked',
  label: '勾选',
  component: SomeCheckbox,
  modelProp: 'checked',
  updateEvent: 'update:checked',
}
```

## `CrudPage` 用法

### 适用场景

使用 `CrudPage` 的场景：

- 列表需要分页
- 后端提供 `page` 接口
- 查询条件和分页参数一起提交

### 基本结构

```vue
<script setup lang="ts">
import { createCrudConfig, CrudPage } from '@/components'

const interfaceSchema = {
  create: {
    buttonLabel: '新增数据',
    dialogTitle: '新增数据',
    successMessage: '新增成功',
  },
  delete: {
    confirmMessage: '确认删除吗？',
    successMessage: '删除成功',
  },
  edit: {
    dialogTitle: '编辑数据',
    successMessage: '更新成功',
  },
  formFields: [],
  searchFields: [],
  tableColumns: [],
}

const pageSchema = {
  loadPage,
  mapRecordToFormModel,
  createRecord,
  createFormModel,
  createPayload,
  createSearchModel,
  deleteRecord,
  updateRecord,
}

const config = createCrudConfig({
  interface: interfaceSchema,
  page: pageSchema,
})
</script>

<template>
  <CrudPage :config="config" />
</template>
```

如果页面使用的是 `createFlatCrudPageSchema`，上面这几个模型钩子可以由字段定义自动生成：

- `mapRecordToFormModel`
- `createFormModel`
- `createPayload`
- `createSearchModel`

### `pageSchema` 必填项

- `loadPage`
  - 加载分页数据
- `mapRecordToFormModel`
  - 记录转表单模型
- `createRecord`
  - 新增请求
- `createFormModel`
  - 创建空表单
- `createPayload`
  - 表单转请求体
- `createSearchModel`
  - 创建空搜索模型
- `deleteRecord`
  - 删除请求
- `updateRecord`
  - 更新请求

### 可选项

- `initialize`
  - 页面初始化时执行，常用于加载下拉数据
- `loadRecordForEdit`
  - 编辑前先按 ID 拉详情

推荐在以下情况使用 `loadRecordForEdit`：

- 列表接口返回的是摘要字段
- 编辑表单字段多于表格列字段
- 某些敏感字段只会在详情接口里返回

## `CrudList` 用法

### 适用场景

使用 `CrudList` 的场景：

- 数据量较小
- 页面不需要分页
- 后端只提供 `list` 接口

### 基本结构

```vue
<script setup lang="ts">
import { createCrudListConfig, CrudList } from '@/components'

const interfaceSchema = { ... }

const listSchema = {
  loadList,
  mapRecordToFormModel,
  createRecord,
  createFormModel,
  createPayload,
  createSearchModel,
  deleteRecord,
  updateRecord,
}

const config = createCrudListConfig({
  interface: interfaceSchema,
  list: listSchema,
})
</script>

<template>
  <CrudList :config="config" />
</template>
```

如果页面使用的是 `createFlatCrudListSchema`，同样可以让字段定义自动生成表单模型和提交模型。

## 推荐的数据分层

建议在业务页里区分四种模型：

- `Record`
  - 表格或接口返回的业务实体
- `Query`
  - 搜索模型
- `FormModel`
  - 弹窗表单模型
- `Payload`
  - 实际提交给后端的请求体

不要假设这四种结构总是一致。

典型场景：

- 表单中的 `select` 可能是 `number | null`
- 提交给后端时要转成 `{ id }`
- 表单中的多选是 `string[]`
- 提交时后端要求逗号串

接口层本身也建议再做一层“响应模型标准化”：

- 查询参数继续用共享工具整理
- 响应数据优先在 API 层用 `Zod` 做 `parse`
- 只对确实会漂移的字段声明 schema
- 其余字段使用 `looseObject` 保留，不要重复手写整份 normalizer

这样做的目标不是把每个接口都写成很重的 schema，而是：

- 把 `id / boolean / number / 嵌套对象` 这类不稳定字段集中收口
- 删除只有一两行、没有实际价值的 `normalizeXXX`
- 让业务页拿到的永远是稳定模型

## 选项型字段

### 静态选项

```ts
const booleanOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
]

{
  key: 'enabled',
  label: '是否启用',
  component: 'radio',
  options: booleanOptions,
}
```

### 动态选项

```ts
const roleOptions = ref<SelectOption[]>([])
const optionLoading = ref(false)

{
  key: 'roleIds',
  label: '角色',
  component: 'select',
  options: roleOptions,
  loading: optionLoading,
  props: {
    multiple: true,
  },
}
```

### 动态禁用

```ts
{
  key: 'parentId',
  label: '父菜单',
  component: 'select',
  disabled: ({ model }) => Boolean((model as any).isRoot),
}
```

## 任意组件接入

### 接入 Naive UI 组件

以 `NDatePicker` 为例：

```ts
import { NDatePicker } from 'naive-ui'

{
  key: 'expiredAt',
  label: '过期时间',
  component: NDatePicker,
  props: {
    type: 'datetime',
    clearable: true,
    style: 'width: 100%',
  },
}
```

以 `NSwitch` 为例：

```ts
import { NSwitch } from 'naive-ui'

{
  key: 'enabled',
  label: '是否启用',
  component: NSwitch,
}
```

### 接入自定义业务组件

```ts
import UserSelector from '@/components/UserSelector.vue'

{
  key: 'ownerId',
  label: '负责人',
  component: UserSelector,
  modelProp: 'value',
  updateEvent: 'update:value',
  props: {
    clearable: true,
  },
}
```

### 使用 `slots`

当组件本身需要命名插槽时，可以使用 `slots`：

```ts
{
  key: 'icon',
  label: '图标',
  component: SomePicker,
  slots: () => ({
    prefix: () => 'Icon',
  }),
}
```

### 使用 `render`

当字段非常特殊，已经不适合抽象成普通组件字段时，直接使用 `render`：

```ts
{
  key: 'customField',
  label: '自定义字段',
  render: ({ value, setValue }) => h(MyComplexEditor, {
    value,
    'onUpdate:value': setValue,
  }),
}
```

建议把 `render` 作为逃生口使用，而不是常规写法。

## `createFlatCrud*` 系列辅助函数

如果页面字段多、结构规整，推荐使用 `createFlatCrudInterfaceSchema`、`createFlatCrudPageSchema`、`createFlatCrudListSchema`。

优点：

- 更适合把“表单 / 搜索 / 表格”围绕同一个字段定义组织起来
- 字段集中，维护成本更低
- 新增一个字段时只需要改一个对象

### 示例

```ts
const fields = [
  {
    key: 'id',
    formModel: {
      defaultValue: null,
      fromRecord: (record) => record.id ?? null,
    },
    payload: {
      omitWhen: (value) => !hasId(value),
    },
  },
  {
    key: 'name',
    trim: true,
    form: {
      label: '名称',
      component: 'input',
      placeholder: '请输入名称',
      rules: [{ required: true, message: '请输入名称', trigger: ['input', 'blur'] }],
    },
    search: {
      label: '名称',
      component: 'input',
      placeholder: '输入名称',
    },
    table: {
      title: '名称',
      width: 160,
    },
  },
  {
    key: 'roleIds',
    formModel: {
      defaultValue: [],
      fromRecord: (record) => collectRelationIds(record.roles),
    },
    payload: {
      key: 'roles',
      toValue: (value) => createRelations(value as Id[]),
    },
    form: {
      label: '角色',
      component: 'select',
      options: roleOptions,
      props: {
        multiple: true,
      },
      defaultValue: [],
    },
  },
]
```

这里新增了两个关键能力：

- `formModel`
  - 定义表单模型默认值，以及“记录 -> 表单模型”的字段级转换
- `payload`
  - 定义“表单模型 -> 提交 payload”的字段级转换、目标字段名和省略规则

常见用途：

- 隐藏 `id` 字段，但编辑提交时仍然自动带上
- 把 `record.role?.id` 映射成 `roleId`
- 把 `record.roles` 映射成 `roleIds`
- 把 `boolean` 映射成 `radio/select` 的 `1/0`
- 把 `string[]` 映射成后端要求的逗号串

然后：

```ts
const interfaceSchema = createFlatCrudInterfaceSchema<User, UserFormModel>({
  create: {
    buttonLabel: '新增',
    successMessage: '新增成功',
  },
  delete: {
    confirmMessage: '确认删除吗？',
    successMessage: '删除成功',
  },
  edit: {
    dialogTitle: '编辑',
    successMessage: '更新成功',
  },
  fields,
})
```

分页场景：

```ts
const pageSchema = createFlatCrudPageSchema<User, UserQuery, UserFormModel, User>({
  fields,
  loadPage: getUserPage,
  createRecord: createUser,
  deleteRecord: deleteUser,
  updateRecord: updateUser,
})
```

非分页场景：

```ts
const listSchema = createFlatCrudListSchema<Role, RoleQuery, RoleFormModel, Role>({
  fields,
  loadList: listRoles,
  createRecord: createRole,
  deleteRecord: deleteRole,
  updateRecord: updateRole,
})
```

## 编辑态详情加载

当前通用 CRUD 已经支持编辑前按需拉取详情。

使用方式：

```ts
const pageSchema = {
  loadPage,
  loadRecordForEdit: async (record) => {
    const res = await getDetail(record.id!)
    return res.data
  },
  ...
}
```

推荐在以下情况开启：

- 表格列只是摘要信息
- 编辑表单包含更多字段
- 某些字段值必须来源于详情接口

## 表格列配置

表格列仍然由 `tableColumns` 控制。

支持以下常见属性：

- `title`
- `key`
- `width`
- `fixed`
- `align`
- `valuePath`
- `render`

示例：

```ts
tableColumns: [
  {
    title: '用户名',
    key: 'username',
    width: 180,
    fixed: 'left',
  },
  {
    title: '角色',
    key: 'roles',
    render: (record) =>
      record.roles?.map((item) => item.name).join(', ') || '-',
  },
]
```

## 字段级转换建议

### 布尔值和表单单选

如果后端返回的是 `boolean`，表单里想用 `radio` 的 `1/0`，优先直接复用内核提供的辅助函数：

```ts
import { fromFlagValue, toFlagValue } from '@/components'

{
  key: 'enabled',
  formModel: {
    defaultValue: 1,
    fromRecord: (record) => toFlagValue(record.enabled, 1),
  },
  payload: {
    toValue: (value) => fromFlagValue(value as number | null),
  },
}
```

### 多选数组和逗号串

```ts
import { joinCommaSeparatedValues, splitCommaSeparatedValues } from '@/components'

{
  key: 'authorizationGrantTypes',
  formModel: {
    defaultValue: [],
    fromRecord: (record) => splitCommaSeparatedValues(record.authorizationGrantTypes),
  },
  payload: {
    toValue: (value) => joinCommaSeparatedValues(value as string[]),
  },
}
```

### 对象引用和 ID

```ts
import { createRelation, createRelations, pickRelationId, collectRelationIds } from '@/components'

{
  key: 'roleId',
  formModel: {
    defaultValue: null,
    fromRecord: (record) => pickRelationId(record.role),
  },
  payload: {
    key: 'role',
    toValue: (value) => createRelation(value as NullableId | undefined),
  },
}

{
  key: 'roleIds',
  formModel: {
    defaultValue: [],
    fromRecord: (record) => collectRelationIds(record.roles),
  },
  payload: {
    key: 'roles',
    toValue: (value) => createRelations(value as Id[]),
  },
}
```

### 隐藏表单模型字段

像 `id` 这类不展示、但编辑提交需要携带的字段，直接只配 `formModel` 和 `payload`：

```ts
{
  key: 'id',
  formModel: {
    defaultValue: null,
    fromRecord: (record) => record.id ?? null,
  },
  payload: {
    omitWhen: (value) => !hasId(value),
  },
}
```

### 什么时候仍然保留手写 schema

字段级转换适合“一个字段独立决定一个值”的场景。

如果出现下面这些情况，仍然可以回到手写 `createPayload` / `mapRecordToFormModel`：

- 一个提交字段依赖多个表单字段组合
- 字段之间有复杂联动和中间态
- 某个字段需要同时生成多个 payload 字段
- 这个弹窗已经不是单纯 CRUD，而是小型工作流

## 推荐实践

- 优先使用 `createFlatCrud*` 的 `formModel` / `payload` 做单字段转换
- 通用转换优先复用现成辅助函数，不要在每个页面重复手写
- API 层优先使用 `Zod schema parse` 收口响应纠偏，不要扩散 `normalizeXXX`
- 请求状态优先收口到 `useQuery` / `useMutation`，不要在每个页面重复写 `loading / error`
- CRUD 列表和弹窗状态优先放进 `useCrudPageData` / `useCrudListData` / `useCrudDialog`
- 静态字段用 `component: 'input'` 这类内置别名即可
- 复杂组件直接传组件本体
- 表单字段和搜索字段可以是不同组件
- 编辑态如果数据不完整，务必使用 `loadRecordForEdit`
- 能用 `props` 解决的，不要先上 `render`
- 只有明显超出 schema 表达能力时，再使用 `render`

## 不推荐的做法

- 为每个新组件继续给内核增加 `if/else`
- 在业务页重复写相同的 `mapRecordToFormModel` / `createPayload`
- 把字段级转换硬塞进 `CrudPage` / `CrudList` 组件运行时代码
- 在 API 层为每个简单实体继续复制粘贴一份薄薄的 `normalizeXXX`
- 假设列表返回字段总能满足编辑表单
- 在业务页复制整套 CRUD 页面骨架
- 把 `render` 当成默认方案，导致字段配置失去可维护性

## 完整示例

下面是一个带分页、下拉选项、隐藏 `id`、关联数组转 `roles` 的完整示例：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createUser, deleteUser, getUserPage, listRoles, updateUser } from '@/api'
import {
  collectRelationIds,
  createCrudConfig,
  createFlatCrudInterfaceSchema,
  createFlatCrudPageSchema,
  createRelations,
  CrudPage,
  hasId,
  toSelectOptions,
} from '@/components'

const optionLoading = ref(false)
const roleOptions = ref([])

async function loadOptions() {
  optionLoading.value = true
  try {
    const roleRes = await listRoles()
    roleOptions.value = toSelectOptions(roleRes.data)
  } finally {
    optionLoading.value = false
  }
}

const fields = [
  {
    key: 'id',
    formModel: {
      defaultValue: null,
      fromRecord: (record) => record.id ?? null,
    },
    payload: {
      omitWhen: (value) => !hasId(value),
    },
  },
  {
    key: 'username',
    trim: true,
    form: {
      label: '用户名',
      component: 'input',
      placeholder: '例如：ash',
      rules: [{ required: true, message: '请输入用户名', trigger: ['input', 'blur'] }],
    },
    search: {
      label: '用户名',
      component: 'input',
      placeholder: '输入用户名',
    },
    table: {
      title: '用户名',
      width: 160,
    },
  },
  {
    key: 'roleIds',
    formModel: {
      defaultValue: [],
      fromRecord: (record) => collectRelationIds(record.roles),
    },
    payload: {
      key: 'roles',
      toValue: (value) => createRelations(value as Id[]),
    },
    form: {
      label: '角色',
      component: 'select',
      options: roleOptions,
      loading: optionLoading,
      props: {
        multiple: true,
      },
      defaultValue: [],
    },
  },
]

const interfaceSchema = createFlatCrudInterfaceSchema<User, UserFormModel>({
  create: {
    buttonLabel: '新增用户',
    disabled: optionLoading,
    successMessage: '用户新增成功',
  },
  delete: {
    confirmMessage: '确认删除该用户吗？',
    successMessage: '用户删除成功',
  },
  edit: {
    dialogTitle: '编辑用户',
    successMessage: '用户更新成功',
  },
  fields,
})

const pageSchema = {
  initialize: loadOptions,
  ...createFlatCrudPageSchema<User, UserQuery, UserFormModel, User>({
    fields,
    loadPage: getUserPage,
    createRecord: createUser,
    deleteRecord: deleteUser,
    updateRecord: updateUser,
  }),
}

const config = createCrudConfig({
  interface: interfaceSchema,
  page: pageSchema,
})
</script>

<template>
  <CrudPage :config="config" />
</template>
```

## 迁移建议

如果你手上有旧页面仍然基于固定 `type` 分支或旧的扁平动作命名，迁移顺序建议如下：

1. 先把字段里的 `type` 改成 `component`
2. 简单输入组件先映射成内置别名
3. 特殊组件直接传 Naive UI 组件本体
4. 把界面配置统一收拢到 `create` / `edit` / `delete`
5. 优先改成 `createFlatCrud*`，把单字段转换收拢到 `formModel` 和 `payload`
6. 如果表格数据不完整，再补 `loadRecordForEdit`

## 参考

- [Vue 官方文档：动态组件](https://vuejs.org/guide/essentials/component-basics)
- [Naive UI 官方文档](https://www.naiveui.com/)
- [Naive UI Select 官方文档](https://www.naiveui.com/zh-CN/os-theme/components/select)
- [Naive UI Data Table 官方文档](https://www.naiveui.com/zh-CN/os-theme/components/data-table)
- [Naive UI Form 官方文档](https://www.naiveui.com/zh-CN/os-theme/components/form)
