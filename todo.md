# Aliveo Web MVP — TODO

## Completed
- [x] Basic project scaffold (React + Vite + Tailwind)
- [x] Global CSS design system (Neo-Museological)
- [x] Landing Page (hero, artifact cards, CTA)
- [x] Camera Page (webcam capture, simulate recognition)
- [x] Result Page (primary artifact + alternatives)
- [x] Conversation Page (chat bubbles, typewriter, Skip/Continue)
- [x] Upgrade to full-stack (tRPC + server + DB)
- [x] Integrate Manus LLM API for real artifact Q&A
- [x] User input box in conversation page
- [x] Richer intro monologues per artifact
- [x] Vitest coverage for artifact.chat

## PRD v2 Updates (2026-03-09)
- [ ] Landing Page: switch to Chinese copy ("拍一张，文物就会开始讲自己的故事")
- [ ] Landing Page: add multiple floating speech bubbles with animation
- [ ] Landing Page: add interactive hover/float effects on artifact cards
- [ ] Landing Page: add parallax / drift animation to bubbles
- [ ] Camera Page: Chinese copy + loading text "正在识别展品…"
- [ ] Result Page: Chinese copy + 【就是这个】/【重新选择】 buttons
- [ ] New Awaken Page: Type A (surprise) + Type B (immersive) wake-up styles
- [ ] Conversation Page: add 【猜你想问】 preset question chips
- [ ] Conversation Page: update segment structure (自述→时代→故事→互动)
- [ ] Update AppContext to include awaken page routing
- [ ] Sync all changes to GitHub Aliveo repo

## Bug Fixes & UX Improvements
- [x] Camera Page: 默认使用后置摄像头，添加翻转摄像头按钮（前/后置切换）
- [x] 拍照识别：接入 LLM 视觉 API，实现真实 AI 图像识别（替换模拟数据）
- [x] 修复「猜你想问」第三人称问题，改为第二人称（"你为什么…"）
- [x] 爬取纽约博物馆文物信息，扩充 artifacts.ts 文物库（从5件增至12件，含大都会博物馆新7件）
