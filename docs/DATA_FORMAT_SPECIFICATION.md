# データフォーマット仕様書

このドキュメントは、SPA Quiz App 用のクイズセットを作成・提供する際に従うべきデータフォーマットの仕様です。

**最終更新**: 2024-03-08

---

## 概要

SPA Quiz App は、以下の2つのレベルでデータを管理します：

1. **メタデータレベル** (`quizSets.json`)：クイズセット情報のカタログ
2. **質問データレベル** (各 JSON ファイル)：個別の問題と解答

---

## 1. メタデータ形式 (`quizSets.json`)

### 構造

```json
{
  "quizSets": [
    { /* QuizSet メタデータ */ }
  ]
}
```

### QuizSet メタデータの仕様

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `id` | string | ✓ | クイズセットの一意識別子（ケバブケース） | `"github-copilot-variables"` |
| `name` | string | ✓ | 表示用の名前 | `"チャット参加者・スラッシュコマンド・チャット変数について"` |
| `description` | string | ✓ | クイズセットの説明（50-200字推奨） | `"チャット参加者・スラッシュコマンド・チャット変数を学べるクイズです"` |
| `category` | string | ✓ | カテゴリ | `"GitHub"`, `"アーキテクチャ"`, `"技術"` |
| `icon` | string | ✓ | 表示用の絵文字 | `"🤖"`, `"💻"`, `"📚"` |
| `questionCount` | number | ✓ | 問題数 | `30`, `21` |
| `difficulty` | string | ✓ | 難易度 | `"beginner"`, `"intermediate"`, `"advanced"`, `"beginner to intermediate"` |
| `dataPath` | string | ✓ | データファイルの相対パス（`public/data/` からの相対パス） | `"github-copilot/github-copilot-variables.json"` |
| `parentId` | string\|null | ✓ | 親クイズセットID（なければ `null`） | `"clean-architecture"` |
| `group` | string\|null | ✓ | グループ名（複数セットをグループ化する場合） | `"clean-architecture-series"` |
| `level` | number | ✓ | 階層レベル（1=トップ、2=子） | `1`, `2` |
| `order` | number | ✓ | グループ内の表示順序 | `1`, `2`, `3` |

### 例

```json
{
  "quizSets": [
    {
      "id": "my-new-quiz",
      "name": "My New Quiz Set",
      "description": "This is a new quiz set for testing.",
      "category": "Technology",
      "icon": "⭐",
      "questionCount": 10,
      "difficulty": "intermediate",
      "dataPath": "my-category/my-new-quiz.json",
      "parentId": null,
      "group": null,
      "level": 1,
      "order": 999
    }
  ]
}
```

### 検証

JSON Schema：`/public/schemas/quizset-metadata-schema.json`

```bash
# コマンドラインで検証
node scripts/validate-quiz-metadata.mjs quizSets.json
```

---

## 2. 質問データ形式

### ファイル構造

各クイズセットは、以下の構造の JSON ファイルで定義されます：

```json
{
  "questions": [
    { /* Question オブジェクト */ }
  ]
}
```

### Question オブジェクトの仕様

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `id` | number | ✓ | 問題の一意識別子（クイズセット内で連番） | `1`, `2`, `3` |
| `question` | string | ✓ | 問題文 | `"クリーンアーキテクチャの主要なゴールは？"` |
| `options` | array | ✓ | 選択肢**を配列**（**4つが必須**） | See below |
| `correctAnswer` | string | ✓ | 正解の選択肢ID | `"A"`, `"B"`, `"C"`, `"D"` |
| `explanation` | string | ✓ | 正解の理由と詳細解説 | `"クリーンアーキテクチャは..."` |

### Option オブジェクトの仕様

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| `id` | string | ✓ | 選択肢ID（A/B/C/D いずれか） | `"A"`, `"B"` |
| `text` | string | ✓ | 選択肢のテキスト | `"フレームワーク非依存性"` |

### 例

```json
{
  "questions": [
    {
      "id": 1,
      "question": "クリーンアーキテクチャの主要なゴールとして正しいものはどれか？",
      "options": [
        {
          "id": "A",
          "text": "フレームワーク非依存、テスト容易性、保守性と拡張性"
        },
        {
          "id": "B",
          "text": "速度重視、コスト削減、セキュリティ強化"
        },
        {
          "id": "C",
          "text": "ユーザーインターフェース、データベース、ネットワーク統合"
        },
        {
          "id": "D",
          "text": "フレームワーク依存、テスト困難性、短期開発"
        }
      ],
      "correctAnswer": "A",
      "explanation": "クリーンアーキテクチャの3つの目標は、特定のフレームワークに依存しないこと、ビジネスロジックをフレームワークから切り離してテストを容易にすること、そして長期的な保守と変更の容易さを実現することです。"
    }
  ]
}
```

### 検証

JSON Schema：`/public/schemas/question-set-schema.json`

```bash
# コマンドラインで検証
node scripts/validate-quiz-questions.mjs path/to/quiz.json
```

---

## 3. ファイル配置

### 推奨ディレクトリ構造

```
public/data/
├── quizSets.json                      # メタデータインデックス
├── github-copilot/
│   ├── github-copilot-variables.json
│   └── github-copilot-csharp-best-practices.json
├── clean-architecture/
│   ├── clean-architecture.json
│   ├── step1-foundation.json
│   ├── step2-design.json
│   ├── step3-implementation.json
│   ├── step4-judgment.json
│   └── step5-practice.json
└── my-new-category/                  # 新規カテゴリ
    └── my-new-quiz.json
```

### スキーマファイル

```
public/schemas/
├── quizset-metadata-schema.json       # メタデータスキーマ
├── question-set-schema.json           # 問題セットスキーマ
└── question-schema.json               # 個別問題スキーマ
```

---

## 4. ネーミング規則

### ID フォーマット

- **quizSetId**: ケバブケース (kebab-case)
  - ✓ `"github-copilot-variables"`
  - ✓ `"clean-architecture-step1"`
  - ✗ `"githubCopilotVariables"`
  - ✗ `"GitHub_Copilot_Variables"`

### ファイル名

- **JSON ファイル名**: ケバブケース + `.json` 拡張子
  - ✓ `github-copilot-variables.json`
  - ✓ `clean-architecture-step1.json`
  - ✗ `githubCopilotVariables.json`

### ディレクトリ名

- **カテゴリディレクトリ**: 小文字 + ハイフン + `json`
  - ✓ `github-copilot/`
  - ✓ `clean-architecture/`
  - ✗ `GitHubCopilot/`

---

## 5. 段階的な導入ガイド

### Step 1: テンプレートから開始

[template/questions.json](/public/data/template/questions.json) を参考に基本構造を作成してください。

### Step 2: JSON Schema で検証

```bash
npm run validate:quiz -- path/to/your-quiz.json
```

### Step 3: メタデータに登録

`quizSets.json` に新しいエントリを追加：

```json
{
  "id": "your-quiz-id",
  "name": "Your Quiz Name",
  "description": "Your quiz description",
  ...
}
```

### Step 4: PR で提出

以下の情報と共に PR を開いてください：
- [ ] JSON Schema 検証に合格
- [ ] ファイル名・ID がネーミング規則に準拠
- [ ] 問題文と解説が明確
- [ ] 全 4 選択肢に正解が設定
- [ ] `questionCount` が実際の問題数と一致

---

## 6. よくある質問 (FAQ)

### Q1: 問題と選択肢の数が異なる場合は？

A: オプション配列は**必ず 4 つ**である必要があります。不足している場合は、`"テキスト未設定"` のようなプレースホルダーを追加してしてください。

### Q2: 複数の正解がある場合は？

A: 現在のシステムでは複数正解に対応していません。1 つの最適な正解を選択してください。

### Q3: 難易度レベルはどうやって決めればよい？

A: 以下の基準を参考にしてください：
- **beginner**: 基本概念の理解確認
- **intermediate**: 実践的な知識が必要
- **advanced**: 深い理解と応用が必要
- **beginner to intermediate**: 2 つのレベルの混在

### Q4: 階層的なクイズセット（parentId を使う）の例は？

A: [clean-architecture シリーズ](/public/data/clean-architecture/) を参照してください：
- `clean-architecture` (level=1, parentId=null，親)
- `clean-architecture-step1` (level=2, parentId="clean-architecture"，子)

---

## 7. バリデーション & ツール

### 自動検証スクリプト

```bash
# 全クイズセットを検証
npm run validate:all

# 特定のクイズセットを検証
npm run validate:quiz -- path/to/quiz.json

# メタデータを検証
npm run validate:metadata
```

### JSON Schema リンク

- Question Schema: `https://spa-quiz-app.example.com/schemas/question.json`
- Question Set Schema: `https://spa-quiz-app.example.com/schemas/question-set-schema.json`
- Metadata Schema: `https://spa-quiz-app.example.com/schemas/quizset-metadata-schema.json`

---

## 8. 外部 Tutorial からの取り込み

新しい Tutorial からクイズセットを生成する場合、以下のツールを使用してください：

```bash
# Markdown から自動生成
npm run generate:from-markdown -- path/to/tutorial.md

# Web リソースから抽出
npm run import:from-url -- https://example.com/tutorial
```

詳細は [取り込みガイド](./IMPORT_GUIDE.md) を参照してください。

---

## 9. サポート

質問やフィードバックがある場合：

1. **GitHub Issues**: [spa-quiz-app/issues](https://github.com/user/spa-quiz-app/issues)
2. **Discussion**: [GitHub Discussions](https://github.com/user/spa-quiz-app/discussions)
3. **Email**: support@example.com

---

**スキーマバージョン**: 1.0.0  
**最終更新**: 2024-03-08
