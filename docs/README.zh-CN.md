# TableroBlanco

[Español](../README.md) · [English](README.en.md) · **简体中文**

适用于 Windows x64 的个人白板应用。无需创建账户，也不依赖云服务，即可绘画、整理想法、使用模板并为文档添加批注。

应用支持西班牙语、英语和简体中文。

[下载 Windows 版](https://github.com/edwincsabo/TableroBlanco/releases) · [使用指南（西班牙语）](GUIA.md) · [应用截图](SCREENSHOTS.zh-CN.md) · [许可证](../LICENSE) · [参与贡献（西班牙语）](../CONTRIBUTING.md)

![TableroBlanco 主界面：白板库和模板入口](images/inicio.png)

## 下载与安装

1. 打开 [Releases 发布页面](https://github.com/edwincsabo/TableroBlanco/releases)。
2. 在要使用的版本中展开 **Assets**（资源）。
3. 下载 `TableroBlanco-1.2.1-Instalador.exe`，或相应版本的安装程序。`Instalador` 是西班牙语的“安装程序”；所有界面语言使用相同的文件名。
4. 关闭正在运行的 TableroBlanco，然后运行安装程序。可以选择安装目录并创建快捷方式。

如需免安装使用，请下载 `TableroBlanco-1.2.1-Portable.exe`。即使使用便携版，白板也保存在 Windows 用户配置文件中。运行这些程序不需要安装 Node.js、npm 或 Electron。

首次发布的版本为预发布版，可执行文件没有商业数字签名。在本地开发环境中，Device Guard 曾阻止较早的构建运行；测试时没有关闭系统防护。请参阅[验证记录（西班牙语）](../VERIFICACION.md)和各版本的发布说明。如果所在组织阻止程序运行，请联系管理员审核应用。

## 功能

- 支持平移、缩放、多选、分组和对象层级调整的画布。
- 铅笔、记号笔、荧光笔、橡皮擦、激光笔、直尺、形状、线条、箭头和文字。
- 便利贴、便利贴网格、卡片式评论，以及可编辑的表格和列表。
- 支持 PNG、JPEG、WebP、GIF 和 SVG 图片；可将 PDF 页面作为图片导入并添加批注。
- 九个类别、共 57 个模板，支持全局模板搜索、推荐模板和个人模板。
- 计时器、文字搜索、演示模式、背景，以及浅色和深色主题。
- 自动保存、版本历史、收藏、创建副本和回收站。
- 完整备份，以及 `.tablero` 和 `.excalidraw` 文件导入。
- 导出为可编辑的 `.tablero` 文件，以及 PNG、SVG 和 PDF。
- 西班牙语、英语和简体中文界面，自动记住语言偏好。

## 编辑器

在画布上书写、绘画并连接想法。顶部工具栏提供绘图工具；底部工具栏可插入便利贴、图片、文档、模板及其他元素。

![TableroBlanco 编辑器：便利贴、文字和绘图工具](images/editor.png)

在[截图库](SCREENSHOTS.zh-CN.md)中可以查看模板、深色主题和中文界面。截图中的界面语言为西班牙语或简体中文，图片说明为简体中文。

## 模板

| 类别 | 数量 |
| --- | ---: |
| 头脑风暴 | 6 |
| 问题解决 | 6 |
| 设计与研究 | 6 |
| 战略 | 6 |
| 项目规划 | 6 |
| 回顾 | 6 |
| 游戏 | 6 |
| 工作坊 | 6 |
| 学习 | 9 |

包括思维导图、看板、SWOT 分析、SCAMPER、五个为什么、同理心地图、商业模式、路线图、回顾、KWL、概念比较和课程计划。可以通过模板创建白板，也可以将模板插入现有白板，而不替换原有内容。

## 语言

选择**设置 → 应用语言**，或使用编辑器中的语言选择器。无需关闭白板，更改即可生效；重启后仍会保留所选语言。

界面和新插入的模板会切换语言。便利贴中的文字、现有白板名称和个人模板会保留原来的书写语言。

![简体中文模板选择器](images/idiomas.png)

## 保存与备份

白板会自动保存在本机。通过**设置 → 打开白板文件夹**可以查看确切位置；通常为 `%APPDATA%\tableroblanco\tableros`。

可以在设置中创建完整的 JSON 备份，并在另一台电脑上恢复。恢复操作会创建副本并保留现有白板。完整备份不包含版本历史快照。

更新应用或迁移用户配置文件前，请保留备份。应用不会在设备之间同步文件。

## 适用范围

TableroBlanco 是独立应用，与 Microsoft 没有关联，主要面向个人本地使用。它并未实现 Microsoft Whiteboard 的全部功能。

应用不包含账户、实时协作、OneDrive、Teams、Loop、Copilot，也不支持导入专有的 `.whiteboard` 格式。PDF 页面作为图片插入；表格和列表由画布元素组合而成。笔迹识别仅限于闭合的圆形和矩形。GIF 以静态图片显示。

## 源代码与开发

要求：Windows x64、Node.js 24 和 npm。

```powershell
git clone https://github.com/edwincsabo/TableroBlanco.git
cd TableroBlanco
npm ci
npm run build
npm run desktop
```

开发界面时，先运行 `npm run dev`，再在另一个终端中启动 Electron：

```powershell
$env:TABLERO_DEV = '1'
npm run desktop
```

运行测试：

```powershell
npm test
npm run build
npm run test:ui
```

生成安装程序和便携版：

```powershell
npm run dist
```

输出文件位于 `version-final/<version>/`。如果 `npm ci` 期间未下载 Electron，请在打包前运行 `node node_modules/electron/install.js`。

## 许可证与商业使用

项目自身的代码采用 **TableroBlanco No-Sale License 1.0**：

- 可以使用和修改，包括在企业内部使用。
- 可以免费分享副本。
- 可以就技术支持、定制、培训、咨询或托管服务收费。
- 不得出售本程序、其软件许可证，或包含其代码的修改版本。

请阅读 [LICENSE](../LICENSE) 和[简体中文许可说明](LICENSE.zh-CN.md)。`LICENSE` 的英文文本为正式文本，优先于翻译摘要。本项目采用限制销售的源码可用许可证，并非 OSI 批准的开源许可证。它不会替代早期版本已授予的权限或第三方许可证。

## 致谢与组件

画布基于 [Excalidraw](https://github.com/excalidraw/excalidraw)。应用使用 React、TypeScript、Vite、Electron、PDF.js、jsPDF 和 Lucide 构建。请参阅 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) 和 [licenses/](../licenses/)。

## 问题反馈与贡献

通过 [Issues](https://github.com/edwincsabo/TableroBlanco/issues) 报告问题或提出改进建议。请注明版本、复现步骤和预期结果；不要发布隐私信息或个人白板。

[贡献指南](../CONTRIBUTING.md)、[安全政策](../SECURITY.md)、[使用指南](GUIA.md)和[版本发布指南](PUBLICAR.md)目前为西班牙语。本页提供简体中文的安装和主要使用说明。
