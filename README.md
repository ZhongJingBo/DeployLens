# DeployLens

DeployLens is a powerful Chrome browser extension that provides a convenient side panel interface for monitoring and managing deployments. Built with modern web technologies, it offers a seamless experience for developers to track their deployment processes.

## Features

- 🎯 Side Panel Integration: Quick access to deployment information through Chrome's side panel
- 🔄 Real-time Monitoring: Track deployment status and updates in real-time
- 🛠️ Modern Tech Stack: Built with React, TypeScript, and Vite
- 💅 Beautiful UI: Styled with Tailwind CSS and Radix UI components
- 🔒 Secure: Implements proper content security policies and permissions

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- Chrome Extension Manifest V3

## Development

### Prerequisites

- Node.js (Latest LTS version recommended)
- Chrome Browser (v116 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DeployLens.git
cd DeployLens
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build the extension:
```bash
npm run build
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` directory

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the extension
- `npm run watch` - Build and watch for changes
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Permissions

The extension requires the following permissions:
- Side Panel access
- Storage
- Network Request handling
- Active Tab access
- Scripting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



---

# DeployLens (中文文档)

DeployLens 是一个功能强大的 Chrome 浏览器扩展，它提供了一个便捷的侧边栏界面，用于监控和管理部署流程。该扩展采用现代 Web 技术构建，为开发者提供流畅的部署跟踪体验。

## 特性

- 🎯 侧边栏集成：通过 Chrome 侧边栏快速访问部署信息
- 🔄 实时监控：实时跟踪部署状态和更新
- 🛠️ 现代技术栈：使用 React、TypeScript 和 Vite 构建
- 💅 精美界面：采用 Tailwind CSS 和 Radix UI 组件设计
- 🔒 安全可靠：实现适当的内容安全策略和权限管理

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI 组件
- Chrome 扩展 Manifest V3

## 开发指南

### 环境要求

- Node.js（推荐最新的 LTS 版本）
- Chrome 浏览器（v116 或更高版本）

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/DeployLens.git
cd DeployLens
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建扩展：
```bash
npm run build
```

### 加载扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"，选择 `dist` 目录

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建扩展
- `npm run watch` - 构建并监听文件变化
- `npm run lint` - 运行 ESLint 代码检查
- `npm run format` - 使用 Prettier 格式化代码

## 权限说明

该扩展需要以下权限：
- 侧边栏访问权限
- 存储权限
- 网络请求处理权限
- 活动标签页访问权限
- 脚本执行权限

## 参与贡献

欢迎提交 Pull Request 参与项目贡献！


