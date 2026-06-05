# 浦鉴 HTML Prototype

基于《新版PRD_AI软硬件全栈能力验证平台.md》制作的可部署到 Vercel 的静态 HTML 原型。

## 本地预览

直接打开 `index.html` 即可预览；也可以运行：

```bash
npm run dev
```

## Vercel 部署

将本目录作为项目根目录导入 Vercel 即可。项目为纯静态文件，`vercel.json` 已配置任意路径回退到 `index.html`，支持 hash 路由。
