# クイズサイト取り込みマニュアル

> **対象:** クイズコンテンツを新規作成・追加してサイトに反映させる方

> 📋 データ形式の詳細仕様は **[QUIZ-SPEC.md](QUIZ-SPEC.md)** を参照してください（開発環境なしで外部からコンテンツを提供する方向け）。

## 目次

1. [はじめに](#1-はじめに)
2. [環境セットアップ](#2-環境セットアップ)
3. [クイズデータの形式](#3-クイズデータの形式)
4. [クイズセットの作成手順](#4-クイズセットの作成手順)
5. [AI を使った問題生成](#5-ai-を使った問題生成)
6. [バリデーション](#6-バリデーション)
7. [デプロイ](#7-デプロイ)
8. [アーキテクチャ参考](#8-アーキテクチャ参考)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. はじめに

### 取り込みの全体フロー

```
① src/data/ に問題 JSON ファイルを作成
       ↓
② src/data/quizSets.json にメタデータを登録
       ↓
③ 必要に応じて sync-data / build を実行
       ↓
④ バリデーション実行
       ↓
⑤ npm run build && npm run deploy
  ↓
⑥ GitHub Pages に反映
```

### ファイルの配置ルール

| 用途 | 場所 |
|------|------|
| 問題 JSON のソース | `src/data/<カテゴリ>/<quiz-id>.json` |
| メタデータ一覧のソース | `src/data/quizSets.json` |
| 実行時に参照される公開データ | `public/data/` |
| JSON スキーマ | `public/schemas/` |

> このリポジトリでは **`src/data/` が編集元** です。`npm run build` 実行時に `npm run sync-data` が走り、`src/data/` の内容が `public/data/` にコピーされます。

---

## 2. 環境セットアップ

### 必要なもの

- Node.js v16 以上
- Git
- GitHub アカウント（デプロイする場合）

### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/duwenji/spa-quiz-app.git
cd spa-quiz-app

# パッケージをインストール
npm install

# 開発サーバーを起動（http://localhost:5173）
npm run dev
```

### 主要コマンド

| コマンド | 説明 | 環境 |
|----------|------|------|
| `npm run dev` | 開発サーバー起動（HMR 有効） | localhost:5173 |
| `npm run sync-data` | `src/data/` を `public/data/` にコピー | ローカル確認前 |
| `npm run build` | 本番ビルド → `dist/` を生成 | ローカル確認 |
| `npm run preview` | ビルド済み `dist/` を確認 | localhost:4173 |
| `npm run deploy` | ビルド + GitHub Pages へ公開 | 本番 |
| `npm run validate:metadata` | `quizSets.json` を検証 | 開発 |
| `npm run validate:quiz` | 設定済み glob に一致する問題 JSON を検証 | 開発 |

---

## 3. クイズデータの形式

### 3-1. 問題 JSON ファイル（`<quiz-id>.json`）

```json
{
  "questions": [
    {
      "id": 1,
      "question": "問題文をここに記述する",
      "options": [
        { "id": "A", "text": "選択肢A" },
        { "id": "B", "text": "選択肢B" },
        { "id": "C", "text": "選択肢C" },
        { "id": "D", "text": "選択肢D" }
      ],
      "correctAnswer": "A",
      "explanation": "解説文。なぜAが正解なのかを詳しく説明する。"
    },
    {
      "id": 2,
      "question": "問題文をここに記述する",
      "options": [
        { "id": "A", "text": "選択肢A" },
        { "id": "B", "text": "選択肢B" },
        { "id": "C", "text": "選択肢C" },
        { "id": "D", "text": "選択肢D" }
      ],
      "correctAnswer": "B",
      "explanation": "解説文。"
    }
  ]
}
```

#### フィールド仕様

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | number | ✅ | クイズ内で 1 から始まる連番 |
| `question` | string | ✅ | 問題文 |
| `options` | array | ✅ | 選択肢（A / B / C / D の 4 つ必須） |
| `options[].id` | string | ✅ | `"A"` / `"B"` / `"C"` / `"D"` のいずれか |
| `options[].text` | string | ✅ | 選択肢の本文 |
| `correctAnswer` | string | ✅ | 正解（`"A"` / `"B"` / `"C"` / `"D"`） |
| `explanation` | string | ✅ | 解説（空文字禁止） |

#### 問題作成チェックリスト

- [ ] `id` が 1 から始まる連番になっている
- [ ] `options` が A / B / C / D の 4 つすべてある
- [ ] `correctAnswer` が `options` のいずれかと一致している
- [ ] `explanation` が空でない
- [ ] すべての文字列フィールドが空でない

#### 難易度の目安

- **beginner（15%）:** 用語の定義、基本コマンドの目的
- **intermediate（70%）:** 設定内容の理解、エラー解決
- **advanced（15%）:** システム全体の把握、複合的な問題分析

---

### 3-2. メタデータ（`quizSets.json`）

`src/data/quizSets.json` に、問題 JSON ファイルの情報を登録します。

```json
[
  {
    "id": "my-new-quiz",
    "name": "新しいクイズセット",
    "description": "このクイズで学べる内容の概要を50〜200文字で記述します。",
    "category": "技術",
    "icon": "💡",
    "questionCount": 20,
    "difficulty": "intermediate",
    "dataPath": "my-category/my-new-quiz.json",
    "parentId": null,
    "group": null,
    "level": 1,
    "order": 1
  }
]
```

#### メタデータフィールド仕様

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✅ | 一意の ID（kebab-case）例: `"github-copilot-variables"` |
| `name` | string | ✅ | クイズ一覧に表示される名前 |
| `description` | string | ✅ | 学習内容の概要（50〜200 文字） |
| `category` | string | ✅ | カテゴリ名（例: `"GitHub"`, `"アーキテクチャ"`, `"技術"`） |
| `icon` | string | ✅ | 絵文字アイコン（例: `"🤖"`, `"💻"`, `"📚"`） |
| `questionCount` | number | ✅ | 問題数（問題 JSON の実際の件数と一致させる） |
| `difficulty` | string | ✅ | `"beginner"` / `"intermediate"` / `"advanced"` / `"beginner to intermediate"` / `"beginner to advanced"` |
| `dataPath` | string | ✅ | 実行時の `public/data/` からの相対パス。ソースは `src/data/` 側で管理する（例: `"github-copilot/variables.json"`） |
| `parentId` | string\|null | ✅ | 親クイズの ID（階層構造を持つ場合）/ 単体なら `null` |
| `group` | string\|null | ✅ | シリーズのグループ識別子 / 単体なら `null` |
| `level` | number | ✅ | `1` = 単体またはシリーズ親, `2` = シリーズの子 |
| `order` | number | ✅ | グループ内の表示順 |

#### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| クイズ ID | kebab-case（小文字・ハイフン） | `github-copilot-variables` |
| JSON ファイル名 | kebab-case.json | `github-copilot-variables.json` |
| フォルダ名 | 小文字・ハイフン | `github-copilot/` |

---

### 3-3. 階層構造（シリーズ形式）

複数ステップからなるシリーズを作る場合：

```json
[
  {
    "id": "my-series",
    "name": "My Series（全体）",
    "description": "シリーズ全体の概要",
    "category": "技術",
    "icon": "📚",
    "questionCount": 0,
    "difficulty": "intermediate",
    "dataPath": "",
    "parentId": null,
    "group": "my-series",
    "level": 1,
    "order": 1
  },
  {
    "id": "my-series-step1",
    "name": "Step 1: 入門",
    "description": "Step 1 の概要",
    "category": "技術",
    "icon": "📚",
    "questionCount": 15,
    "difficulty": "beginner",
    "dataPath": "my-category/my-series-step1.json",
    "parentId": "my-series",
    "group": "my-series",
    "level": 2,
    "order": 1
  },
  {
    "id": "my-series-step2",
    "name": "Step 2: 応用",
    "description": "Step 2 の概要",
    "category": "技術",
    "icon": "📚",
    "questionCount": 20,
    "difficulty": "intermediate",
    "dataPath": "my-category/my-series-step2.json",
    "parentId": "my-series",
    "group": "my-series",
    "level": 2,
    "order": 2
  }
]
```

---

## 4. クイズセットの作成手順

### Step 1: 問題 JSON ファイルを作成する

1. `src/data/<カテゴリフォルダ>/` を作成する（フォルダがなければ）
2. `<quiz-id>.json` を作成し、[フォーマット](#3-1-問題-json-ファイルquiz-idjson) に従って問題を記述する

```
src/
  data/
    my-category/           ← 新規フォルダ（必要に応じて）
      my-new-quiz.json     ← 新規ファイル
```

### Step 2: quizSets.json にメタデータを追加する

`src/data/quizSets.json` を編集し、既存の配列末尾に新しいエントリを追加します。

```json
{
  "id": "my-new-quiz",
  "name": "クイズのタイトル",
  "description": "学習内容の概要（50〜200文字）",
  "category": "技術",
  "icon": "💡",
  "questionCount": 20,
  "difficulty": "intermediate",
  "dataPath": "my-category/my-new-quiz.json",
  "parentId": null,
  "group": null,
  "level": 1,
  "order": 1
}
```

### Step 3: バリデーションを実行する

```bash
# メタデータの検証
npm run validate:metadata

# 公開データを更新
npm run sync-data

# 問題 JSON の検証（単一ファイル指定）
npm run validate:quiz -- src/data/my-category/my-new-quiz.json

# 設定ファイルの questionGlobs に一致するファイルをまとめて検証
npm run validate:quiz
```

複数ファイルをまとめて検証対象に含めるには、`.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` を更新してください。

エラーが出た場合は [バリデーション](#6-バリデーション) セクションを参照してください。

### Step 4: ローカルで動作確認する

```bash
npm run sync-data
npm run dev
```

`http://localhost:5173` を開き、追加したクイズが一覧に表示されることを確認します。

### Step 5: デプロイする

動作確認後、[デプロイ](#7-デプロイ) セクションの手順に従ってデプロイします。

---

## 5. AI を使った問題生成

GitHub Copilot などの AI アシスタントを使うと、ドキュメントや教材から効率的に問題を生成できます。

### プロンプト例

以下のプロンプトをコピーして Copilot Chat に貼り付けてください。

```
以下のドキュメントをもとに、クイズ問題を20問作成してください。

# 形式
- JSON形式（questions 配列）
- 各問題に id（連番）、question、4択の options（A/B/C/D）、correctAnswer、explanation を含める
- 難易度: beginner 15%、intermediate 70%、advanced 15%
- 解説は詳しく（なぜその選択肢が正答か）

# 対象ドキュメント
（ここにドキュメントの内容を貼り付ける）
```

### 生成した問題の品質チェックポイント

- [ ] 問題文が明確で曖昧さがない
- [ ] 不正解選択肢もそれぞれ意味のある内容になっている
- [ ] 正解が `options` 内の ID と一致している
- [ ] 解説がドキュメントの内容を正確に反映している
- [ ] `id` が 1 からの連番になっている

---

## 6. バリデーション

### メタデータの検証

```bash
npm run validate:metadata
```

`src/data/quizSets.json` を JSON スキーマ（`public/schemas/quizset-metadata-schema.json`）で検証します。

### 問題 JSON の検証

```bash
# 特定ファイルを検証
npm run validate:quiz -- src/data/my-category/my-new-quiz.json

# 設定ファイルの questionGlobs に一致する問題ファイルを検証
npm run validate:quiz
```

複数ファイルを一括検証したい場合は、`.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` を更新してください。

### 主なエラーメッセージと対処法

| エラー | 原因 | 対処 |
|--------|------|------|
| `"id" is required` | id フィールドが未設定 | メタデータに id を追加 |
| `"options" must have 4 items` | 選択肢が 4 つない | A/B/C/D をすべて追加 |
| `"correctAnswer" must be one of A, B, C, D` | correctAnswer の値が不正 | 大文字のA/B/C/Dに修正 |
| `"questionCount" does not match actual count` | 問題数と questionCount が不一致 | quizSets.json の questionCount を修正 |
| `"description" must be 50-200 characters` | 説明文が短すぎる or 長すぎる | 文字数を調整 |

---

## 7. デプロイ

### 前提条件

- GitHub リポジトリへのプッシュ権限があること
- GitHub Pages の設定で `gh-pages` ブランチが選択されていること  
  （`Settings > Pages > Branch: gh-pages`）

### デプロイ手順

```bash
# 1. ローカルでビルドして確認
npm run build
npm run preview   # http://localhost:4173 で本番相当の動作を確認

# 2. GitHub Pages にデプロイ
npm run deploy
```

`Published` と表示されれば成功です。

### デプロイ後の確認

URL にアクセスして追加したクイズが表示されることを確認します。

```
https://duwenji.github.io/spa-quiz-app/
```

> **反映タイミング:** デプロイ後、GitHub Pages への反映には数分かかることがあります。

### vite.config.ts の base 設定

本番と開発でパスが異なる設定が自動的に適用されます。手動変更は不要です。

```ts
// vite.config.ts（参考）
base: process.env.NODE_ENV === 'production' ? '/spa-quiz-app/' : '/'
```

---

## 8. アーキテクチャ参考

### データの流れ

```
src/data/index.ts
  └─ getAllQuizSets()      ← src/data/quizSets.json を読み込む
  └─ getQuizSetQuestions() ← quizSet.dataPath を fetch して問題配列を返す

src/data/
  quizSets.json            ← 編集元のメタデータ一覧
  github-copilot/
    github-copilot-variables.json
  clean-architecture/
    step1-foundation.json
    ...

build / sync-data 実行後
public/data/
  ...                      ← 実行時に fetch される公開データ
```

### ビルド出力と GitHub Pages

```
npm run build
  └─ dist/
       index.html
       assets/          ← JS / CSS バンドル
       data/            ← public/data/ がそのままコピーされる
       schemas/         ← public/schemas/ がそのままコピーされる
```

`dist/` の内容が `gh-pages` ブランチにプッシュされ、GitHub Pages がホストします。

---

## 9. トラブルシューティング

### ビルドエラー

#### `Property 'env' does not exist on type 'ImportMeta'`

`tsconfig.json` に以下を追加してください。

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

#### `Module not found: src/data/`

`public/data/` が存在しない場合に発生します。PowerShell で以下を実行して作成してください。

```powershell
Copy-Item -Recurse src/data/ public/data/
```

---

### デプロイエラー

#### `npm run deploy` が失敗する

以下を確認してください。

1. `gh-pages` パッケージがインストールされているか  
   ```bash
   npm install gh-pages --save-dev
   ```
2. Git のユーザー設定がされているか  
   ```bash
   git config --global user.email "you@example.com"
   git config --global user.name "Your Name"
   ```
3. GitHub 認証が完了しているか（SSH キーまたは Personal Access Token）

#### GitHub Pages に古いバージョンが表示される

- ブラウザキャッシュをクリア（`Ctrl+Shift+Delete`）してから再確認
- GitHub リポジトリの `gh-pages` ブランチのコミット日時を確認
- それでも解消しない場合は再度 `npm run deploy` を実行

---

### データが表示されない

#### 「データが見つかりません」エラー

1. `public/data/` に問題 JSON ファイルが存在するか確認する
2. `quizSets.json` の `dataPath` が実際のファイルパスと一致しているか確認する
3. 開発サーバーのブラウザコンソール（F12）でネットワークエラーを確認する

#### ローカル開発中に 404 エラーが出る

`public/` フォルダと `public/data/` サブフォルダが存在することを確認してください。

```bash
# フォルダ構成を確認
Get-ChildItem public/data/ -Recurse
```
