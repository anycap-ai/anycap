# AnyCap 新用户引导评估报告

> 评估视角：一个**从未听说过 AnyCap 的 AI 编程代理**，收到用户指令后，依次阅读落地页、安装脚本、Skill 文件，评估整条引导链路的清晰度和完整度。

---

## 1. 用户指令是否足够清晰？

**评分：⭐⭐⭐⭐ (4/5) — 清晰，但有小瑕疵**

用户给出的指令：

> "Help me set up AnyCap — first install the skill with `npx skills add anycap-ai/anycap`, then install the CLI with `curl -fsSL https://anycap.ai/install.sh | sh`, and run `anycap login` to connect my account. After that you'll have image, video, music, speech, search, and crawl capabilities ready to use."

**优点：**
- 三步走（安装 skill → 安装 CLI → 登录）路径明确，顺序合理。
- 给出了具体命令，agent 可以直接复制执行。

**问题：**
- 用户声称安装后即拥有 "music, speech, search, crawl" 能力，但 SKILL.md 中明确标注这些是 **"Coming soon"**。这会误导 agent 以为功能已可用，实际执行时会碰壁。
- 没有提到 `anycap status` 用于验证安装结果——对 agent 来说，验证步骤非常重要。

---

## 2. 落地页 (anycap.ai) 是否提供了足够信息？

**评分：⭐⭐⭐⭐⭐ (5/5) — 面向 Agent 的设计非常出色**

**优点：**
- 首页直接声明 **"This page is built for AI agents"**，并提供人类版本链接——这种双轨设计非常贴心。
- 安装方式给出三种选项（skills.sh / CLI 命令 / 手动 curl），覆盖了不同 agent 环境。
- Quick Start 部分给出了 `anycap login`、`anycap image understand`、`anycap video read` 的完整示例。
- 能力表格简洁清晰。
- 包含 skill 版本检查 (`anycap skill check`) 和更新指引。

**改进建议：**
- 能力表格目前只列了 Image Understanding 和 Video Analysis，但 SKILL.md 里还提到了 Generation（图片生成）和 Download。建议在落地页也体现这些已上线的能力，保持信息同步。
- 可以加一句 "Requires free account — run `anycap login` to sign up" 让 agent 知道需要账户。

---

## 3. install.sh 的安装后提示是否清晰引导用户安装 Skill？

**评分：⭐⭐⭐⭐ (4/5) — 有提示，但可以更醒目**

安装完成后的输出是：

```
✓ AnyCap CLI v0.x.x installed to ~/.local/bin/anycap

  Get started:
    anycap login
    anycap status

  Using AnyCap with an AI agent? Install the skill so your agent knows how to use AnyCap:

    npx skills add anycap-ai/anycap

  Learn more: https://anycap.ai
```

**优点：**
- 明确提到了 skill 安装命令 `npx skills add anycap-ai/anycap`。
- 语句 "Install the skill so your agent knows how to use AnyCap" 直接说明了 skill 的作用。
- 整体脚本质量很高：支持多平台（macOS/Linux/Windows）、SHA256 校验、PATH 自动配置、版本锁定等，工程质量专业。

**改进建议：**
- 对于 **Agent 自身执行** `install.sh` 的场景，agent 拿到 stdout 后可能不会"看到"彩色输出。建议在输出中加一行纯文本标记，比如 `[NEXT STEP]`，方便 agent 解析。
- 可以补充一句说明 skill 是什么："Skills are documentation files that teach your AI agent how to use AnyCap commands."——对初次接触的 agent 来说，一句解释就够了。
- 目前 `anycap login` 和 `npx skills add` 的先后顺序在安装提示中不明确。建议标上序号：`Step 1: anycap login` → `Step 2: npx skills add ...`。

---

## 4. SKILL.md 是否有用且清晰？

**评分：⭐⭐⭐⭐⭐ (5/5) — 质量非常高，是目前看到的最好的 agent skill 文件之一**

**优点：**
- **YAML frontmatter** 结构完整：name、description、metadata.version、license、compatibility 一应俱全。description 字段特别好——它列出了触发条件（"Trigger on mentions of AnyCap, multimodal capabilities, or AI-generated media"），让 agent 知道何时激活此 skill。
- **叙事开头**精准定位 agent 的痛点："You can reason, plan, and decide — but you cannot generate images…"——这比干巴巴的 API 文档更能让 agent 理解自己为什么需要 AnyCap。
- **能力组织**清晰：Generation vs. Actions 两大类，并指向子文件 (`references/generation.md`, `references/actions.md`)，避免单文件过长。
- **输出格式**章节规范：统一 JSON，含 `request_id`，给出 `jq` 解析模式表——agent 可以直接用这些模式提取数据。
- **Feedback 机制**设计得很好：agent 遇到错误时可以自动提交 `anycap feedback`，形成闭环。
- **版本检查**闭环：`anycap skill check --target <path>` + `npx skills add` 让 skill 可以自我更新。

**改进建议：**
- `references/generation.md` 和 `references/actions.md` 被引用但本次未在仓库中找到（可能是 skill 安装时才会展开）。建议在 SKILL.md 中加一句说明这些文件的位置预期，例如 "These files are bundled with the skill and located alongside this SKILL.md."。
- "Coming soon" 的功能列表（music, speech, search, crawl, video generation）建议加上预计时间线或一个状态页链接，这样 agent 可以判断是否值得等待。
- Download 功能虽然列出了命令 (`anycap download <url> [-o path]`)，但没有单独放在能力表或 Actions 参考里，存在感较低。建议提升其可见性。

---

## 5. 总体建议

| 维度 | 现状 | 建议 |
|------|------|------|
| **能力声称一致性** | 落地页列 2 项、SKILL.md 列 4+ 项（含 coming soon）、用户声称 6 项 | 统一三处的能力列表；对 "coming soon" 功能加显著标记 |
| **安装顺序** | 用户指令：skill → CLI → login；落地页：skill → CLI → login；install.sh 提示：login → skill | 统一推荐顺序，三处保持一致 |
| **验证步骤** | 落地页和 SKILL.md 都提到 `anycap status`，但用户指令没提 | 在 install.sh 输出中强调 `anycap status` 作为安装验证 |
| **Agent 可解析性** | install.sh 输出使用 ANSI 颜色，JSON 无 | 安装成功后可选输出一行机器可读的 JSON 摘要，例如 `{"installed": "v0.2.0", "path": "~/.local/bin/anycap"}` |
| **引用文件完整性** | SKILL.md 引用 references/*.md 但未在当前目录树中出现 | 确保 skill 安装包中包含这些子文件，或在 SKILL.md 内联关键内容 |

---

## 结论

AnyCap 的 **agent-first** 引导链路设计水准很高——落地页专为 agent 优化、install.sh 工程质量扎实、SKILL.md 信息密度和结构都很好。主要改进方向是 **三个触点（用户指令模板、落地页、install.sh post-install 提示）之间的信息一致性**，尤其是能力列表和推荐安装顺序的统一。
