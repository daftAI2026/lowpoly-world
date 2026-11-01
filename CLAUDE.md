# Lowpoly World - 只读公开资产目录的静态展厅

TanStack Start 1.169.3 + React 19 + Fumadocs 16 + i18next 26 + Vite+ 1.4 + TypeScript 7。
网站只读 daftAI2026/3d-assets；静态产物面向 daftAI2026/gallery。

<directory>
web/ - 中英网站、资产浏览器、模型查看器与静态部署配置
.github/ - 网站 CI 与显式触发的静态 Space 同步
</directory>

<config>
README.md - 网站运行入口与公开边界
LICENSE - 网站源码的 MIT 许可，不覆盖独立模型资产
AGENTS.md - 指向本文件，统一 Agent 入口
.gitignore - 排除私人代码区、模型、凭据与生成产物
</config>

## 工作边界

- 公开仓只包含网站及其必要脚本、测试和公开说明。
- Colab、模型生产与审核工具留在独立私人工具代码区。
- 本地 .pipeline-private/ 不进 Git，也不参与网站构建。
- 私人知识库只保存方案、工作日志、经验和审核依据。
- 工具运行不得依赖私人知识库中的语义文档。
- 模型不进 Git。Dataset 发布与网站部署分离。
- 不把私人审核目录或凭据引入网站代码与构建。
- 缺少公开目录时显示空状态，不造假资产。
- 解析成功不等同于质量通过或版权批准。
- 静态构建、路由直链和 HF 部署须分别验证。
- 所有者已确认网站源码采用 MIT。
- 自有模型逐件审核后采用 CC BY 4.0，第三方参考图不发布。

法则：极简·稳定·导航·版本精确。
