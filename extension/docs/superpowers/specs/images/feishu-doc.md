# AnyCap Extension v2.0 — 混合能力架构设计

> **日期**: 2026-04-22
> **状态**: 设计已确认，待进入实施计划

## 1. 概述

本文档规定了 AnyCap Chrome Extension 从单一硬编码能力（图片变体）到**多能力混合架构**的 v2.0 重新设计，通过统一的浏览器界面暴露所有 AnyCap 平台能力。

### 核心理念：上下文感知、用户可控

- **高频能力** 直接显示在浏览器右键菜单（一键访问）
- **所有能力** 均可通过 popup 的统一能力面板访问
- **用户控制** 哪些能力显示在右键菜单（通过设置页）
- **上下文检测** 确定当前元素/选中内容/页面适用的能力

## 2. 系统架构

<image token="IFBOb9BrSowKXCxfvzpc4iYnndf" width="1568" height="1014" align="center"/>

架构分为四层：

| 层级 | 组件 | 职责 |
|------|------|------|
| **Content Script** | 上下文检测器 | 识别右键目标类型（图片/文字/页面） |
| **Background** | 菜单构建器 + 能力注册中心 | 动态构建右键菜单、路由消息 |
| **Popup** | 能力面板 + 表单 + 结果视图 | 统一操作界面 |
| **AnyCap Server** | API 网关 + 各能力服务 | 执行生成、理解、存储等操作 |

## 3. 数据流

<image token="Vz3UbAfkNoOvlOxnyTAc1U6vnAf" width="1568" height="2362" align="center"/>

以"右键图片生成变体"为例的完整数据流：

1. **Content Script** 检测到 `IMG` 元素，捕获 `src`、`width`、`height`
2. 发送 `ANYCAP_REPORT_CONTEXT` 到 Background
3. **Background** 查询能力注册中心，获取适用于 `image` 上下文的能力
4. 构建右键菜单：高频能力（图片变体）直接显示，其余收进"更多工具"
5. 用户点击后，Background 存储 `pendingRequest` 并设置 badge
6. **Popup** 读取请求，路由到对应的能力表单
7. 用户提交后调用 AnyCap API，返回结果
8. 结果视图展示生成内容，支持"保存到 Drive"等二次操作

## 4. 能力矩阵

<image token="Ql1tbuQF6oCekDxWlHocudjCneg" width="1030" height="2704" align="center"/>

| 能力 ID | 分类 | 名称 | 适用上下文 | 优先级 | 结果类型 |
|---------|------|------|----------|--------|---------|
| `image-variation` | 图片 | 生成变体 | 图片 | **高** | 图片 |
| `image-generate` | 图片 | 文字生图 | 选中文字 | **高** | 图片 |
| `image-edit` | 图片 | 编辑图片 | 图片 | 普通 | 图片 |
| `image-understand` | 图片 | 分析图片 | 图片 | 普通 | 文本 |
| `video-generate` | 视频 | 生成视频 | 图片/文字 | 普通 | 视频 |
| `music-generate` | 音乐 | 生成音乐 | 选中文字 | 普通 | 音频 |
| `web-search` | 网页 | 搜索网页 | 选中文字 | **高** | 文本 |
| `web-crawl` | 网页 | 保存为 Markdown | 页面 | 普通 | Markdown |
| `drive-save-image` | 存储 | 保存图片到 Drive | 图片 | 普通 | 链接 |
| `drive-save-page` | 存储 | 保存页面到 Drive | 页面 | 普通 | 链接 |
| `page-deploy` | 站点 | 部署为站点 | 页面 | 普通 | 链接 |

## 5. Popup 状态机

<image token="P15pbPu0Co6iQ4xeCm1cq87rn0e" width="1188" height="1152" align="center"/>

Popup 视图状态：

| 视图 | 路由 | 说明 |
|------|------|------|
| `capability-panel` | 默认 | 所有能力卡片网格，按分类分组 |
| `capability-form` | `/cap/:id` | 动态表单（prompt、模型选择、参数） |
| `loading` | `/loading` | 加载状态，能力特定的文案 |
| `result` | `/result` | 通用结果渲染（图片/视频/音频/文本/链接） |
| `history` | `/history` | 跨能力的统一历史记录 |
| `settings` | `/settings` | 能力开关、默认值设置 |

## 6. 实现阶段

| 阶段 | 内容 | 周期 |
|------|------|------|
| **Phase 1: 基础架构** | 能力注册中心、上下文分析器、菜单构建器、设置存储 | 1 周 |
| **Phase 2: 图片能力** | 图片变体（迁移）、文字生图、图片理解、图片编辑 | 1 周 |
| **Phase 3: 视频 + 音乐** | 视频生成、音乐生成、视频/音频结果渲染 | 1 周 |
| **Phase 4: 网页 + 存储** | 网页搜索/爬取、Drive 保存、Page 部署 | 1 周 |
| **Phase 5: 打磨** | 历史统一、视觉回归测试、性能优化、文档 | 1 周 |

## 7. 设计决策

1. **模型列表**：popup 启动时从服务器实时拉取 `/v1/{cap}/models`，避免内置静态列表过期
2. **Schema 驱动表单**：从服务器拉取 `models/{model}/schema` 动态生成参数表单，保持与 CLI 一致
3. **Page deploy**：扩展通过 `web-crawl` 获取页面 Markdown/HTML，再调用 Page deploy API
4. **信用预览**：调用 API 前显示预估 credit 消耗（从模型元数据读取）
5. **离线能力**：annotate、draw 等纯本地工具暂不加扩展，后续版本考虑
