# AI株式投資 / 生成AIアプリ統合 クイズセット追加 設計書

## 背景・目的

spa-quiz-app には、これまで GitHub Copilot・クリーンアーキテクチャ・生成AI OSS・CSS・Claude Code などのチュートリアル教材からクイズセットを追加してきた（`src/data/quizSets.json` 参照）。今回、以下2つの教材リポジトリからクイズセットを新規追加する。

- `ai-stock-investing-tutorial/docs`（AI活用の株式投資リサーチ教材、01〜06の6カテゴリ）
- `ai-stock-investing-tutorial/app/docs/app-design.md`（上記教材を統合した実装アプリの設計リファレンス、単独ドキュメント）
- `genai-app-integration-tutorial/docs`（生成AIアプリ統合の実践ガイド、01〜06の6カテゴリ。`superpowers/` 配下は対象外）

対象外: 両リポジトリの `superpowers/` 配下（設計判断の経緯を記録した内部資料であり、学習教材としての一般性が低いため）。

## 全体構成

既存の `css-tutorial-series` / `generative-ai-oss-series` と同じ「親シリーズ（level 1, group あり）+ カテゴリ単位の子クイズセット（level 2）」パターンを踏襲する。`app-design.md` のみ、`spa-quiz-app-docs` と同じ「独立セット（level 1, group: null）」パターンとする。

### シリーズ1: AI株式投資リサーチ教材（`ai-stock-investing-tutorial`）

`category`: 「AI株式投資」（新設）。`docs/` 配下の6カテゴリをそのまま子セットに対応させる。各子セットの問題数は「カテゴリ内の Markdown ファイル数 × 5問」とする（`css-tutorial-basics` の「5教材×5問」パターンを踏襲）。

| 子セットID | 元カテゴリ | ソースファイル数（00-README含む） | 問題数 | 難度 |
|---|---|---|---|---|
| ai-stock-fundamentals | 01-fundamentals | 5 | 25 | beginner |
| ai-stock-prompt-patterns | 02-prompt-patterns | 5 | 25 | beginner to intermediate |
| ai-stock-data-api | 03-data-api | 5 | 25 | intermediate |
| ai-stock-analysis-agents | 04-analysis-agents | 5 | 25 | intermediate |
| ai-stock-portfolio-management | 05-portfolio-management | 6 | 30 | intermediate to advanced |
| ai-stock-real-world-examples | 06-real-world-examples | 5 | 25 | advanced |

親シリーズ合計: 155問。difficulty: "beginner to advanced"。

### 独立セット: 株投資リサーチアプリ 実装アーキテクチャ（`ai-stock-app-design`）

`app/docs/app-design.md`（1,356行、9機能＋横断的設計事項6件＋将来課題を持つ実装リファレンス）を単独クイズ化する。`category`: 「AI株式投資」。`parentId: null`, `group: null`, `level: 1`。主要セクション（概要／構成／機能一覧／機能詳細9件／横断的設計事項6件／将来課題）の内容に基づき35問を作成する。difficulty: "intermediate"（`spa-quiz-app-docs` の precedent に合わせる）。

### シリーズ2: 生成AIアプリ統合 実践ガイド（`genai-app-integration-tutorial`）

`category`: 「生成AIアプリ統合」（新設）。`docs/` 配下の6カテゴリ（`superpowers/` を除く）を子セットに対応させる。問題数の算出方法はシリーズ1と同様。

| 子セットID | 元カテゴリ | ソースファイル数 | 問題数 | 難度 |
|---|---|---|---|---|
| genai-invocation-architecture | 01-invocation-and-architecture | 4 | 20 | beginner |
| genai-io-contract-design | 02-io-contract-design | 5 | 25 | beginner to intermediate |
| genai-reliability-and-cost | 03-reliability-and-cost | 6 | 30 | intermediate |
| genai-trust-and-safety-ux | 04-trust-and-safety-ux | 5 | 25 | intermediate |
| genai-agentic-workflow-patterns | 05-agentic-workflow-patterns | 6 | 30 | intermediate to advanced |
| genai-real-world-case-study | 06-real-world-case-study | 4 | 20 | advanced |

親シリーズ合計: 150問。difficulty: "beginner to advanced"。

### 追加量まとめ

- 新規 `quizSets.json` エントリ: 15件（親2 + 子6+6 + 独立1）
- 新規問題数合計: 340問（155 + 35 + 150）

## ファイル配置

```
src/data/
  ai-stock-investing-tutorial/
    metadata.json                    # シリーズ1のメタデータ
    fundamentals.json
    prompt-patterns.json
    data-api.json
    analysis-agents.json
    portfolio-management.json
    real-world-examples.json
    app-design.json                  # 独立セット（同フォルダに配置、metadata.json 非対象）
  genai-app-integration-tutorial/
    metadata.json                    # シリーズ2のメタデータ
    invocation-and-architecture.json
    io-contract-design.json
    reliability-and-cost.json
    trust-and-safety-ux.json
    agentic-workflow-patterns.json
    real-world-case-study.json
```

`quiz-generator` shared skill の標準出力構成（`metadata.json` + セクションごとの `{section}.json` + `quizSets.json` エントリ）に準拠する。

## データ品質基準

既存クイズセットと同一のスキーマ・品質基準に準拠する（[quiz-generator SKILL.md](../../../.github/skills-config/quiz-generator/README.md) 参照）。

- 各問題: `id`（セクション内連番）, `question`, `options[]`（A/B/C/D の4つ固定）, `correctAnswer`（単一）, `explanation`（日本語、根拠を明示）
- 出題内容はソースドキュメントの記述に忠実であること（架空の仕様や数値を作らない）
- 誤答選択肢は紛らわしく、思考を要する設計にする
- ID はケバブケース
- `quizSets.json` の `parentId` / `group` / `level` / `order` の階層整合性を保つ

## 設定ファイルの更新

`.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` に以下を追加し、`npm run validate:quiz` で新規セットも検証対象にする。

```json
"src/data/ai-stock-investing-tutorial/*.json",
"src/data/genai-app-integration-tutorial/*.json"
```

## スコープ外

- `ai-stock-investing-tutorial/app/docs/superpowers/` および `genai-app-integration-tutorial/docs/superpowers/` 配下の資料
- `ai-stock-investing-tutorial/app/docs/data_j.xls`（ドキュメントではないデータファイル）
- 既存クイズセットの変更・リファクタリング

## テスト・検証方針

- `npm run validate:metadata` / `npm run validate:quiz` / `npm run validate:all` を実行し、スキーマ準拠・階層整合性・問題数を確認する
- 開発サーバー（`npm run dev`）を起動し、クイズセット選択画面で新規シリーズ・独立セットが正しく表示され、実際にクイズが解答できることを目視確認する
