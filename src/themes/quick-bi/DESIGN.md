---
version: alpha
name: quick-bi-design-system
description: Quick BI 设计系统 — 专业数据分析平台主题。以明亮清爽的白色画布为基础，品牌蓝（#1677FF）作为核心交互信号，构建企业级 BI 工具的视觉语言。Inter 字体家族承载信息层级，JetBrains Mono 处理代码与数据展示，8px/12px 圆角体系配合三级阴影建立清晰的深度层次。支持亮色/暗色双模式。

colors:
  primary: "#1677FF"
  primary-hover: "#0958d9"
  primary-light: "#e6f4ff"
  ink: "#0f172a"
  body: "#334155"
  body-weak: "#64748b"
  body-subtle: "#94a3b8"
  canvas: "#ffffff"
  surface: "#f8fafc"
  border-default: "#e2e8f0"
  border-strong: "#cbd5e1"
  success: "#16a34a"
  warning: "#d97706"
  error: "#dc2626"
  on-primary: "#ffffff"

  # 暗色模式
  dark-canvas: "#0f172a"
  dark-ink: "#f8fafc"
  dark-primary: "#3b82f6"
  dark-surface: "#1e293b"
  dark-border: "#1e293b"

typography:
  display-xl:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.5px
  display-lg:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.25px
  title-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  stat-display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.5px
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  button:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  preview: 6px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.border-default}"
    padding: 8px 12px
    height: 36px
  card-stat:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.border-default}"
    borderRadius: "{rounded.lg}"
    padding: 20px
    shadow: "shadow-sm"
  table-row:
    borderBottom: "1px solid {colors.border-default}"
    padding: "10px 12px"
  tag-badge:
    borderRadius: "{rounded.preview}"
    padding: "2px 8px"
    typography: "{typography.caption}"
  pagination-btn:
    width: 32px
    height: 32px
    borderRadius: "{rounded.sm}"
    borderWidth: "1px"
---

## 1. 视觉主题与氛围

### 品牌背景

Quick BI 是阿里云推出的专业商业智能（BI）数据分析平台，面向企业数据分析师、业务决策者和 IT 管理员。设计语言围绕**「让数据说话」**的理念展开——界面应退居幕后，让数据本身成为视觉焦点。

### 适用场景

- **数据分析仪表盘** — 多维图表、KPI 卡片、趋势面板
- **报表中心** — 表格列表、筛选器、分页导航
- **数据工作台** — SQL 编辑器、数据预览、字段配置
- **企业管理后台** — 用户权限、系统设置、审计日志
- **嵌入式分析** — 作为 SDK 集成到第三方 SaaS 产品中

### 不适用场景

- 消费级社交产品、电商购物流程
- 创意类工具（设计稿编辑器、视频剪辑）
- 游戏 / 娱乐类应用界面
- 需要「温暖」「活泼」或「奢华」调性的场景

### 关键词

`专业` `数据驱动` `清晰` `高效` `可信` `企业级` `明亮` `克制`

### 页面气质

整体氛围为**明亮清爽的专业工具感**。白色主画布提供最大化的数据可读性空间，品牌蓝作为唯一的主色调贯穿所有交互元素。没有装饰性渐变或纹理，信息密度中偏高但不拥挤——这是为每天要面对大量数据的分析师设计的界面，不是给 C 端用户看的营销页面。

### 信息密度

**中等偏高的信息密度**。Quick BI 的典型页面包含：顶部导航 + 筛选栏 + 数据卡片网格 + 图表区域 + 表格详情。每个屏幕的信息量较大但通过留白和分组保持清晰。Section 之间的垂直间距约 24–48px，卡片内部间距 16–20px。

### 品牌表达边界

- ✅ 蓝色用于主要操作按钮、链接、选中状态、数据高亮
- ✅ 语义色（绿/黄/红）严格用于状态指示（成功/警告/错误）
- ❌ 禁止使用非蓝色彩作为品牌色（如紫色渐变、橙色主按钮）
- ❌ 禁止使用大面积彩色背景块（除语义状态色外）
- ❌ 禁止使用阴影过重的卡片效果（保持扁平轻量）

---

## 2. 色彩系统

### 2.1 基础色板

| Token | Hex | 语义角色 | Tailwind 映射 |
|---|---|---|---|
| `{colors.primary}` | **#1677FF** | 品牌主色 — 主按钮、链接、选中态 | `bg-primary`, `text-primary` |
| `{colors.primary-hover}` | **#0958d9** | 主色悬停态 — 按钮 hover、活跃标签 | `hover:bg-primary-hover` |
| `{colors.primary-light}` | **#e6f4ff** | 主色浅底 — 选中行背景、标签底色 | `bg-primary-light` |
| `{colors.ink}` | **#0f172a** | 主文本色 — 标题、正文、重要数值 | `text-foreground` |
| `{colors.body}` | **#334155** | 次要文本 — 描述文字、表格内容 | `text-muted-foreground` |
| `{colors.body-weak}` | **#64748b** | 弱化文本 — 占位符、辅助说明 | `text-subtle` |
| `{colors.body-subtle}` | **#94a3b8** | 微弱文本 — 时间戳、禁用文字 | `text-disabled` |
| `{colors.canvas}` | **#ffffff** | 主背景色 — 页面底色、卡片填充 | `bg-background` |
| `{colors.surface}` | **#f8fafc** | 表面色 — 页面区块背景、侧边栏 | `bg-surface` |
| `{colors.border-default}` | **#e2e8f0** | 默认边框 — 输入框、分割线、卡片边框 | `border-border` |
| `{colors.border-strong}` | **#cbd5e1** | 强调边框 — focus 态、强调分隔线 | `focus:ring` 辅助 |

### 2.2 语义色

| Token | Hex | 用途 | 使用边界 |
|---|---|---|---|
| `{colors.success}` | **#16a34a** | 成功状态、正向趋势指标 | 仅用于状态标签、趋势箭头 |
| `{colors.warning}` | **#d97706** | 警告状态、待处理提示 | 仅用于状态标签、提醒图标 |
| `{colors.error}` | **#dc2626** | 错误状态、负向趋势指标 | 仅用于错误提示、危险操作 |
| `{colors.on-primary}` | **#ffffff** | 主色上的文字色 | 所有蓝色背景的文字 |

### 2.3 使用边界

- **主色 #1677FF 的使用范围**：主按钮背景、导航选中态、链接文字、图表主系列色、焦点环颜色
- **禁止场景**：不用于正文文字色、不用于大面积背景填充（除 header banner 外）、不与红色/橙色并列作为同级强调色
- **文本层级对比度要求**：
  - 主文本 (#0f172a) on 白底 → WCAG AAA ✓
  - 次要文本 (#334155) on 白底 → WCAG AA ✓
  - 弱化文本 (#64748b) on 白底 → WCAG AA ✓（大文本）
  - 微弱文本 (#94a3b8) on 白底 → WCAG AA（仅大文本）

### 2.4 暗色模式色板

| Token | 亮色值 | 暗色值 | 说明 |
|---|---|---|---|
| 背景 canvas | #ffffff | **#0f172a** | 深邃藏青黑 |
| 文本 ink | #0f172a | **#f8fafc** | 近白文本 |
| 主色 primary | #1677FF | **#3b82f6** | 更亮的蓝色以适应深底 |
| 表面 surface | #f8fafc | **#1e293b** | 深灰表面层 |
| 边框 border | #e2e8f0 | **#1e293b** | 与表面同级的微妙边框 |
| 次要文本 body | #334155 | **#94a3b8** | 反转弱化程度 |

暗色模式下所有颜色的对比度规则与亮色模式对称，确保在深色背景上同样满足 WCAG AA 标准。

---

## 3. 字体系统

### 3.1 字体家族

| 角色 | 字体族 | Fallback Chain |
|---|---|---|
| Display | **Inter** | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| Body | **Inter** | 同上 |
| Mono | **JetBrains Mono** | `ui-monospace, SFMono-Regular, 'Menlo', 'Monaco', monospace` |

Inter 承担全部显示和正文角色——无衬线几何字体，x-height 大、字距紧凑，适合数据密集型界面的长文阅读。JetBrains Mono 用于代码片段、SQL 查询、数据值等需要等宽对齐的场景。

### 3.2 字号层级

| Token | 尺寸 | 字重 | 行高 | 用途 |
|---|---|---|---|---|
| `{typography.display-xl}` | **28px** | 600 (semibold) | 1.35 | 统计数值大数字、KPI 核心指标 |
| `{typography.display-lg}` | **20px** | 600 (semibold) | 1.4 | 页面标题（h1）、仪表盘标题 |
| `{typography.title-md}` | **16px** | 600 (semibold) | 1.5 | 区块标题（h3）、卡片标题、表头 |
| `{typography.body-md}` | **14px** | 400 (regular) | 1.55 | 正文、表格内容、描述文字 |
| `{typography.body-sm}` | **13px** | 400 (regular) | 1.5 | 辅助文本、筛选项说明 |
| `{typography.caption}` | **12px** | 500 (medium) | 1.4 | 标签文字、时间戳、角标 |
| `{typography.stat-display}` | **28px** | 600 (semibold) | 1.3 | 统计卡片中的核心数值 |
| `{typography.code}` | **13px** | 400 (regular) | 1.55 | 代码块、SQL、数据格式化输出 |
| `{typography.button}` | **14px** | 500 (medium) | 1.0 | 按钮文字、导航链接 |

### 3.3 排版原则

- **标题字重统一为 600（semibold）**：不使用 700 或更重，保持克制的视觉冲击力
- **正文字重为 400（regular）**：数据密集场景下减少视觉疲劳
- **统计数值使用 28px semibold**：这是全系统最大的字号，专门用于 KPI 数字
- **代码字号 13px**：比正文略小，区分代码与自然语言的阅读预期
- **行高**：标题 1.3–1.4，正文 1.55（数据密集场景需要更宽松的行间距）

---

## 4. 组件规范

### 4.1 按钮

#### 主按钮 Primary Button
- 背景：`{colors.primary}` (#1677FF)
- 文字：`{colors.on-primary}` (#ffffff)
- 圆角：`{rounded.md}` (8px)
- 内边距：8px 16px
- 高度：36px
- 字体：`{typography.button}` (Inter 14px / 500)
- 阴影：`shadow-sm`
- Hover：背景变为 `{colors.primary-hover}` (#0958d9)，过渡 150ms ease
- Disabled：透明度 40%，cursor not-allowed

#### 次要按钮 Secondary Button
- 背景：`{colors.ink}` (#0f172a)
- 文字：白 (#ffffff)
- 其余规格同主按钮

#### 幽灵按钮 Ghost Button
- 背景：transparent
- 文字：`{colors.body}` (#334155)
- 无阴影
- Hover：背景 `{colors.surface}` (#f8fafc)

### 4.2 输入框 Text Input
- 背景：`{colors.canvas}`
- 边框：1px solid `{colors.border-default}` (#e2e8f0)
- 圆角：`{rounded.sm}` (6px)
- 内边距：8px 12px
- 高度：36px
- 占位符颜色：`{colors.body-subtle}` (#94a3b8)
- Focus 态：边框变为 `{colors.primary}` (#1677FF)，添加 ring 效果（`ring-2 ring-primary ring-offset-1`）
- Disabled：背景 `{colors.surface}`，边框 `{colors.border-default}`，文字 `{colors.body-subtle}`

### 4.3 卡片 Card

#### 统计卡片 Stat Card
- 背景：`{colors.canvas}`
- 边框：1px solid `{colors.border-default}`
- 圆角：`{rounded.lg}` (12px)
- 内边距：20px
- 默认阴影：`shadow-sm`
- Hover 阴影：`shadow-md`
- 结构：大数字 (`{typography.stat-display}` 28px) + 标签 (`{typography.body-sm}` 13px) + 趋势指示（箭头 + 百分比）
- 趋势颜色：正向 `{colors.success}`，负向 `{colors.error}`

#### 内容卡片 Content Card
- 同统计卡片规格，内边距可调整为 16–24px
- 可选 header 分割线：底部 1px `{colors.border-default}`

### 4.4 导航 Navigation

#### 顶部导航 Top Nav
- 高度：56px
- 背景：`{colors.canvas}` 或 `{colors.surface}`
- 底部边框：1px solid `{colors.border-default}`
- Logo 区域：左侧，品牌名 Inter 16px/600
- 导航项：水平排列，14px/500，默认 `{colors.body}`，选中 `{colors.primary}`
- 选中态：底部 2px `{colors.primary}` 下划线 或 `{colors.primary-light}` 背景圆角
- 右侧操作区：搜索框 + 用户头像

### 4.5 表格 Table
- 表头：`{typography.title-md}` (16px/600)，背景 `{colors.surface}`，底部 2px `{colors.border-strong}` 分割线
- 行高：44–48px
- 单元格内边距：10px 12px
- 行分割线：1px solid `{colors.border-default}`
- 斑马纹（可选）：偶数行背景 `{colors.surface}`
- 排序图标：`{colors.body-subtle}`，hover 变 `{colors.body}`
- 选中行：背景 `{colors.primary-light}` (#e6f4ff)

### 4.6 标签 Tag / Badge
- 圆角：`{rounded.preview}` (6px)
- 内边距：2px 8px
- 字体：`{typography.caption}` (12px/500)
- 类型：
  - 默认标签：背景 `{colors.surface}`，文字 `{colors.body}`
  - 蓝色标签：背景 `{colors.primary-light}`，文字 `{colors.primary}`
  - 成功标签：背景 rgba(22,163,74,0.1)，文字 `{colors.success}`
  - 警告标签：背景 rgba(217,119,6,0.1)，文字 `{colors.warning}`
  - 错误标签：背景 rgba(220,38,38,0.1)，文字 `{colors.error}`

### 4.7 弹窗 Modal / Dialog
- 遮罩层：rgba(15,23,42,0.5) 半透明深色
- 弹窗背景：`{colors.canvas}`
- 圆角：`{rounded.lg}` (12px)
- 阴影：`shadow-lg`
- 最大宽度：520px（窄弹窗）或 720px（宽弹窗）
- Header：20px 内边距，底部 1px 分割线，标题 `{typography.display-lg}` (20px/600)
- Body：20px 内边距
- Footer：16px 内边距，顶部 1px 分割线，按钮右对齐
- 关闭按钮：右上角 24×24，icon-only

### 4.8 下拉菜单 Dropdown / Select
- 背景：`{colors.canvas}`
- 边框：1px solid `{colors.border-default}`
- 圆角：`{rounded.md}` (8px)
- 阴影：`shadow-md`
- 项高度：36px
- 项内边距：8px 12px
- Hover 项：背景 `{colors.surface}`
- 选中项：背景 `{colors.primary-light}`，文字 `{colors.primary}`

### 4.9 分页 Pagination
- 按钮尺寸：32 × 32px
- 圆角：`{rounded.sm}` (6px)
- 边框：1px solid `{colors.border-default}`
- 当前页：背景 `{colors.primary}`，文字白色
- 其他页：背景透明，文字 `{colors.body}`
- Hover：背景 `{colors.surface}`

---

## 5. 布局与间距

### 5.1 容器宽度

- **最大内容宽度**：1440px（桌面端），居中对齐
- **侧边栏宽度**：240px（固定）或 200px（折叠态）
- **主内容区**：剩余可用宽度，最小 768px
- **内边距**：桌面端 24px，平板 16px，移动端 12px

### 5.2 间距体系（4px 倍数）

| Token | 值 | 典型用途 |
|---|---|---|
| `{spacing.xxs}` | 4px | 图标与文字间距、紧密元素间隙 |
| `{spacing.xs}` | 6px | 标签内边距、小组件内部间距 |
| `{spacing.sm}` | 8px | 按钮内边距纵向、相邻小元素间距 |
| `{spacing.md}` | 12px | 按钮内边距横向、表单元素间距 |
| `{spacing.base}` | 16px | 卡片内部标准间距、列表项间距 |
| `{spacing.lg}` | 20px | Section 内部子区域间距 |
| `{spacing.xl}` | 24px | Section 之间间距、卡片组间距 |
| `{spacing.xxl}` | 32px | 大 Section 之间的节奏间隔 |
| `{spacing.section}` | 48px | 页面顶级区块之间的分隔距离 |

### 5.3 栅格系统

- **基础栅格**：12 列，列间距 16px（`gap-4`）
- **统计卡片网格**：桌面端 4 列 → 平板 2 列 → 移动端 1 列
- **图表区域**：桌面端 2 列（左大右小 7:5 或均分）→ 移动端堆叠
- **表格**：100% 宽度，水平滚动于 768px 以下

### 5.4 Section 节奏

典型的 Quick BI 页面从上到下的结构：

```
[Top Nav — 56px]
[Page Title + 操作栏 — padding 24px]
[Filter Bar — padding 0 24px, gap 12px]
[Stat Cards Row — 4列, gap 16px, margin-bottom 24px]
[Chart Area — flex/grid, gap 16px, margin-bottom 24px]
[Data Table — full width, margin-bottom 24px]
[Pagination — right-align]
```

### 5.5 密度策略

Quick BI 支持**两种密度模式**：

| 模式 | 卡片内边距 | 行高 | 间距倍率 |
|---|---|---|---|
| 舒适（默认） | 20px | 48px | 1× |
| 紧凑 | 12px | 40px | 0.75× |

### 5.6 断点策略

| 断点 | 宽度 | 关键变化 |
|---|---|---|
| Mobile | < 640px | 单列布局、隐藏侧边栏、表格横向滚动 |
| Tablet | 640–1024px | 侧边栏可折叠、2 列卡片网格 |
| Desktop | 1024–1440px | 完整布局、3–4 列卡片网格 |
| Wide | > 1440px | 最大容器 1440px 居中 |

---

## 6. 深度、阴影与边框

### 6.1 阴影层级（3 级）

| 级别 | CSS 值 | 用途 | Tailwind 类 |
|---|---|---|---|
| **SM** | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | 按钮默认态、标签、输入框 | `shadow-sm` |
| **MD** | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | 卡片悬浮态、下拉菜单 | `shadow-md` |
| **LG** | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | 弹窗、抽屉、模态框 | `shadow-lg` |

### 6.2 边框规则

| 场景 | 颜色 | 宽度 | 样式 |
|---|---|---|---|
| 默认边框 | `{colors.border-default}` (#e2e8f0) | 1px | solid |
| 强调边框 | `{colors.border-strong}` (#cbd5e1) | 1px | solid |
| Focus Ring | `{colors.primary}` (#1677FF) | 2px | ring（带 offset） |
| 分割线 | `{colors.border-default}` | 1px | solid |
| 表头底线 | `{colors.border-strong}` | 2px | solid |

### 6.3 Elevation / 表面叠放规则

Quick BI 采用**浅层 elevation**策略——深度差异微妙，不过度依赖阴影：

1. **Level 0（Flat）**：页面背景 `{colors.canvas}`，无边框无阴影
2. **Level 1（Surface）**：卡片、输入框、下拉菜单 — `shadow-sm` + 1px 边框
3. **Level 2（Elevated）**：悬浮卡片、Tooltip — `shadow-md`
4. **Level 3（Modal）**：弹窗、抽屉 — `shadow-lg` + 遮罩层

### 6.4 禁止的装饰

- ❌ 禁止使用 `shadow-xl` 及以上的厚重阴影
- ❌ 禁止使用渐变边框或发光边框效果
- ❌ 禁止使用 inset shadow（内阴影）
- ❌ 禁止使用多层嵌套阴影制造"浮起"感
- ✅ 保持扁平轻量的视觉感受是 Quick BI 的核心气质

---

## 7. 动效

### 7.1 时长规范

| 动作类型 | 时长 | 缓动函数 |
|---|---|---|
| 按钮 hover / active | **100ms** | `ease-out` |
| 颜色过渡（背景、文字、边框） | **150ms** | `ease-in-out` |
| 展开/折叠（accordion、dropdown） | **200ms** | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 弹窗出现/退出 | **250ms** | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 页面切换（路由过渡） | **300ms** | `ease-out` |
| 数据加载骨架屏闪烁 | **1200ms** 循环 | `ease-in-out` |

### 7.2 Transform 模式

- **Hover 提升**：`transform: translateY(-1px)` 配合 `shadow-md`（卡片 hover）
- **按下反馈**：`transform: scale(0.98)` （按钮 active）
- **展开动画**：`transform-origin: top; transform: scaleY(0) → scaleY(1)`（下拉菜单）
- **弹窗进入**：`opacity: 0→1; transform: scale(0.95)→scale(1)`
- **抽屉进入**：`transform: translateX(-100%)→translateX(0)`（左侧抽屉）

### 7.3 出现 / 退出规则

| 元素类型 | 进入方式 | 退出方式 |
|---|---|---|
| 弹窗 Dialog | fade + scale(0.95→1) | fade + scale(1→0.95) |
| 抽屉 Drawer | slide from edge | slide to edge |
| 下拉菜单 Dropdown | scaleY down from top | scaleY up to top |
| Toast 通知 | slide in from top-right | fade out |
| Tooltip | fade in | fade out |

### 7.4 可用动效 vs 禁止动效

| ✅ 可用 | ❌ 禁止 |
|---|---|
| 颜色/透明度过渡 | 弹性/弹簧动画（spring） |
| 微位移（≤2px） | 旋转、翻转 3D 效果 |
| 缩放（0.95–1.02 范围） | 粒子特效、光效扫过 |
| Fade 过渡 | 抛物线轨迹运动 |
| Slide（单向直线） | 震动/抖动反馈 |

### 7.5 Reduced Motion

当用户系统偏好设置为 `prefers-reduced-motion: reduce` 时：
- 所有时长缩短至 ≤100ms
- 移除 transform 动画，仅保留 opacity 过渡
- 抽屉/弹窗直接显示/隐藏，无滑动或缩放

---

## 8. 响应式行为

### 8.1 布局变化总览

| 元素 | Desktop (≥1024px) | Tablet (640–1024px) | Mobile (<640px) |
|---|---|---|---|
| 侧边栏 | 固定 240px 左侧 | 可折叠为图标列 | 隐藏，由汉堡菜单触发 |
| 顶部导航 | 完整水平菜单 | 精简菜单项 | 仅显示 Logo + 汉堡按钮 |
| 统计卡片区 | 4 列等宽 | 2 列等宽 | 1 列堆叠 / 2 列紧凑 |
| 图表区域 | 并排双图 | 上下堆叠 | 全宽单图 |
| 数据表格 | 完整列展示 | 隐藏次要列 | 水平滚动 + 卡片视图可选 |
| 筛选器栏 | 水平排列 | 水平换行 | 垂直堆叠 / 收起到"更多" |
| 分页 | 完整页码 | 简化页码（首尾+当前±1） | 上一个/下一个 + 页码跳转 |
| 弹窗 | 居中 720px max | 居中 90% width | 全屏抽屉式 |

### 8.2 导航响应式

- **Desktop**：完整水平导航 + 搜索框 + 用户头像
- **Tablet**：保留核心导航项（最多 5 个），次要项收纳到"更多"下拉
- **Mobile**：汉堡菜单 → 全屏滑出抽屉式导航，背景遮罩

### 8.3 表格响应式

- **≥1024px**：完整表格，所有列可见
- **640–1024px**：隐藏标记为 `hide-on-tablet` 的列（通常是非核心维度列）
- **<640px**：方案 A — 水平滚动；方案 B — 卡片视图（每行转为一张卡片）

### 8.4 图片与图表响应式

- 图表容器使用 `aspect-ratio` 保持比例
- 图表内部元素（坐标轴、图例）在小屏自动精简
- 截断的长文本显示省略号（`truncate`），tooltip 显示完整内容

### 8.5 元素显隐策略

| 元素 | Desktop | Tablet | Mobile |
|---|---|---|---|
| 侧边栏 | ✅ visible | 🔄 collapsible | ❌ hidden |
| 全局搜索框 | ✅ visible | ⚠️ icon only | ❌ hidden (in menu) |
| 快捷操作栏 | ✅ visible | ⚠️ condensed | ❌ hidden |
| 面包屑导航 | ✅ visible | ✅ visible | ⚠️ single line |
| 批量操作按钮 | ✅ visible | ✅ visible | ✅ bottom sheet |

---

## 9. Prompt Guide

### 9.1 给 LLM 的推荐写法

当你需要生成符合 Quick BI 设计系统的界面时，请在 prompt 中包含以下指令：

```
你是一个前端开发专家，请按照以下 Quick BI 设计系统生成界面：

【设计约束】
- 主色调：品牌蓝 #1677FF（hover #0958d9，浅底 #e6f4ff）
- 背景：纯白 #ffffff，表面色 #f8fafc
- 文字层级：主文本 #0f172a → 次要 #334155 → 弱化 #64748b → 微弱 #94a3b8
- 字体：Inter（全局），JetBrains Mono（代码/数据）
- 圆角：控件 8px、卡片 12px、标签 6px、胶囊 9999px
- 阴影三级：sm(按钮) / md(卡片悬浮) / lg(弹窗)
- 间距基于 4px 倍数：4/6/8/12/16/20/24/32/48px
- 语义色：成功 #16a34a、警告 #d97706、错误 #dc2626

【风格关键词】
专业、数据驱动、清晰、高效、克制、企业级、明亮、扁平轻量

【组件特征】
- 主按钮：蓝色填充白字、8px 圆角、36px 高
- 次要按钮：深色填充白字
- 幽灵按钮：透明背景
- 输入框：6px 圆角、灰色边框、focus 蓝色 ring
- 表格：简洁行分割线、斑马纹可选、标签式状态
- 统计卡片：28px 大数字 + 趋势指示、12px 圆角
- 标签：6px 圆角、彩色浅底背景
- 分页：32×32 方形页码按钮

【禁止事项】
- 不要使用紫色、橙色或其他非蓝色作为主色调
- 不要添加渐变背景、毛玻璃效果或厚重阴影
- 不要使用超过 700 的字重
- 不要使用 pill 形状按钮（除非是小标签 badge）
- 不要添加装饰性插图或图案背景
- 不要使用弹性/弹簧动画
```

### 9.2 直接可复用的界面生成 Prompt 片段

**数据仪表盘：**
> 生成一个 Quick BI 风格的数据仪表盘页面。顶部 56px 导航栏（Logo + 水平菜单 + 搜索 + 头像）。页面标题"销售概览"右侧有"导出"和"新建报告"两个按钮。下方一行 4 个统计卡片（总销售额 ¥2.4M ↑12%、订单数 1,284 ↑8%、转化率 3.2% ↓0.5%、客单价 ¥1,870 ↑5%），每个卡片 28px 蓝色大数字 + 灰色标签 + 绿/红趋势箭头。下方左侧折线图（月度趋势），右侧环形图（品类占比）。再下方是数据表格（订单号、客户、金额、状态、时间列），带分页。所有颜色使用 #1677FF 品牌蓝体系，Inter 字体，8px/12px 圆角，sm/md 阴影。

**数据表格页：**
> 生成一个 Quick BI 风格的数据表格管理页。顶部筛选栏（日期范围选择器、状态下拉、搜索输入框）。表格 6 列（ID、名称、状态标签、数值、日期、操作），表头 16px semibold 底部 2px 分割线，行高 44px，斑马纹。状态列使用彩色标签（成功=绿底绿字、待处理=黄底黄字、异常=红底红字）。操作列有"查看"和"编辑"幽灵按钮。底部右对齐分页（上一页/1,2,3,4...10/下一页）。使用 #e2e8f0 边框、#f8fafc 表面色、#1677FF 选中态。

**表单/配置页：**
> 生成一个 Quick BI 风格的数据源配置表单。页面标题"新建数据源"。表单分为两组："基本信息"和"连接配置"，每组有 16px semibold 组标题。输入项包括：数据源名称（text input）、类型选择（select dropdown）、主机地址（text input with placeholder "例如：192.168.1.100"）、端口号（number input）、认证方式（radio group）。底部"测试连接"次要按钮 + "保存"主按钮（蓝色）。所有输入框 6px 圆角、#e2e8f0 边框、focus 时 #1677FF ring-2。

### 9.3 禁止写法

❌ **不要这样写 prompt：**
- "做一个漂亮的深色仪表盘" — 太模糊，缺少具体 token 值
- "参考 Ant Design 风格" — Quick BI 有自己的设计语言，不应混用
- "使用渐变色和玻璃拟态效果" — 违反 Quick BI 扁平轻量的原则
- "按钮做成圆角胶囊形状" — 只有 badge 用 pill，按钮是 8px 圆角
- "标题用粗体放大" — 应明确指定 20px/600 或 28px/600
- "配色活泼一些" — 应明确指定 hex 值和使用边界

✅ **应该这样写：**
- 明确指定所有颜色的 hex 值
- 明确指定字号、字重、行高
- 明确指定圆角尺寸（不是"圆角""圆润"这种模糊词）
- 明确指定间距 px 值
- 引用具体的组件名称和 token 名称

---

## 已知限制

- 本设计规范基于 Quick BI 公开可观察的界面特征提取，部分内部产品组件（如特定图表类型的配置面板）未完全覆盖
- 暗色模式的细节基于亮色模式的对称推断，实际产品可能有微调
- 动效的具体 timing 函数值来自行业最佳实践，Quick BI 未公开官方 motion spec
- 字体加载策略（font-display: swap / block / optional）需根据实际项目性能需求确定
