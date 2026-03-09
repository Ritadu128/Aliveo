# Aliveo Web MVP — 设计方案构思

## 设计背景
互动式博物馆导览网页，用户通过拍照识别文物并与文物对话。
参考风格：现代博物馆互动网页，文化感、优雅、简洁、有设计感。

---

<response>
<probability>0.07</probability>
<text>

## 方案一：新博物馆主义（Neo-Museological）

**Design Movement**: 新博物馆主义 — 将传统博物馆的庄重感与当代数字体验融合

**Core Principles**:
- 米白/暖灰为主的纸张质感背景，模拟博物馆展签材质
- 大量留白，内容如展品般被"框"出来
- 文字排版借鉴博物馆展签：标题大写、作者斜体、年代小字
- 有趣的小细节：文物卡片悬停时出现"语音气泡"，仿佛文物在说话

**Color Philosophy**:
- 主色：暖米白 #F5F0E8（背景，如宣纸）
- 文字：深炭灰 #2C2C2C
- 强调色：暖金棕 #B8860B（如博物馆铭牌的铜色）
- 次强调：赭石红 #8B4513（少量点缀）
- 情感意图：温暖、历史感、可信赖

**Layout Paradigm**:
- 非对称布局：左侧重内容，右侧留白
- 拍照页：全屏沉浸式，取景框如画框般精致
- 结果页：卡片如博物馆展台，错落排列
- 对话页：底部浮层如博物馆解说牌

**Signature Elements**:
- 细线装饰框（如博物馆展签边框）
- 菱形/十字小装饰符号 ✦ 作为分隔元素
- 文物卡片底部的"展签"样式标注

**Interaction Philosophy**:
- 按钮悬停：轻微上移 + 阴影加深，如展品被聚光灯照亮
- 页面切换：淡入淡出，庄重不突兀
- 取景框：脉冲动画，如心跳般提示对准

**Animation**:
- 进入动画：内容从下方轻柔浮现（translateY 20px → 0，opacity 0 → 1，0.4s ease-out）
- 加载动画：细线旋转圆圈，优雅不急促
- 卡片悬停：scale(1.02) + box-shadow 加深
- 对话气泡：逐字显示，如文物在缓缓诉说

**Typography System**:
- 标题：Playfair Display（Serif，优雅艺术感）
- 正文：DM Sans（现代 Sans-serif，清晰易读）
- 展签文字：Cormorant Garamond（细腻历史感）
- 层级：Display 48px / H1 32px / H2 24px / Body 16px / Caption 12px

</text>
</response>

<response>
<probability>0.06</probability>
<text>

## 方案二：考古档案美学（Archaeological Archive）

**Design Movement**: 考古档案美学 — 仿佛翻阅一本古老的博物馆档案册

**Core Principles**:
- 羊皮纸质感背景，带轻微噪点纹理
- 手写体与印刷体混搭，模拟档案标注
- 深色卡片如档案袋，内容如档案页
- 有趣细节：识别加载时出现"正在翻阅档案..."的打字机效果

**Color Philosophy**:
- 背景：旧纸色 #EDE8DC
- 卡片：深棕档案色 #3D2B1F
- 文字：墨水黑 #1A1A1A
- 强调：古铜金 #C9A84C
- 情感意图：神秘、历史厚重、探索感

**Layout Paradigm**:
- 档案夹式布局：内容区域有明显的"页面"边界
- 卡片叠放效果，如一摞档案
- 识别结果页：主卡片居中，候选卡片如档案索引

**Signature Elements**:
- 档案编号标注（如 #AR-1904-001）
- 手写风格的分类标签
- 纸张折角效果

**Interaction Philosophy**:
- 翻页式过渡动画
- 点击时有轻微"纸张"音效感的视觉反馈
- 搜索框如档案检索台

**Animation**:
- 页面切换：翻页效果（3D rotateY）
- 卡片出现：从档案堆中"抽出"（translateX + rotate 微调）
- 加载：打字机效果文字

**Typography System**:
- 标题：Libre Baskerville（经典 Serif）
- 正文：Source Serif 4（可读性强的 Serif）
- 标注：Caveat（手写风格）

</text>
</response>

<response>
<probability>0.05</probability>
<text>

## 方案三：暗色沉浸博物馆（Dark Immersive Museum）

**Design Movement**: 暗色沉浸博物馆 — 如夜间博物馆，文物在黑暗中被聚光灯照亮

**Core Principles**:
- 深色背景（深炭 / 近黑），文物图片如被聚光灯照亮
- 金色/暖白文字，如博物馆铭牌
- 极简界面，内容是主角
- 有趣细节：文物卡片有微弱的"光晕"效果，仿佛展柜灯光

**Color Philosophy**:
- 背景：深炭 #1A1814（近黑暖色调）
- 卡片背景：#252219
- 文字：暖白 #F0EBE0
- 强调色：暖金 #D4A853
- 次强调：柔橙 #E8845A
- 情感意图：神秘、沉浸、艺术感强

**Layout Paradigm**:
- 全屏沉浸式，内容浮于黑暗之上
- 首页：文物卡片横向排列，如展柜陈列
- 拍照页：全屏黑色取景器，取景框发光
- 对话页：文物图片占据上半屏，对话在下方浮现

**Signature Elements**:
- 卡片光晕效果（box-shadow: 0 0 30px rgba(212,168,83,0.2)）
- 细金线装饰
- 文物名称大写 + 字间距拉开

**Interaction Philosophy**:
- 悬停：光晕增强，如聚光灯亮度提升
- 按钮：金色边框 + 背景渐显
- 识别加载：扫描线动画

**Animation**:
- 入场：淡入 + 轻微缩放（scale 0.95 → 1）
- 扫描动画：水平扫描线从上到下
- 对话气泡：从底部滑入

**Typography System**:
- 标题：Cormorant Garamond（细腻优雅的 Serif）
- 正文：Inter（清晰）
- 展签：Cinzel（古典大写风格）

</text>
</response>

---

## 最终选择：方案一 — 新博物馆主义（Neo-Museological）

选择理由：
- 最符合 PRD 要求的"文化感、优雅、简洁、有设计感、亲和但不幼稚"
- 米白暖灰背景 + 暖金强调色，完美匹配配色建议
- Playfair Display + DM Sans 组合，标题优雅 + 正文清晰
- 有趣小设计：文物"说话气泡"、菱形装饰符、展签样式标注
- 移动端友好，不会因深色背景导致摄像头页面视觉混乱
