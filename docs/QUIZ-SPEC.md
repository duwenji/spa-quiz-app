# クイズデータ仕様書

> **対象:** 外部からクイズコンテンツを提供・取り込む方

本ドキュメントは、spa-quiz-app に取り込む**クイズデータの形式仕様**を定義します。  
開発環境がなくても、本仕様に従ったファイルを作成すれば取り込みを依頼できます。

## 目次

1. [ファイル構成](#1-ファイル構成)
2. [問題ファイル仕様](#2-問題ファイル仕様)
3. [メタデータ仕様](#3-メタデータ仕様)
4. [シリーズ（階層）構成](#4-シリーズ階層構成)
5. [命名規則](#5-命名規則)
6. [難易度ガイドライン](#6-難易度ガイドライン)
7. [バリデーション](#7-バリデーション)
8. [提出方法](#8-提出方法)

---

## 1. ファイル構成

外部から提供していただくファイルは **2種類** です。

| ファイル | 説明 |
|---|---|
| `<quiz-id>.json` | 問題データ（問題・選択肢・正解・解説） |
| メタデータ情報 | クイズの名前・カテゴリ・難易度など |

メタデータは提出時に情報として記載いただければ、管理者側で `quizSets.json` に登録します。

### 配置イメージ

```
public/data/
  quizSets.json                         ← 管理者が更新
  <カテゴリ>/
    <quiz-id>.json                      ← 提供いただくファイル
```

**カテゴリ例:** `github-copilot/`, `clean-architecture/`, `typescript/`, `aws/`

---

## 2. 問題ファイル仕様

### 2-1. ファイル全体の構造

```json
{
  "questions": [
    { /* 問題オブジェクト 1 */ },
    { /* 問題オブジェクト 2 */ }
  ]
}
```

トップレベルは `questions` キーを持つオブジェクトのみです。  
追加のキーは**禁止**（`additionalProperties: false`）。

---

### 2-2. 問題オブジェクト仕様

```json
{
  "id": 1,
  "question": "問題文をここに記述する",
  "options": [
    { "id": "A", "text": "選択肢A" },
    { "id": "B", "text": "選択肢B" },
    { "id": "C", "text": "選択肢C" },
    { "id": "D", "text": "選択肢D" }
  ],
  "correctAnswer": "B",
  "explanation": "なぜBが正解なのかの詳しい解説をここに記述する。"
}
```

#### フィールド定義

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|-----|:---:|------|------|
| `id` | number | ✅ | 1 以上の整数、クイズ内連番 | 問題の番号（1, 2, 3…） |
| `question` | string | ✅ | 空文字禁止 | 問題文 |
| `options` | array | ✅ | 必ず 4 要素（A/B/C/D 全て） | 選択肢の配列 |
| `options[].id` | string | ✅ | `"A"`, `"B"`, `"C"`, `"D"` のいずれか | 選択肢の識別子 |
| `options[].text` | string | ✅ | 空文字禁止 | 選択肢の本文 |
| `correctAnswer` | string | ✅ | `"A"`, `"B"`, `"C"`, `"D"` のいずれか | 正解の選択肢 ID |
| `explanation` | string | ✅ | 空文字禁止 | 正解の解説 |

> ⚠️ `options` の各要素に `"A"` / `"B"` / `"C"` / `"D"` 以外のキーを追加することは禁止されています。

---

### 2-3. 完全な記述例

```json
{
  "questions": [
    {
      "id": 1,
      "question": "GitHub Copilot でより正確なコード補完を得るために効果的なコメントの書き方はどれですか？",
      "options": [
        { "id": "A", "text": "曖昧なコメント（例：「ユーザーを処理する」）" },
        { "id": "B", "text": "具体的なコメント（例：「最終ログインが30日以上前のユーザーを非アクティブとしてマークする」）" },
        { "id": "C", "text": "コメントなし" },
        { "id": "D", "text": "英語のコメントのみ" }
      ],
      "correctAnswer": "B",
      "explanation": "具体的なコメントを書くことで、Copilot はより正確なコードを提案できます。曖昧なコメントでは意図が伝わりにくく、不正確な提案になる可能性があります。問題の範囲・対象・処理内容を明示することが重要です。"
    },
    {
      "id": 2,
      "question": "JSON スキーマの `additionalProperties: false` が意味することは何ですか？",
      "options": [
        { "id": "A", "text": "追加のプロパティを自由に加えられる" },
        { "id": "B", "text": "スキーマに定義されていないプロパティは許可されない" },
        { "id": "C", "text": "プロパティ数に上限がない" },
        { "id": "D", "text": "必須プロパティが存在しなくてよい" }
      ],
      "correctAnswer": "B",
      "explanation": "`additionalProperties: false` は、スキーマに定義されていないプロパティをオブジェクトに含めることを禁止します。これにより、データの形式を厳密に管理できます。"
    }
  ]
}
```

---

## 3. メタデータ仕様

取り込み依頼時に以下の情報を提供してください。内容を元に管理者が `quizSets.json` に登録します。

### 3-1. フィールド定義

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|:---:|------|-----|
| `id` | string | ✅ | 一意の ID（kebab-case、英小文字・数字・ハイフンのみ） | `"typescript-basics"` |
| `name` | string | ✅ | クイズ一覧に表示される名前 | `"TypeScript 基礎"` |
| `description` | string | ✅ | 学習内容の概要（1〜500 文字、50〜200 文字推奨） | `"TypeScript の型システムと基本文法を学ぶクイズです"` |
| `category` | string | ✅ | カテゴリ名 | `"TypeScript"`, `"GitHub"`, `"AWS"` |
| `icon` | string | ✅ | 絵文字アイコン 1 文字 | `"📘"`, `"🤖"`, `"☁️"` |
| `questionCount` | number | ✅ | 問題数（問題ファイルの実際の件数と一致させる） | `20` |
| `difficulty` | string | ✅ | 難易度（下記一覧から選択） | `"intermediate"` |
| `dataPath` | string | ✅ | 問題ファイルの保存場所（カテゴリ/ファイル名.json） | `"typescript/typescript-basics.json"` |
| `parentId` | string\|null | ✅ | シリーズ親の ID（単体なら `null`） | `null` |
| `group` | string\|null | ✅ | シリーズのグループ識別子（単体なら `null`） | `null` |
| `level` | number | ✅ | `1` = 単体またはシリーズ親、`2` = シリーズの子 | `1` |
| `order` | number | ✅ | グループ内の表示順（1 から始まる正の整数） | `1` |
| `estimatedLearningTime` | string | — | 推定学習時間（任意） | `"10〜15 分"` |
| `topics` | string[] | — | 学習トピック一覧（任意） | `["型注釈", "インターフェース", "ジェネリクス"]` |

### 3-2. difficulty の選択肢

| 値 | 対象 |
|----|------|
| `"beginner"` | 用語の定義・基本概念の確認 |
| `"intermediate"` | 設定・構成・エラー解決の理解 |
| `"advanced"` | システム全体の把握・複合的な分析 |
| `"beginner to intermediate"` | 初級〜中級の混在セット |
| `"beginner to advanced"` | 初級〜上級の幅広いセット |

### 3-3. メタデータ記述例（単体セット）

```json
{
  "id": "typescript-basics",
  "name": "TypeScript 基礎",
  "description": "TypeScript の型システム・インターフェース・ジェネリクスを中心に学ぶクイズです。JavaScript 経験者を対象としています。",
  "category": "TypeScript",
  "icon": "📘",
  "questionCount": 20,
  "difficulty": "beginner to intermediate",
  "dataPath": "typescript/typescript-basics.json",
  "parentId": null,
  "group": null,
  "level": 1,
  "order": 1
}
```

---

## 4. シリーズ（階層）構成

複数のステップに分かれるクイズシリーズを作成することができます。

### 4-1. 構成ルール

- **親エントリ（`level: 1`）:** シリーズ全体のラベルとして機能する。`dataPath` は `""` または `null` にする
- **子エントリ（`level: 2`）:** 実際の問題ファイルを持つ。`parentId` に親の `id` を指定する
- `group` フィールドで親・子を同一グループとして識別する（親・子で同じ値を設定）

### 4-2. シリーズのメタデータ例

```json
[
  {
    "id": "aws-solutions-architect",
    "name": "AWS ソリューションアーキテクト",
    "description": "AWS ソリューションアーキテクト試験対策シリーズ",
    "category": "AWS",
    "icon": "☁️",
    "questionCount": 0,
    "difficulty": "intermediate",
    "dataPath": "",
    "parentId": null,
    "group": "aws-solutions-architect",
    "level": 1,
    "order": 1
  },
  {
    "id": "aws-solutions-architect-step1",
    "name": "Step 1: IAM とセキュリティ",
    "description": "IAM ユーザー・ポリシー・ロールを中心にしたセキュリティの基礎",
    "category": "AWS",
    "icon": "☁️",
    "questionCount": 15,
    "difficulty": "beginner to intermediate",
    "dataPath": "aws/aws-solutions-architect-step1.json",
    "parentId": "aws-solutions-architect",
    "group": "aws-solutions-architect",
    "level": 2,
    "order": 1
  },
  {
    "id": "aws-solutions-architect-step2",
    "name": "Step 2: VPC とネットワーク",
    "description": "VPC・サブネット・セキュリティグループ・ルーティングの理解",
    "category": "AWS",
    "icon": "☁️",
    "questionCount": 20,
    "difficulty": "intermediate",
    "dataPath": "aws/aws-solutions-architect-step2.json",
    "parentId": "aws-solutions-architect",
    "group": "aws-solutions-architect",
    "level": 2,
    "order": 2
  }
]
```

---

## 5. 命名規則

| 対象 | ルール | 良い例 | 悪い例 |
|------|--------|--------|--------|
| クイズ ID | 英小文字・数字・ハイフンのみ（kebab-case） | `typescript-basics` | `TypeScriptBasics`, `typescript_basics` |
| ファイル名 | `<quiz-id>.json` | `typescript-basics.json` | `TypeScript Basics.json` |
| カテゴリフォルダ | 英小文字・ハイフン | `typescript/`, `github-copilot/` | `TypeScript/`, `GitHub Copilot/` |
| `options[].id` | 大文字アルファベット 1 文字 | `"A"`, `"B"`, `"C"`, `"D"` | `"a"`, `"1"`, `"Option1"` |

---

## 6. 難易度ガイドライン

| 難易度 | 推奨割合 | 問題のタイプ例 |
|--------|---------|---------------|
| beginner | 約 15% | 用語の定義（「〇〇とは何ですか？」）、基本コマンドの目的 |
| intermediate | 約 70% | 設定の意味・エラーの解決方法・動作の違いを問う問題 |
| advanced | 約 15% | システム全体の把握、複数概念の組み合わせ、トレードオフ分析 |

### 良い問題の条件

- 問題文が一意に解釈できる（曖昧さがない）
- 不正解選択肢が「それらしく見えるが誤り」である（識別力がある）
- 解説が「なぜ正解か」「なぜ他は誤りか」を具体的に説明している
- 1 問で 1 つの概念・事実を問う（複合問題は上級向けのみ）

---

## 7. バリデーション

リポジトリをクローンした環境では、以下のコマンドで仕様への適合を検証できます。

```bash
# メタデータの検証（quizSets.json 全体）
npm run validate:metadata

# 問題ファイルの検証（単一ファイル指定）
npm run validate:quiz -- public/data/<カテゴリ>/<quiz-id>.json
```

### JSON スキーマ

スキーマファイルは以下に公開されています（参照のみ）。

| スキーマ | パス | 用途 |
|---------|------|------|
| 問題オブジェクト | `public/schemas/question-schema.json` | 各問題の形式検証 |
| 問題ファイル全体 | `public/schemas/question-set-schema.json` | ファイル全体の形式検証 |
| メタデータ | `public/schemas/quizset-metadata-schema.json` | `quizSets.json` 各エントリの検証 |

---

## 8. 提出方法

### Option A: GitHub Pull Request（推奨）

1. リポジトリをフォーク: [https://github.com/duwenji/spa-quiz-app](https://github.com/duwenji/spa-quiz-app)
2. フォーク先で問題 JSON ファイルを `public/data/<カテゴリ>/` に追加する
3. Pull Request を作成し、本文にメタデータ情報（[3-1 節](#3-1-フィールド定義) の全フィールド）を記載する

### Option B: Issue での依頼

1. GitHub Issues で新規 Issue を作成する
2. 問題 JSON の内容とメタデータ情報を Issue に記載する
3. 管理者が取り込みを行う

### 提出チェックリスト

- [ ] ファイル名が kebab-case になっている（例: `my-quiz.json`）
- [ ] `id` が 1 から始まる連番になっている
- [ ] `options` が A / B / C / D の 4 つすべて含まれている
- [ ] `correctAnswer` が `options` のいずれかの `id` と一致している
- [ ] `explanation` が空でない
- [ ] `questionCount`（メタデータ）と問題ファイルの実際の問題数が一致している
- [ ] `description` が 50 文字以上 200 文字以内（推奨）
- [ ] ファイルが有効な JSON（構文エラーがない）
