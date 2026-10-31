# .github/workflows/
> L2 | 父级: ../CLAUDE.md

## 成员清单

website.yml: 校验网站；手动触发时上传同一作业已验收的静态产物，不在 HF 远端构建。

HF_SPACE_TOKEN 由所有者配置，不从本机凭据自动导出。
缺少专用凭据时，部署失败并说明原因。
CI 使用标准 Ubuntu，不保存计费缓存或构建附件。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
