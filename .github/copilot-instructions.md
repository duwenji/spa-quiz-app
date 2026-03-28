# Copilot Instructions

このリポジトリでは、クイズ生成と電子書籍生成を shared-copilot-skills 経由で実行する。

## Quiz Generator
- 入口: `.github/skills-config/quiz-generator/invoke-validate.ps1`
- 設定: `.github/skills-config/quiz-generator/quiz-generator.config.json`
- 推奨モード: `-Mode all`

## Ebook Build
- 入口: `.github/skills-config/ebook-build/invoke-build.ps1`
- 設定: `.github/skills-config/ebook-build/spa-quiz-app.build.json`
- メタデータ: `.github/skills-config/ebook-build/spa-quiz-app.metadata.yaml`
- 章構成: `docs/` 配下の Markdown を章として利用

## Shared skill discovery order
1. `.github/skills/shared-skills/*`
2. `.github/skills/*`
3. `../shared-copilot-skills/*`
