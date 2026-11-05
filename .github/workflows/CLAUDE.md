# .github/workflows/
> L2 | 父级: ../CLAUDE.md

## 成员清单

website.yml: 校验网站并限定 lowpoly-world Static Space；手动触发时上传同一作业已验收的静态产物和网站 MIT 许可，不在 HF 远端构建。

HF_SPACE_TOKEN 由所有者配置，不从本机凭据自动导出。
缺少专用凭据时，部署失败并说明原因。
CI 使用标准 Ubuntu；setup-node 只缓存 npm 下载数据，不缓存 node_modules、模型或构建附件。纯说明文档提交保留 verify 检查但跳过安装和构建，web/content 页面仍完整验证。PR 更新取消旧运行；main 和手动部署按 run_id 独立运行。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
