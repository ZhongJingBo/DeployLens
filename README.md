

# DeployLens (中文文档)

DeployLens 是一个功能强大的 Chrome 浏览器扩展，它是一个属于前端的开发助手快速提升效率，用于快速代理该扩展采用现代 Web 技术构建 ,基于Manifest V3实现。

## 特性

- 🎯 侧边栏集成：通过 Chrome 侧边栏快速代理和访问编辑当前页面URL
- 🛠️ 现代技术栈：使用 React、TypeScript 和 Vite 构建
- 💅 精美界面：采用 Tailwind CSS 和 shadcn 组件设计
- 🔒 安全可靠：实现适当的内容安全策略和权限管理

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn UI 组件
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


