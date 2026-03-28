# CRUD 组件接入示例

本文档是《通用 CRUD 内核使用指南》的补充，专门给出常见组件的接入配方。

如果你只想知道“某个组件怎么接”，直接看这一篇。

## 使用原则

通用 CRUD 内核对组件的要求只有一件事：

- 你要明确这个组件用哪个属性作为值
- 你要明确这个组件用哪个事件把新值抛出来

默认协议是：

- `modelProp = 'value'`
- `updateEvent = 'update:value'`

如果组件本身就遵循这个协议，通常只需要写 `component` 和 `props`。

页面级按钮文案、弹窗标题、成功提示不再分散定义，统一放在 CRUD 配置的 `create` / `edit` / `delete` 三组动作配置中。

## 1. 文本输入 `NInput`

### 场景

- 普通名称
- 编码
- URL
- 描述

### 示例

```ts
{
  key: 'name',
  label: '名称',
  component: 'input',
  placeholder: '请输入名称',
}
```

### 带额外属性

```ts
{
  key: 'description',
  label: '描述',
  component: 'input',
  placeholder: '请输入描述',
  props: {
    type: 'textarea',
    autosize: {
      minRows: 3,
      maxRows: 6,
    },
  },
}
```

## 2. 数字输入 `NInputNumber`

### 示例

```ts
{
  key: 'sortingOrder',
  label: '排序',
  component: 'number',
  props: {
    min: 0,
    style: 'width: 100%',
  },
}
```

### 常见注意点

- `NInputNumber` 通常返回 `number | null`
- 表单默认值建议设为 `null`
- 后端如果必须要整数，请在 `createPayload` 中处理

## 3. 单选下拉 `NSelect`

### 示例

```ts
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

{
  key: 'enabled',
  label: '状态',
  component: 'select',
  placeholder: '请选择状态',
  options: statusOptions,
}
```

### 远程或异步选项

```ts
const optionLoading = ref(false)
const roleOptions = ref<SelectOption[]>([])

{
  key: 'roleId',
  label: '角色',
  component: 'select',
  placeholder: '请选择角色',
  options: roleOptions,
  loading: optionLoading,
  filterable: true,
}
```

如果选项数据本身来自接口，当前项目更推荐：

- API 层仍然保持纯函数
- 用 `useQuery` 管选项的 `loading / error / refresh`
- 在需要时把 `initialize` 或业务级 composable 接到 CRUD 页面里

也就是说，不要为了加载一个下拉选项，就在页面里继续复制手写一套请求状态。

## 4. 多选下拉 `NSelect`

### 示例

```ts
{
  key: 'grantTypes',
  label: '授权方式',
  component: 'select',
  placeholder: '请选择授权方式',
  options: grantTypeOptions,
  clearable: true,
  filterable: true,
  props: {
    multiple: true,
  },
}
```

### 模型建议

多选字段的表单模型建议直接使用数组：

```ts
interface FormModel {
  grantTypes: string[]
}
```

如果页面使用 `createFlatCrud*`，推荐直接在字段上做转换：

```ts
{
  key: 'grantTypes',
  formModel: {
    defaultValue: [],
    fromRecord: (record) => splitCommaSeparatedValues(record.grantTypes),
  },
  payload: {
    toValue: (value) => joinCommaSeparatedValues(value as string[]),
  },
}
```

## 5. 单选组 `NRadioGroup`

### 示例

```ts
const booleanOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
]

{
  key: 'requireProofKey',
  label: '要求 PKCE',
  component: 'radio',
  options: booleanOptions,
}
```

### 适用建议

下列场景优先用 `radio`，而不是 `select`：

- 候选值非常少
- 用户需要快速切换
- 是/否、启用/禁用等二元选择

## 6. 日期时间 `NDatePicker`

### 最简单的接法

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

### 时间戳转字符串

`NDatePicker` 常见值类型是时间戳。

如果后端要求 ISO 字符串，推荐用字段级转换：

```ts
{
  key: 'expiredAt',
  formModel: {
    defaultValue: null,
    fromRecord: (record) => (record.expiredAt ? new Date(record.expiredAt).getTime() : null),
  },
  payload: {
    toValue: (value) => (value ? new Date(value as number).toISOString() : null),
  },
}
```

## 7. 开关 `NSwitch`

### 示例

```ts
import { NSwitch } from 'naive-ui'

{
  key: 'enabled',
  label: '是否启用',
  component: NSwitch,
}
```

### 带文本

```ts
{
  key: 'enabled',
  label: '是否启用',
  component: NSwitch,
  slots: () => ({
    checked: () => '启用',
    unchecked: () => '禁用',
  }),
}
```

### 布尔值与数字值互转

如果表单想用 `boolean`，推荐直接保持 `boolean`。

如果后端需要 `1/0` 或者表单里用 `radio` 的 `1/0`：

```ts
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

## 8. 树选择 `NTreeSelect`

### 示例

```ts
import { NTreeSelect } from 'naive-ui'

{
  key: 'menuIds',
  label: '菜单',
  component: NTreeSelect,
  props: {
    clearable: true,
    multiple: true,
    filterable: true,
    options: menuTreeOptions.value,
    cascade: false,
  },
}
```

### 建议

`NTreeSelect` 的数据结构通常比 `NSelect` 复杂，建议：

- 组件数据在业务页提前整理好
- 不要在 CRUD 内核里做树结构转换
- 表单模型直接用 `Id[]`

## 9. 动态标签 `NDynamicTags`

### 场景

- scopes
- 标签集合
- 白名单列表

### 示例

```ts
import { NDynamicTags } from 'naive-ui'

{
  key: 'scopes',
  label: 'Scopes',
  component: NDynamicTags,
  props: {
    placeholder: '输入后回车',
  },
}
```

### 模型建议

```ts
interface FormModel {
  scopes: string[]
}
```

提交时如果后端需要逗号串：

```ts
{
  key: 'scopes',
  formModel: {
    defaultValue: [],
    fromRecord: (record) => splitCommaSeparatedValues(record.scopes),
  },
  payload: {
    toValue: (value) => joinCommaSeparatedValues(value as string[]),
  },
}
```

## 10. 动态输入 `NDynamicInput`

### 场景

- 回调地址列表
- 白名单 IP
- Header 配置

### 示例

```ts
import { NDynamicInput } from 'naive-ui'

{
  key: 'redirectUris',
  label: '回调地址',
  component: NDynamicInput,
  props: {
    preset: 'input',
  },
}
```

### 建议

这种组件返回值通常是数组，推荐：

- 表单模型直接用数组
- 接口层需要字符串时再转

## 11. 上传 `NUpload`

### 适用建议

上传组件通常不适合做成“零配置字段”，因为它通常涉及：

- 上传地址
- 鉴权头
- 文件状态
- 成功回调
- 最终值提取

推荐两种方式：

### 方式一：直接接入组件

```ts
import { NUpload } from 'naive-ui'

{
  key: 'files',
  label: '附件',
  component: NUpload,
  props: {
    action: '/api/upload',
    multiple: true,
  },
}
```

### 方式二：使用 `render`

当需要强业务逻辑时，优先改成 `render`：

```ts
{
  key: 'avatar',
  label: '头像',
  render: ({ value, setValue }) =>
    h(AvatarUpload, {
      value,
      'onUpdate:value': setValue,
    }),
}
```

## 12. 自定义业务组件

### 最常见的接法

```ts
import DepartmentSelector from '@/components/DepartmentSelector.vue'

{
  key: 'departmentId',
  label: '部门',
  component: DepartmentSelector,
  modelProp: 'value',
  updateEvent: 'update:value',
}
```

### 如果组件使用别的值协议

```ts
{
  key: 'departmentId',
  label: '部门',
  component: DepartmentSelector,
  modelProp: 'selectedId',
  updateEvent: 'update:selectedId',
}
```

### 最佳实践

如果一个组件会在多个 CRUD 页面反复出现，建议先把它做成“标准值组件”：

- 默认值属性统一为 `value`
- 默认更新事件统一为 `update:value`

这样业务页接入成本最低。

## 13. 使用 `render` 处理复杂布局

以下情况推荐直接使用 `render`：

- 一个字段内部要组合多个子组件
- 一个字段依赖复杂联动
- 一个字段需要明显自定义布局
- 组件接入协议不稳定

### 示例

```ts
{
  key: 'duration',
  label: '有效期',
  render: ({ value, setValue, mode }) =>
    h('div', { class: 'flex gap-2' }, [
      h(NInputNumber, {
        value: value?.amount ?? null,
        min: 1,
        'onUpdate:value': (amount) => setValue({
          ...(value ?? {}),
          amount,
        }),
      }),
      h(NSelect, {
        value: value?.unit ?? 'day',
        options: [
          { label: '天', value: 'day' },
          { label: '小时', value: 'hour' },
        ],
        disabled: mode === 'edit',
        'onUpdate:value': (unit) => setValue({
          ...(value ?? {}),
          unit,
        }),
      }),
    ]),
}
```

## 14. 使用 `slots` 给组件传插槽

有些 Naive UI 组件支持插槽增强显示，字段可通过 `slots` 传递。

### 示例

```ts
{
  key: 'status',
  label: '状态',
  component: NSwitch,
  slots: () => ({
    checked: () => '启用',
    unchecked: () => '禁用',
  }),
}
```

## 15. 搜索字段与表单字段使用不同组件

这是完全允许的，而且很常见。

示例：

- 搜索区使用 `select`
- 编辑表单使用 `radio`

```ts
const fields = [
  {
    key: 'enabled',
    form: {
      label: '状态',
      component: 'radio',
      options: booleanOptions,
    },
    search: {
      label: '状态',
      component: 'select',
      options: booleanOptions,
      clearable: true,
    },
    table: {
      title: '状态',
      render: (record) => (record.enabled ? '启用' : '禁用'),
    },
  },
]
```

## 16. 典型数据转换模板

### 布尔值

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

### 逗号串和数组

```ts
import { joinCommaSeparatedValues, splitCommaSeparatedValues } from '@/components'

{
  key: 'scopes',
  formModel: {
    defaultValue: [],
    fromRecord: (record) => splitCommaSeparatedValues(record.scopes),
  },
  payload: {
    toValue: (value) => joinCommaSeparatedValues(value as string[]),
  },
}
```

### 对象引用和 ID

```ts
import { createRelation, pickRelationId } from '@/components'

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
```

## 17. 组件选择建议

推荐按下面的标准选组件：

- `input`
  - 文本、编码、URL、名称
- `number`
  - 排序、权重、数量、索引
- `radio`
  - 候选项很少，通常 2 到 4 个
- `select`
  - 候选项较多，或需要搜索
- `NTreeSelect`
  - 树形层级关系
- `NSwitch`
  - 简单布尔开关
- `NDatePicker`
  - 日期、时间、日期时间
- `NDynamicTags`
  - 可编辑标签集合
- `NDynamicInput`
  - 列表型字符串输入
- `render`
  - 以上都不适合时

## 18. 推荐封装哪些业务组件

如果你发现以下逻辑在多个页面反复出现，建议封装成独立组件再接入 CRUD：

- 用户选择器
- 部门树选择器
- 菜单选择器
- 图标选择器
- 文件上传器
- 多段时间配置组件
- 权限表达式编辑器

这样通用 CRUD 不需要知道业务细节，业务页字段配置也会更干净。

## 19. 示例：接入 OAuth2 客户端字段

下面是比较典型的一组字段：

```ts
const formFields = [
  {
    key: 'clientId',
    label: '客户端 ID',
    component: 'input',
  },
  {
    key: 'authorizationGrantTypes',
    label: '授权方式',
    component: 'select',
    options: grantTypeOptions,
    props: {
      multiple: true,
    },
  },
  {
    key: 'requireProofKey',
    label: '要求 PKCE',
    component: 'radio',
    options: booleanOptions,
  },
  {
    key: 'expiredAt',
    label: '过期时间',
    component: NDatePicker,
    props: {
      type: 'datetime',
      style: 'width: 100%',
    },
  },
]
```

## 20. 什么时候不该继续抽象

如果出现下面这些情况，不要强行继续抽象成字段配置：

- 字段之间有非常复杂的双向联动
- 一个弹窗本质上已经是业务工作流，不只是 CRUD
- 提交逻辑强依赖中间态
- 一个字段其实是完整的子表单

这时候建议：

- 继续复用 `CrudPage` / `CrudList` 的加载和弹窗框架
- 但具体表单区域改成自定义组件或 `render`

## 参考

- [通用 CRUD 内核使用指南](/zh-cn/admin-ui/development/crud-kernel)
- [Vue 官方文档：动态组件](https://vuejs.org/guide/essentials/component-basics)
- [Naive UI 官方文档](https://www.naiveui.com/)
