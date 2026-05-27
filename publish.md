 发布 VS Code 扩展的步骤

  1. 准备工具

  npm install -g @vscode/vsce

  2. 创建发布者账号

  1. 访问 Microsoft Azure DevOps (https://aka.ms/SignupAzureDevOps) 登录
  2. 创建发布者（Publisher），记下发布者 ID
  3. 访问 VS Code Marketplace 管理页 (https://marketplace.visualstudio.com/manage) 创建 Personal Access Token (PAT)
    - 需要设置 All accessible organizations 和 Marketplace (Publish) 权限

  3. 在 package.json 中配置发布者

  确保 package.json 里有 publisher 字段：

  {
    "name": "your-extension",
    "publisher": "your-publisher-id",
    "version": "0.0.1",
    ...
  }

  4. 打包和发布

  # 打包（输出 .vsix 文件，可本地安装测试）
  vsce package

  # 直接发布到 Marketplace（需要 PAT）
  vsce publish

  # 快捷发布补丁版本（自动升级 0.0.1 → 0.0.2）
  vsce publish patch

  # 指定 PAT 发布
  vsce publish -p <your-token>

  5. 版本更新

  每次发布后自动递增版本号：

  vsce publish patch   # 0.0.1 → 0.0.2
  vsce publish minor   # 0.0.1 → 0.1.0
  vsce publish major   # 0.0.1 → 1.0.0

  6. 仅发布到本地/私有（可选）

  如果想生成 .vsix 文件手动分发（不上架 Marketplace）：

  vsce package

  生成的 .vsix 可以通过 VS Code 扩展面板的 Install from VSIX 安装。

  注意事项

  - README.md 会作为 Marketplace 页面内容显示
  - 图标用 icon.png（128x128）配置在 package.json 中
  - 确保已经设置好 .vscodeignore（排除 node_modules、src 构建中间件等）
  - PAT 过期后需要重新生成
  - 发布后 Marketplace 页面可能需要几分钟才能刷新