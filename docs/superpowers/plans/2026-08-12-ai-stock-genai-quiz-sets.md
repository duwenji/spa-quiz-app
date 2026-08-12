# AI株式投資 / 生成AIアプリ統合 クイズセット追加 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new quiz series (AI株式投資リサーチ教材, 生成AIアプリ統合実践ガイド) plus one standalone quiz set (アプリ実装アーキテクチャ) to spa-quiz-app, sourced from `ai-stock-investing-tutorial/docs`, `ai-stock-investing-tutorial/app/docs/app-design.md`, and `genai-app-integration-tutorial/docs`.

**Architecture:** Each source category becomes one child quiz-set JSON file (`{questions: [...]}, `) under a new `src/data/<series-id>/` folder, indexed by a series `metadata.json` (informational) and by entries in the single `src/data/quizSets.json` (consumed by the app at runtime). This mirrors the existing `css-tutorial-series` / `generative-ai-oss-series` / `claude-code-tutorial-series` pattern already in the repo.

**Tech Stack:** Static JSON data files (no app code changes), validated via the repo's existing `npm run validate:metadata` / `validate:quiz` (PowerShell wrapper → Node + AJV against `shared-copilot-skills/quiz-generator/schemas/*.json`).

**Source doc reference:**
- ai-stock series source root: `../ai-stock-investing-tutorial/docs/` (relative to `spa-quiz-app/`, i.e. `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/`)
- app-design source: `c:/Dev/tutorials/ai-stock-investing-tutorial/app/docs/app-design.md`
- genai series source root: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/`

## Global Constraints

- **Question JSON schema** (every `{section}.json` file, validated by `question-schema.json` via `npm run validate:quiz`): top-level object `{"questions": [...]}`. Each question object:
  ```json
  {
    "id": 1,
    "question": "問題文",
    "options": [
      { "id": "A", "text": "選択肢A" },
      { "id": "B", "text": "選択肢B" },
      { "id": "C", "text": "選択肢C" },
      { "id": "D", "text": "選択肢D" }
    ],
    "correctAnswer": "A",
    "explanation": "なぜAが正解か、ソース文書の記述を根拠に日本語で説明する。"
  }
  ```
  - `id`: 1始まりの連番（そのファイル内でのみ一意）。
  - `options`: 必ずA/B/C/Dの4つ。`additionalProperties: false` なので余分なキーは禁止。
  - `correctAnswer`: A/B/C/Dのいずれか1つのみ（複数選択不可）。
  - `explanation`: 空文字不可。ソースドキュメントの記述に忠実な内容にする（存在しない仕様・数値を作らない）。
  - 誤答選択肢はもっともらしく、安易に消去法で正解が分かる作りにしない。
- **quizSets.json エントリの必須フィールド**: `id`(kebab-case, `^[a-z0-9-]+$`), `name`, `description`, `category`, `icon`, `questionCount`, `difficulty`(`beginner`|`intermediate`|`advanced`|`beginner to intermediate`|`beginner to advanced`のいずれか), `dataPath`(`src/data/`相対、例: `ai-stock-investing-tutorial/fundamentals.json`。親セットは`null`可), `parentId`, `group`, `level`(1 or 2), `order`。
- **検証コマンド**（`spa-quiz-app/` ルートで実行）:
  - 個別ファイル: `npm run validate:quiz -- src/data/<path>/<file>.json`
  - 全体: `npm run validate:metadata` / `npm run validate:quiz` / `npm run validate:all`
- **コミット規約**: このリポジトリはフィーチャーブランチを使わず `main` に直接コミットする。タスクごとに1コミット。
- **文字コード**: 全ファイルUTF-8。既存ファイルはLF管理だが、Windows環境では`git add`時にCRLF変換警告が出ても問題ない（既存運用と同じ）。

---

### Task 1: ai-stock-fundamentals クイズ (25問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/fundamentals.json`

**Interfaces:**
- Consumes: ソース文書 `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/01-fundamentals/{00-README.md, 01-llm-basics-for-investing.md, 02-hallucination-and-verification.md, 03-data-freshness.md, 04-legal-and-ethical.md}`
- Produces: `questions[1..25]`（後続タスク7の `metadata.json` と `quizSets.json` 登録で `questionCount: 25` として参照される）

- [ ] **Step 1: ソース文書を読む**

  上記5ファイルすべてを読み、各ファイルの主要な主張・手順・注意点を把握する。

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問（教材全体の目的・構成の理解）, `01-llm-basics-for-investing.md`→5問（LLMを株式リサーチに使う基礎・できること/できないこと）, `02-hallucination-and-verification.md`→5問（ハルシネーション対策・裏付け確認手法）, `03-data-freshness.md`→5問（学習データのカットオフ・鮮度の扱い）, `04-legal-and-ethical.md`→5問（投資助言に関する法務・倫理上の注意点）。

  Global Constraints のスキーマに従い、`id`は1〜25の連番で `src/data/ai-stock-investing-tutorial/fundamentals.json` に `{"questions": [...]}` として書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/fundamentals.json`
  Expected: エラーなく終了する（`quiz-generator.config.json` にこのパスがまだ登録されていないため、`--` 経由でファイルを直接指定する）

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

  AJVのエラーメッセージ（例: `options` が4つでない、`correctAnswer` が不正など）を読み、該当箇所を修正して Step 3 を再実行する。

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/fundamentals.json
  git commit -m "Add ai-stock-fundamentals quiz set (25 questions)"
  ```

---

### Task 2: ai-stock-prompt-patterns クイズ (25問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/prompt-patterns.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/02-prompt-patterns/{00-README.md, 01-earnings-summary-prompts.md, 02-news-sentiment-prompts.md, 03-stock-screening-prompts.md, 04-report-generation-prompts.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

  上記5ファイルを読み、各プロンプトパターンの目的・入出力構造・注意点を把握する。

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-earnings-summary-prompts.md`→5問（決算サマリー生成プロンプトの設計）, `02-news-sentiment-prompts.md`→5問（ニュースセンチメント分析プロンプト）, `03-stock-screening-prompts.md`→5問（銘柄スクリーニングプロンプト）, `04-report-generation-prompts.md`→5問（レポート生成プロンプト）。

  Global Constraints のスキーマに従い、`src/data/ai-stock-investing-tutorial/prompt-patterns.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/prompt-patterns.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/prompt-patterns.json
  git commit -m "Add ai-stock-prompt-patterns quiz set (25 questions)"
  ```

---

### Task 3: ai-stock-data-api クイズ (25問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/data-api.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/03-data-api/{00-README.md, 01-stock-price-api.md, 02-llm-api-integration.md, 03-structured-output.md, 04-rate-limit-and-cost.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-stock-price-api.md`→5問（株価APIの取得方法・注意点）, `02-llm-api-integration.md`→5問（LLM API連携の実装パターン）, `03-structured-output.md`→5問（構造化出力の設計）, `04-rate-limit-and-cost.md`→5問（レート制限・コスト管理）。

  `src/data/ai-stock-investing-tutorial/data-api.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/data-api.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/data-api.json
  git commit -m "Add ai-stock-data-api quiz set (25 questions)"
  ```

---

### Task 4: ai-stock-analysis-agents クイズ (25問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/analysis-agents.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/04-analysis-agents/{00-README.md, 01-fundamental-analysis-agent.md, 02-technical-analysis-agent.md, 03-news-research-agent.md, 04-mcp-server-for-stock-data.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-fundamental-analysis-agent.md`→5問（ファンダメンタルズ分析エージェント）, `02-technical-analysis-agent.md`→5問（テクニカル分析エージェント）, `03-news-research-agent.md`→5問（ニュースリサーチエージェント）, `04-mcp-server-for-stock-data.md`→5問（株価データ用MCPサーバー）。

  `src/data/ai-stock-investing-tutorial/analysis-agents.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/analysis-agents.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/analysis-agents.json
  git commit -m "Add ai-stock-analysis-agents quiz set (25 questions)"
  ```

---

### Task 5: ai-stock-portfolio-management クイズ (30問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/portfolio-management.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/05-portfolio-management/{00-README.md, 01-portfolio-analysis-with-ai.md, 02-risk-assessment.md, 03-backtest-automation.md, 04-lead-lag-correlation.md, 05-wavelet-cycle-analysis.md}`
- Produces: `questions[1..30]`

- [ ] **Step 1: ソース文書を読む**

  6ファイルすべてを読む。

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計30問を作成する**

  配分: `00-README.md`→5問, `01-portfolio-analysis-with-ai.md`→5問（AIによるポートフォリオ分析）, `02-risk-assessment.md`→5問（リスク評価）, `03-backtest-automation.md`→5問（バックテスト自動化）, `04-lead-lag-correlation.md`→5問（リード・ラグ相関分析）, `05-wavelet-cycle-analysis.md`→5問（ウェーブレット周期分析）。

  `src/data/ai-stock-investing-tutorial/portfolio-management.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/portfolio-management.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/portfolio-management.json
  git commit -m "Add ai-stock-portfolio-management quiz set (30 questions)"
  ```

---

### Task 6: ai-stock-real-world-examples クイズ (25問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/real-world-examples.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/docs/06-real-world-examples/{00-README.md, 01-daily-market-report-tool.md, 02-screening-dashboard.md, 03-portfolio-advisor-agent.md, 04-strategy-builder-agent.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-daily-market-report-tool.md`→5問（デイリーレポートツール）, `02-screening-dashboard.md`→5問（スクリーニングダッシュボード）, `03-portfolio-advisor-agent.md`→5問（ポートフォリオアドバイザーエージェント）, `04-strategy-builder-agent.md`→5問（戦略ビルダーエージェント）。

  `src/data/ai-stock-investing-tutorial/real-world-examples.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/real-world-examples.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/real-world-examples.json
  git commit -m "Add ai-stock-real-world-examples quiz set (25 questions)"
  ```

---

### Task 7: ai-stock-investing-tutorial シリーズ metadata.json

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/metadata.json`

**Interfaces:**
- Consumes: Task 1-6 で確定した各セットの `questionCount`（各25問, 25, 25, 25, 30, 25）
- Produces: シリーズ全体の参考メタデータ（アプリ実行時には未使用。`src/data/claude-code-tutorial/metadata.json` と同一フォーマット）

- [ ] **Step 1: 既存フォーマットを確認する**

  `src/data/claude-code-tutorial/metadata.json` を読み、`{series: {id, name, description, version, totalQuestions, sections: [{id, track, order, name, questionCount, estimatedTime, keyTopics}]}}` の構造を確認する。

- [ ] **Step 2: metadata.json を作成する**

  以下の内容で `src/data/ai-stock-investing-tutorial/metadata.json` を作成する:

  ```json
  {
    "series": {
      "id": "ai-stock-investing-tutorial",
      "name": "AI株式投資リサーチ教材 総合シリーズ",
      "description": "AI活用の株式投資リサーチ教材を、基礎・プロンプト設計・データAPI連携・分析エージェント・ポートフォリオ管理・実践例の6カテゴリで横断的に学べる総合クイズシリーズです。",
      "version": "1.0.0",
      "totalQuestions": 155,
      "sections": [
        { "id": "ai-stock-fundamentals", "track": "Fundamentals", "order": 1, "name": "基礎 | LLMと株式投資リサーチ", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["LLM基礎", "ハルシネーション対策", "データ鮮度", "法務・倫理"] },
        { "id": "ai-stock-prompt-patterns", "track": "Prompt Patterns", "order": 2, "name": "プロンプト設計 | 決算・ニュース・スクリーニング・レポート", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["決算サマリー", "ニュースセンチメント", "銘柄スクリーニング", "レポート生成"] },
        { "id": "ai-stock-data-api", "track": "Data & API", "order": 3, "name": "データAPI連携 | 株価取得とLLM連携", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["株価API", "LLM API連携", "構造化出力", "レート制限・コスト"] },
        { "id": "ai-stock-analysis-agents", "track": "Analysis Agents", "order": 4, "name": "分析エージェント | ファンダメンタルズ・テクニカル・ニュース", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["ファンダメンタルズ分析", "テクニカル分析", "ニュースリサーチ", "MCPサーバー"] },
        { "id": "ai-stock-portfolio-management", "track": "Portfolio Management", "order": 5, "name": "ポートフォリオ管理 | 分析・リスク・バックテスト", "questionCount": 30, "estimatedTime": "18-24分", "keyTopics": ["ポートフォリオ分析", "リスク評価", "バックテスト自動化", "リード・ラグ相関", "ウェーブレット分析"] },
        { "id": "ai-stock-real-world-examples", "track": "Real-World Examples", "order": 6, "name": "実践例 | ツール実装パターン", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["デイリーレポート", "スクリーニングダッシュボード", "ポートフォリオアドバイザー", "戦略ビルダー"] }
      ]
    }
  }
  ```

- [ ] **Step 3: JSON構文を確認する**

  Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/ai-stock-investing-tutorial/metadata.json','utf8')); console.log('OK')"`
  Expected: `OK` が出力される

- [ ] **Step 4: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/metadata.json
  git commit -m "Add ai-stock-investing-tutorial series metadata"
  ```

---

### Task 8: ai-stock-app-design 独立クイズ (35問)

**Files:**
- Create: `src/data/ai-stock-investing-tutorial/app-design.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/ai-stock-investing-tutorial/app/docs/app-design.md`（1,356行、見出し構造: `## 1. 概要`, `## 2. 構成`(`### 2.1 技術スタック`, `### 2.2 ディレクトリ構成`, `### 2.3 モジュール依存関係`), `## 3. 機能一覧`, `## 4. 機能ごとの詳細`(`### 4.1`〜`### 4.9` の9機能), `## 5. 横断的な設計事項`(`### 5.1`〜`### 5.6` の6項目), `## 6. 未実装・将来課題`）
- Produces: `questions[1..35]`（Task 16 の `quizSets.json` で `questionCount: 35` として参照される、group:null の独立セット）

- [ ] **Step 1: ソース文書を読む**

  `c:/Dev/tutorials/ai-stock-investing-tutorial/app/docs/app-design.md` の全文を読む（1,356行、複数回のReadで分割してよい）。

- [ ] **Step 2: 35問を以下の配分で作成する**

  - `## 1. 概要` + `## 2. 構成`（2.1技術スタック, 2.2ディレクトリ構成, 2.3モジュール依存関係）→ 5問
  - `## 3. 機能一覧` + `## 4. 機能ごとの詳細` の9機能（4.1ポートフォリオレビュー, 4.2スクリーニング, 4.3バックテスト, 4.4一括バックテスト, 4.5セクターローテーション, 4.6銘柄詳細ダイアログ, 4.7AI戦略ビルダー, 4.8AI質問箱, 4.9管理者タブ）→ 各2問 = 18問
  - `## 5. 横断的な設計事項` の6項目（5.1 LLM連携, 5.2キャッシュ機構, 5.3データ永続化, 5.4免責事項, 5.5エラーハンドリング, 5.6テスト方針）→ 各1〜2問 = 9問
  - `## 6. 未実装・将来課題` → 3問

  Global Constraints のスキーマに従い、`id`は1〜35の連番で `src/data/ai-stock-investing-tutorial/app-design.json` に書き出す。実装の技術的詳細（使用ライブラリ名、並列数、キャッシュ機構など）を正確に反映すること。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/ai-stock-investing-tutorial/app-design.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/ai-stock-investing-tutorial/app-design.json
  git commit -m "Add ai-stock-app-design quiz set (35 questions)"
  ```

---

### Task 9: genai-invocation-architecture クイズ (20問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/invocation-and-architecture.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/01-invocation-and-architecture/{00-README.md, 01-augmented-llm-building-block.md, 02-api-sdk-vs-cli-subprocess.md, 03-system-prompt-and-io-boundary.md}`
- Produces: `questions[1..20]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計20問を作成する**

  配分: `00-README.md`→5問, `01-augmented-llm-building-block.md`→5問（Augmented LLMという構成要素の考え方）, `02-api-sdk-vs-cli-subprocess.md`→5問（API/SDK呼び出しとCLIサブプロセス呼び出しの比較）, `03-system-prompt-and-io-boundary.md`→5問（システムプロンプトとIO境界の設計）。

  `src/data/genai-app-integration-tutorial/invocation-and-architecture.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/invocation-and-architecture.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/invocation-and-architecture.json
  git commit -m "Add genai-invocation-architecture quiz set (20 questions)"
  ```

---

### Task 10: genai-io-contract-design クイズ (25問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/io-contract-design.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/02-io-contract-design/{00-README.md, 01-structured-output-json-contract.md, 02-single-vs-batch-prompting.md, 03-prompt-scope-and-constraints.md, 04-multi-turn-dialogue-prompting.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-structured-output-json-contract.md`→5問（構造化出力のJSON契約設計）, `02-single-vs-batch-prompting.md`→5問（単発とバッチプロンプトの使い分け）, `03-prompt-scope-and-constraints.md`→5問（プロンプトの範囲と制約設計）, `04-multi-turn-dialogue-prompting.md`→5問（マルチターン対話プロンプト設計）。

  `src/data/genai-app-integration-tutorial/io-contract-design.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/io-contract-design.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/io-contract-design.json
  git commit -m "Add genai-io-contract-design quiz set (25 questions)"
  ```

---

### Task 11: genai-reliability-and-cost クイズ (30問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/reliability-and-cost.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/03-reliability-and-cost/{00-README.md, 01-defensive-parsing-and-fallback.md, 02-rate-limit-and-timeout.md, 03-caching-strategy.md, 04-batching-and-parallelization.md, 05-testing-llm-integrations.md}`
- Produces: `questions[1..30]`

- [ ] **Step 1: ソース文書を読む**

  6ファイルすべてを読む。

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計30問を作成する**

  配分: `00-README.md`→5問, `01-defensive-parsing-and-fallback.md`→5問（防御的パースとフォールバック）, `02-rate-limit-and-timeout.md`→5問（レート制限とタイムアウト対策）, `03-caching-strategy.md`→5問（キャッシュ戦略）, `04-batching-and-parallelization.md`→5問（バッチ処理と並列化）, `05-testing-llm-integrations.md`→5問（LLM統合のテスト手法）。

  `src/data/genai-app-integration-tutorial/reliability-and-cost.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/reliability-and-cost.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/reliability-and-cost.json
  git commit -m "Add genai-reliability-and-cost quiz set (30 questions)"
  ```

---

### Task 12: genai-trust-and-safety-ux クイズ (25問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/trust-and-safety-ux.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/04-trust-and-safety-ux/{00-README.md, 01-verification-checkpoint.md, 02-fact-and-opinion-separation.md, 03-guardrails-and-disclaimers.md, 04-prompt-injection-defense.md}`
- Produces: `questions[1..25]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計25問を作成する**

  配分: `00-README.md`→5問, `01-verification-checkpoint.md`→5問（検証チェックポイントの設計）, `02-fact-and-opinion-separation.md`→5問（事実と意見の分離）, `03-guardrails-and-disclaimers.md`→5問（ガードレールと免責事項）, `04-prompt-injection-defense.md`→5問（プロンプトインジェクション対策）。

  `src/data/genai-app-integration-tutorial/trust-and-safety-ux.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/trust-and-safety-ux.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/trust-and-safety-ux.json
  git commit -m "Add genai-trust-and-safety-ux quiz set (25 questions)"
  ```

---

### Task 13: genai-agentic-workflow-patterns クイズ (30問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/agentic-workflow-patterns.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/05-agentic-workflow-patterns/{00-README.md, 01-prompt-chaining.md, 02-routing.md, 03-orchestrator-workers.md, 04-evaluator-optimizer.md, 05-autonomous-agents.md}`
- Produces: `questions[1..30]`

- [ ] **Step 1: ソース文書を読む**

  6ファイルすべてを読む。

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計30問を作成する**

  配分: `00-README.md`→5問, `01-prompt-chaining.md`→5問（プロンプトチェイニング）, `02-routing.md`→5問（ルーティングパターン）, `03-orchestrator-workers.md`→5問（オーケストレーター・ワーカーパターン）, `04-evaluator-optimizer.md`→5問（評価者・最適化パターン）, `05-autonomous-agents.md`→5問（自律型エージェント）。

  `src/data/genai-app-integration-tutorial/agentic-workflow-patterns.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/agentic-workflow-patterns.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/agentic-workflow-patterns.json
  git commit -m "Add genai-agentic-workflow-patterns quiz set (30 questions)"
  ```

---

### Task 14: genai-real-world-case-study クイズ (20問)

**Files:**
- Create: `src/data/genai-app-integration-tutorial/real-world-case-study.json`

**Interfaces:**
- Consumes: `c:/Dev/tutorials/genai-app-integration-tutorial/docs/06-real-world-case-study/{00-README.md, 01-case-study-map.md, 02-exercise-apply-to-your-app.md, 03-operations-checklist.md}`
- Produces: `questions[1..20]`

- [ ] **Step 1: ソース文書を読む**

- [ ] **Step 2: 各ファイルにつき5問ずつ、合計20問を作成する**

  配分: `00-README.md`→5問, `01-case-study-map.md`→5問（ケーススタディの全体マップ）, `02-exercise-apply-to-your-app.md`→5問（自分のアプリへの適用演習）, `03-operations-checklist.md`→5問（運用チェックリスト）。

  `src/data/genai-app-integration-tutorial/real-world-case-study.json` に書き出す。

- [ ] **Step 3: スキーマ検証を実行する**

  Run: `npm run validate:quiz -- src/data/genai-app-integration-tutorial/real-world-case-study.json`
  Expected: エラーなく終了する

- [ ] **Step 4: 検証エラーがあれば修正し、再実行する**

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/real-world-case-study.json
  git commit -m "Add genai-real-world-case-study quiz set (20 questions)"
  ```

---

### Task 15: genai-app-integration-tutorial シリーズ metadata.json

**Files:**
- Create: `src/data/genai-app-integration-tutorial/metadata.json`

**Interfaces:**
- Consumes: Task 9-14 で確定した各セットの `questionCount`（20, 25, 30, 25, 30, 20）
- Produces: シリーズ全体の参考メタデータ（Task 7と同一フォーマット）

- [ ] **Step 1: metadata.json を作成する**

  `src/data/claude-code-tutorial/metadata.json` と同じフォーマットで、以下の内容で `src/data/genai-app-integration-tutorial/metadata.json` を作成する:

  ```json
  {
    "series": {
      "id": "genai-app-integration-tutorial",
      "name": "生成AIアプリ統合 実践ガイド 総合シリーズ",
      "description": "生成AIをアプリに統合する実践ガイドを、呼び出し設計・IOコントラクト・信頼性とコスト・信頼と安全性UX・エージェント型ワークフロー・実例の6カテゴリで横断的に学べる総合クイズシリーズです。",
      "version": "1.0.0",
      "totalQuestions": 150,
      "sections": [
        { "id": "genai-invocation-architecture", "track": "Invocation & Architecture", "order": 1, "name": "呼び出し設計 | Augmented LLMとIO境界", "questionCount": 20, "estimatedTime": "12-16分", "keyTopics": ["Augmented LLM", "API/SDK", "CLIサブプロセス", "システムプロンプト", "IO境界"] },
        { "id": "genai-io-contract-design", "track": "I/O Contract Design", "order": 2, "name": "IOコントラクト設計 | 構造化出力とプロンプト設計", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["JSON契約", "単発/バッチプロンプト", "プロンプト範囲", "マルチターン対話"] },
        { "id": "genai-reliability-and-cost", "track": "Reliability & Cost", "order": 3, "name": "信頼性とコスト | パース・レート制限・キャッシュ", "questionCount": 30, "estimatedTime": "18-24分", "keyTopics": ["防御的パース", "レート制限", "キャッシュ戦略", "バッチ処理", "テスト手法"] },
        { "id": "genai-trust-and-safety-ux", "track": "Trust & Safety UX", "order": 4, "name": "信頼と安全性UX | 検証・ガードレール", "questionCount": 25, "estimatedTime": "15-20分", "keyTopics": ["検証チェックポイント", "事実と意見の分離", "ガードレール", "プロンプトインジェクション対策"] },
        { "id": "genai-agentic-workflow-patterns", "track": "Agentic Workflow Patterns", "order": 5, "name": "エージェント型ワークフロー | チェイニング・ルーティング・自律エージェント", "questionCount": 30, "estimatedTime": "18-24分", "keyTopics": ["プロンプトチェイニング", "ルーティング", "オーケストレーター・ワーカー", "評価者・最適化", "自律型エージェント"] },
        { "id": "genai-real-world-case-study", "track": "Real-World Case Study", "order": 6, "name": "実例 | ケーススタディと運用チェックリスト", "questionCount": 20, "estimatedTime": "12-16分", "keyTopics": ["ケーススタディ", "適用演習", "運用チェックリスト"] }
      ]
    }
  }
  ```

- [ ] **Step 2: JSON構文を確認する**

  Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/genai-app-integration-tutorial/metadata.json','utf8')); console.log('OK')"`
  Expected: `OK` が出力される

- [ ] **Step 3: コミット**

  ```bash
  git add src/data/genai-app-integration-tutorial/metadata.json
  git commit -m "Add genai-app-integration-tutorial series metadata"
  ```

---

### Task 16: quizSets.json への登録 と quiz-generator.config.json の更新

**Files:**
- Modify: `src/data/quizSets.json`
- Modify: `.github/skills-config/quiz-generator/quiz-generator.config.json`

**Interfaces:**
- Consumes: Task 1-15 で作成した全ファイルパスと確定 `questionCount`
- Produces: アプリが実際に読み込む唯一のメタデータインデックス。以降のタスクの検証対象。

- [ ] **Step 1: quizSets.json の `quizSets` 配列の末尾に以下15エントリを追加する**

  `src/data/quizSets.json` を読み、既存配列の最後の `}` の直後に以下を追記する（JSON構文上、直前の要素の後にカンマを追加すること）:

  ```json
    {
      "id": "ai-stock-investing-tutorial",
      "name": "AI株式投資リサーチ教材 総合シリーズ",
      "description": "AI活用の株式投資リサーチ教材を、基礎・プロンプト設計・データAPI連携・分析エージェント・ポートフォリオ管理・実践例の6カテゴリで横断的に学べる総合クイズシリーズです。",
      "category": "AI株式投資",
      "icon": "📈",
      "questionCount": 155,
      "difficulty": "beginner to advanced",
      "dataPath": null,
      "parentId": null,
      "group": "ai-stock-investing-tutorial-series",
      "level": 1,
      "order": 1,
      "estimatedLearningTime": "90-120分",
      "topics": ["LLM基礎", "プロンプト設計", "データAPI", "分析エージェント", "ポートフォリオ管理", "実践例"]
    },
    {
      "id": "ai-stock-fundamentals",
      "name": "基礎 | LLMと株式投資リサーチ",
      "description": "5教材×5問で、LLMを株式投資リサーチに使う基礎、ハルシネーション対策、データ鮮度、法務・倫理面の注意点を確認するセットです。",
      "category": "AI株式投資",
      "icon": "📖",
      "questionCount": 25,
      "difficulty": "beginner",
      "dataPath": "ai-stock-investing-tutorial/fundamentals.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 1,
      "estimatedLearningTime": "15-20分",
      "topics": ["LLM基礎", "ハルシネーション対策", "データ鮮度", "法務・倫理"]
    },
    {
      "id": "ai-stock-prompt-patterns",
      "name": "プロンプト設計 | 決算・ニュース・スクリーニング・レポート",
      "description": "5教材×5問で、決算サマリー・ニュースセンチメント・銘柄スクリーニング・レポート生成のプロンプト設計パターンを確認するセットです。",
      "category": "AI株式投資",
      "icon": "✍️",
      "questionCount": 25,
      "difficulty": "beginner to intermediate",
      "dataPath": "ai-stock-investing-tutorial/prompt-patterns.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 2,
      "estimatedLearningTime": "15-20分",
      "topics": ["決算サマリー", "ニュースセンチメント", "銘柄スクリーニング", "レポート生成"]
    },
    {
      "id": "ai-stock-data-api",
      "name": "データAPI連携 | 株価取得とLLM連携",
      "description": "5教材×5問で、株価APIの活用、LLM API連携、構造化出力、レート制限・コスト管理を確認するセットです。",
      "category": "AI株式投資",
      "icon": "🔌",
      "questionCount": 25,
      "difficulty": "intermediate",
      "dataPath": "ai-stock-investing-tutorial/data-api.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 3,
      "estimatedLearningTime": "15-20分",
      "topics": ["株価API", "LLM API連携", "構造化出力", "レート制限・コスト"]
    },
    {
      "id": "ai-stock-analysis-agents",
      "name": "分析エージェント | ファンダメンタルズ・テクニカル・ニュース",
      "description": "5教材×5問で、ファンダメンタルズ分析・テクニカル分析・ニュースリサーチの各エージェントとMCPサーバー連携を確認するセットです。",
      "category": "AI株式投資",
      "icon": "🧮",
      "questionCount": 25,
      "difficulty": "intermediate",
      "dataPath": "ai-stock-investing-tutorial/analysis-agents.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 4,
      "estimatedLearningTime": "15-20分",
      "topics": ["ファンダメンタルズ分析", "テクニカル分析", "ニュースリサーチ", "MCPサーバー"]
    },
    {
      "id": "ai-stock-portfolio-management",
      "name": "ポートフォリオ管理 | 分析・リスク・バックテスト",
      "description": "6教材×5問で、AIによるポートフォリオ分析、リスク評価、バックテスト自動化、リード・ラグ相関、ウェーブレット周期分析を確認するセットです。",
      "category": "AI株式投資",
      "icon": "💼",
      "questionCount": 30,
      "difficulty": "intermediate to advanced",
      "dataPath": "ai-stock-investing-tutorial/portfolio-management.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 5,
      "estimatedLearningTime": "18-24分",
      "topics": ["ポートフォリオ分析", "リスク評価", "バックテスト自動化", "リード・ラグ相関", "ウェーブレット分析"]
    },
    {
      "id": "ai-stock-real-world-examples",
      "name": "実践例 | ツール実装パターン",
      "description": "5教材×5問で、デイリーレポートツール・スクリーニングダッシュボード・ポートフォリオアドバイザー・戦略ビルダーの実装例を確認するセットです。",
      "category": "AI株式投資",
      "icon": "🌐",
      "questionCount": 25,
      "difficulty": "advanced",
      "dataPath": "ai-stock-investing-tutorial/real-world-examples.json",
      "parentId": "ai-stock-investing-tutorial",
      "group": "ai-stock-investing-tutorial-series",
      "level": 2,
      "order": 6,
      "estimatedLearningTime": "15-20分",
      "topics": ["デイリーレポート", "スクリーニングダッシュボード", "ポートフォリオアドバイザー", "戦略ビルダー"]
    },
    {
      "id": "ai-stock-app-design",
      "name": "株投資リサーチアプリ 実装アーキテクチャ",
      "description": "AI株式投資リサーチアプリ(ai-stock-investing-tutorial/app)の実装アーキテクチャを、技術スタック・機能詳細9項目・横断的設計事項から学ぶクイズです。",
      "category": "AI株式投資",
      "icon": "🏗️",
      "questionCount": 35,
      "difficulty": "intermediate",
      "dataPath": "ai-stock-investing-tutorial/app-design.json",
      "parentId": null,
      "group": null,
      "level": 1,
      "order": 2,
      "estimatedLearningTime": "20-25分",
      "topics": ["Streamlitアーキテクチャ", "LLM連携", "キャッシュ機構", "データ永続化", "テスト方針"]
    },
    {
      "id": "genai-app-integration-tutorial",
      "name": "生成AIアプリ統合 実践ガイド 総合シリーズ",
      "description": "生成AIをアプリに統合する実践ガイドを、呼び出し設計・IOコントラクト・信頼性とコスト・信頼と安全性UX・エージェント型ワークフロー・実例の6カテゴリで横断的に学べる総合クイズシリーズです。",
      "category": "生成AIアプリ統合",
      "icon": "🧩",
      "questionCount": 150,
      "difficulty": "beginner to advanced",
      "dataPath": null,
      "parentId": null,
      "group": "genai-app-integration-tutorial-series",
      "level": 1,
      "order": 1,
      "estimatedLearningTime": "90-120分",
      "topics": ["Augmented LLM", "IOコントラクト", "信頼性とコスト", "信頼と安全性UX", "エージェント型ワークフロー", "実例"]
    },
    {
      "id": "genai-invocation-architecture",
      "name": "呼び出し設計 | Augmented LLMとIO境界",
      "description": "4教材×5問で、Augmented LLMの構成要素、API/SDKとCLIサブプロセスの選択、システムプロンプトとIO境界の設計を確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "🧱",
      "questionCount": 20,
      "difficulty": "beginner",
      "dataPath": "genai-app-integration-tutorial/invocation-and-architecture.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 1,
      "estimatedLearningTime": "12-16分",
      "topics": ["Augmented LLM", "API/SDK", "CLIサブプロセス", "システムプロンプト", "IO境界"]
    },
    {
      "id": "genai-io-contract-design",
      "name": "IOコントラクト設計 | 構造化出力とプロンプト設計",
      "description": "5教材×5問で、構造化出力のJSON契約設計、単発・バッチプロンプト、プロンプトの範囲と制約、マルチターン対話設計を確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "📐",
      "questionCount": 25,
      "difficulty": "beginner to intermediate",
      "dataPath": "genai-app-integration-tutorial/io-contract-design.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 2,
      "estimatedLearningTime": "15-20分",
      "topics": ["JSON契約", "単発/バッチプロンプト", "プロンプト範囲", "マルチターン対話"]
    },
    {
      "id": "genai-reliability-and-cost",
      "name": "信頼性とコスト | パース・レート制限・キャッシュ",
      "description": "6教材×5問で、防御的パース・フォールバック、レート制限・タイムアウト対策、キャッシュ戦略、バッチ・並列化、LLM統合のテスト手法を確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "🛡️",
      "questionCount": 30,
      "difficulty": "intermediate",
      "dataPath": "genai-app-integration-tutorial/reliability-and-cost.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 3,
      "estimatedLearningTime": "18-24分",
      "topics": ["防御的パース", "レート制限", "キャッシュ戦略", "バッチ処理", "テスト手法"]
    },
    {
      "id": "genai-trust-and-safety-ux",
      "name": "信頼と安全性UX | 検証・ガードレール",
      "description": "5教材×5問で、検証チェックポイント、事実と意見の分離、ガードレールと免責事項、プロンプトインジェクション対策を確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "🤝",
      "questionCount": 25,
      "difficulty": "intermediate",
      "dataPath": "genai-app-integration-tutorial/trust-and-safety-ux.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 4,
      "estimatedLearningTime": "15-20分",
      "topics": ["検証チェックポイント", "事実と意見の分離", "ガードレール", "プロンプトインジェクション対策"]
    },
    {
      "id": "genai-agentic-workflow-patterns",
      "name": "エージェント型ワークフロー | チェイニング・ルーティング・自律エージェント",
      "description": "6教材×5問で、プロンプトチェイニング、ルーティング、オーケストレーター・ワーカー、評価者・最適化、自律型エージェントのパターンを確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "🔄",
      "questionCount": 30,
      "difficulty": "intermediate to advanced",
      "dataPath": "genai-app-integration-tutorial/agentic-workflow-patterns.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 5,
      "estimatedLearningTime": "18-24分",
      "topics": ["プロンプトチェイニング", "ルーティング", "オーケストレーター・ワーカー", "評価者・最適化", "自律型エージェント"]
    },
    {
      "id": "genai-real-world-case-study",
      "name": "実例 | ケーススタディと運用チェックリスト",
      "description": "4教材×5問で、ケーススタディの読み方、自分のアプリへの適用演習、運用チェックリストを確認するセットです。",
      "category": "生成AIアプリ統合",
      "icon": "🗺️",
      "questionCount": 20,
      "difficulty": "advanced",
      "dataPath": "genai-app-integration-tutorial/real-world-case-study.json",
      "parentId": "genai-app-integration-tutorial",
      "group": "genai-app-integration-tutorial-series",
      "level": 2,
      "order": 6,
      "estimatedLearningTime": "12-16分",
      "topics": ["ケーススタディ", "適用演習", "運用チェックリスト"]
    }
  ```

- [ ] **Step 2: `quiz-generator.config.json` の `questionGlobs` に2エントリを追加する**

  `.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` 配列に以下2行を追加する（既存6エントリの末尾にカンマを追加してから追記）:

  ```json
    "src/data/ai-stock-investing-tutorial/*.json",
    "src/data/genai-app-integration-tutorial/*.json"
  ```

- [ ] **Step 3: quizSets.json のJSON構文を確認する**

  Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/quizSets.json','utf8')); console.log('OK')"`
  Expected: `OK` が出力される

- [ ] **Step 4: quiz-generator.config.json のJSON構文を確認する**

  Run: `node -e "JSON.parse(require('fs').readFileSync('.github/skills-config/quiz-generator/quiz-generator.config.json','utf8')); console.log('OK')"`
  Expected: `OK` が出力される

- [ ] **Step 5: コミット**

  ```bash
  git add src/data/quizSets.json .github/skills-config/quiz-generator/quiz-generator.config.json
  git commit -m "Register ai-stock and genai-app-integration quiz sets in quizSets.json"
  ```

---

### Task 17: 全体検証

**Files:** (検証のみ、ファイル変更なし。ただしエラーが出た場合は Task 1-16 で作成/変更したファイルを修正する)

**Interfaces:**
- Consumes: Task 1-16 で作成した全ファイル

- [ ] **Step 1: メタデータ検証を実行する**

  Run: `npm run validate:metadata`
  Expected: `quizSets.json` 内の全エントリ（新規15件含む）がスキーマに準拠しエラーなく終了する

- [ ] **Step 2: クイズ問題の検証を実行する**

  Run: `npm run validate:quiz`
  Expected: `quiz-generator.config.json` の `questionGlobs`（Task 16で追加した2パス含む）にマッチする全ファイルがスキーマに準拠しエラーなく終了する

- [ ] **Step 3: 全体検証を実行する**

  Run: `npm run validate:all`
  Expected: metadata検証・quiz検証の両方がエラーなく終了する

- [ ] **Step 4: エラーがあれば該当ファイルを修正し、Step 1-3 を再実行する**

  よくあるエラー: `questionCount` と実際の `questions` 配列長の不一致（`quizSets.json` 側を実測値に合わせて修正する）、`id` の重複・連番崩れ、`options` が4つでない。

- [ ] **Step 5: 修正が発生した場合のみコミット**

  ```bash
  git add -A
  git commit -m "Fix validation errors in ai-stock/genai quiz sets"
  ```

  修正が不要だった場合はこのステップをスキップする。

---

### Task 18: 開発サーバーでの目視確認

**Files:** (確認のみ、ファイル変更なし)

- [ ] **Step 1: データを public/ に同期する**

  Run: `npm run sync-data`
  Expected: `public/data/ai-stock-investing-tutorial/` と `public/data/genai-app-integration-tutorial/` に新規JSONファイルがコピーされる

- [ ] **Step 2: 開発サーバーを起動する**

  Run: `npm run dev`（バックグラウンド実行、通常 `http://localhost:5173`）

- [ ] **Step 3: クイズセット選択画面で新規シリーズが表示されることを確認する**

  ブラウザで `http://localhost:5173/spa-quiz-app/` を開き、カテゴリ「AI株式投資」に7セット（親1+子6）、「生成AIアプリ統合」に7セット（親1+子6）が表示されることを確認する。親子階層（パンくずリスト、STEP表示相当のグループ化）が正しく表示されることも確認する。

- [ ] **Step 4: 新規クイズセットを実際に解答できることを確認する**

  「ai-stock-fundamentals」と「genai-invocation-architecture」のいずれかを開始し、最低3問に回答して正誤判定・解説が正しく表示されることを確認する。「ai-stock-app-design」（独立セット）も同様に開始できることを確認する。

- [ ] **Step 5: 開発サーバーを停止する**

  Run: 起動したプロセスを終了する。

---

## Self-Review Summary

- **Spec coverage:** 設計書の3対象（ai-stockシリーズ6セット、app-design独立セット、genaiシリーズ6セット）すべてにタスクが対応（Task 1-6, 8, 9-14）。metadata.json（Task 7, 15）、quizSets.json登録とconfig更新（Task 16）、検証（Task 17）、目視確認（Task 18）も網羅。
- **Placeholder scan:** 各タスクに実ファイルパス・実際の配分・実行コマンドを明記。「TBD」等なし。
- **Type consistency:** 全タスクで `dataPath` の値（例: `ai-stock-investing-tutorial/fundamentals.json`）と Task 16 の `quizSets.json` エントリの `dataPath` が一致することを確認済み。`questionCount` も各タスクの問題数と Task 16 のエントリ値が一致。
