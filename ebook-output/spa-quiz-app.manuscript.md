# React SPA 選択問題アプリ {#cover-00-cover}

**学習用クイズアプリ実践ガイド**

TypeScript + React + Tailwind CSS を用いた学習用クイズ SPA の実装と運用を、
UI・状態管理・学習体験の設計観点から学べるガイドです。

> 💡 ブラウザで https://duwenji.github.io/spa-quiz-app/ を開くと、実際のクイズ UI と学習フローをそのまま体験できます。

- 著者: 杜 文吉
- 対象: フロントエンド学習者 / React 開発者 / 教材作成者
- テーマ: React / TypeScript / Tailwind CSS / quiz UX

**このガイドで学べること**
- カテゴリ別クイズ UI の設計と実装
- 回答履歴・進捗・分析データの扱い方
- ダウンロード / AI 分析連携の設計パターン
- Vite ベースの SPA 構成とビルド運用

**🚀 機能**

**基本機能**
- **複数カテゴリのクイズセット**: GitHub Copilot / アーキテクチャ / 技術分野を横断して学習可能
- **問題表示画面**: 進捗表示、プログレスバー、見やすい問題テキスト
- **4択選択肢**: A/B/C/D の4つのボタン
- **結果表示**: ✓/✗ アイコン、正誤判定、詳細な解説

**クイズセット選択画面**
- **カテゴリ別グループ化**: GitHub Copilot、アーキテクチャ、技術などのカテゴリで整理
- **シリーズ表示**: `GitHub Copilot Agent & Skills 総合シリーズ` や `GitHub Copilot 実務ワークフローシリーズ`、クリーンアーキテクチャなどをグループ化
- **階層表示**: 親セット（完全ガイド）と子セット（STEP 1-5）の親子関係を視覚的に表示
- **パンくずリスト**: 各クイズセットで親階層への経路を表示（例：`GitHub › クリーンアーキテクチャ完全ガイド`）
- **視覚的な強調**: グループ内のセットを背景色やボーダーで視覚的に囲む
- **段階的学習**: 関連するセットを一覧で表示し、無理のない学習フローを促進

**ナビゲーション**
- **前へ/次へボタン**: 問題間の移動
- **問題番号ボタン**: 1-30の任意の問題への直接ジャンプ
   - 正解は緑、不正解は赤、未回答はグレーでハイライト

**学習履歴追跡**
- **自動記録**: 各問題の回答日時、選択答、正誤、所要時間を自動記録
- **ローカルストレージ保存**: ブラウザのlocalStorageに自動保存（ページ更新後も保持）
- **統計表示**:
  - 正解数/全問題数（正解率 %）
  - 平均解答時間
  - 最初の回答日時と最後の回答日時

**ダウンロード・エクスポート**
- **JSON形式**: 学習データをJSON形式でダウンロード（AI分析に最適）
- **CSV形式**: 各回答を1行で表現、Excel/Google Sheets で開閉可能
- **ファイル名**: `learning-history-${timestamp}.json` / `.csv`

**AI分析連携**
- **Copilot Chat統合**: ダウンロードしたデータをCopilot Chatに入力して分析
- **プロンプトコピー**: ワンクリックでAI分析用プロンプトをコピー
- **分析項目**:
  - 成績サマリー（正解率、分野別成績）
  - 苦手分野の特定
  - 解答時間の傾向分析
  - 改善提案

**リセット機能**
- **確認ダイアログ付き**: 誤削除防止
- **全履歴クリア**: localStorageから対象キーを削除

**🛠️ 技術スタック**

| 項目 | 選択 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| パッケージマネージャー | npm |
| Node.js | 16.x 以上 |

**📦 インストール**

```bash
# リポジトリをクローン
git clone <repository-url>
cd spa-quiz-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

開発サーバーは通常 `http://localhost:5173` で利用可能です。

**Quiz Generator 検証フロー**

`quiz-generator` は shared skill 化され、consumer 側は local wrapper から呼び出します。

- wrapper: `.github/skills-config/quiz-generator/invoke-validate.ps1`
- config: `.github/skills-config/quiz-generator/quiz-generator.config.json`

実行コマンド:

```bash
npm run validate:metadata
npm run validate:quiz
npm run validate:all
```

shared skill は以下の順で探索されます。

1. `.github/skills/shared-copilot-skills/quiz-generator`
2. `.github/skills/quiz-generator`
3. `../shared-copilot-skills/quiz-generator`（ローカル開発用フォールバック）

**Ebook Build フロー**

`ebook-build` は shared skill を利用し、`docs/` のMarkdown群からebookを生成します。

- wrapper: `.github/skills-config/ebook-build/invoke-build.ps1`
- config: `.github/skills-config/ebook-build/spa-quiz-app.build.json`
- metadata: `.github/skills-config/ebook-build/spa-quiz-app.metadata.yaml`

実行コマンド:

```bash
npm run build:ebook
```

wrapper は以下の順で shared skill を探索します。

1. `.github/skills/shared-copilot-skills/ebook-build`
2. `.github/skills/ebook-build`
3. `../shared-copilot-skills/ebook-build`

**今後対応する課題**

- 現在の `docs/` 配下は ebook-build が期待する章構造に未対応です。
- 不足している要素は `00-COVER.md` 相当の表紙原稿、番号付きの章ディレクトリ、章内の番号付き Markdown ファイルです。
- skill 連携自体は追加済みですが、ebook 生成は原稿構造の整備後に正式運用します。
- この対応は今後のタスクとして扱い、本 README では課題として明示します。

**🌐 GitHub Pagesへのデプロイ**

このSPAはGitHub Pagesでホストできます。以下の設定が含まれています：

**自動デプロイ（推奨）**
1. リポジトリのSettings → Pagesに移動
2. 「Build and deployment」で「GitHub Actions」を選択
3. プッシュ時に自動的にデプロイされます

**手動デプロイ**
```bash
# 依存関係をインストール（初回のみ）
npm install

# gh-pagesパッケージをインストール
npm install --save-dev gh-pages

# ビルドとデプロイ
npm run deploy
```

**SPAの404エラー対策**
GitHub Pagesは静的サイトホスティングのため、SPAのリロード時に404エラーが発生します。この問題を解決するために以下の対策を実装しています：

1. **404.htmlファイル**: すべてのリクエストをindex.htmlにリダイレクト
2. **Viteのbase設定**: `/spa-quiz-app/` に設定
3. **GitHub Actionsワークフロー**: 自動ビルドとデプロイ

**カスタムドメインを使用する場合**
カスタムドメインを使用する場合は、`vite.config.ts`の`base`設定を`/`に変更してください：
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/', // カスタムドメイン用
})
```

**アクセスURL**
- GitHub Pages: `https://<username>.github.io/spa-quiz-app/`
- カスタムドメイン: 設定したドメイン

**📁 プロジェクト構造**

```
spa-quiz-app/
├── src/
│   ├── components/
│   │   ├── QuestionCard.tsx        # 問題表示
│   │   ├── OptionButton.tsx        # 選択肢ボタン
│   │   ├── ResultFeedback.tsx      # 結果表示
│   │   ├── ProgressBar.tsx         # 進捗バー
│   │   ├── NavigationButtons.tsx   # 前へ/次へ
│   │   ├── QuestionNavigation.tsx  # 問題番号ボタン
│   │   ├── ActivityDownload.tsx    # ダウンロード・統計表示
│   │   └── QuizSetSelector.tsx     # クイズセット選択
│   ├── data/
│   │   ├── index.ts                # データ読み込みロジック
│   │   ├── quizSets.json           # クイズセットメタデータ
│   │   ├── github-copilot/         # GitHub Copilotクイズセット
│   │   │   └── questions.json
│   │   └── template/               # テンプレート（参考用）
│   │       └── questions.json
│   ├── types/
│   │   └── index.ts                # 型定義
│   ├── hooks/
│   │   └── useQuiz.ts              # ロジック＆履歴管理
│   ├── utils/
│   │   ├── downloadHistory.ts      # JSON/CSV出力関数
│   │   └── storageManager.ts       # localStorage管理
│   ├── App.tsx                     # メインコンポーネント
│   ├── App.css                     # Tailwindスタイル
│   └── main.tsx                    # エントリーポイント
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

**🎯 使い方**

**クイズに挑戦**

1. **スタート**: トップページのボタンをクリック
2. **問題を読む**: 大きく表示された問題テキストを確認
3. **選択肢を選ぶ**: A/B/C/D のボタンをクリック
4. **確認を押す**: 確認ボタンで回答を確定
5. **解説を読む**: 正誤判定と詳細な解説を確認
6. **次へ進む**: 「次へ」ボタンで次の問題へ

**学習データを分析**

**Step 1: 学習データのダウンロード**
1. 複数問題を解いて履歴を記録
2. 「JSON形式でダウンロード」ボタンをクリック
3. `learning-history-*.json` ファイルを取得

**Step 2: Copilot Chat への入力**
1. VS Code で Copilot Chat を開く（Ctrl+Shift+I）
2. 「AI分析用プロンプトをコピー」ボタンをクリック
3. Copilot Chat にペーストして実行

**Step 3: 改善実施**
- 分析結果に基づいて弱点分野を重点的に復習
- データを再ダウンロードして継続的に進捗を追跡
- 改善前後の成績比較

**データをエクスポート**

- **JSON形式**: 完全な構造化データ、AI分析に最適
- **CSV形式**: スプレッドシートソフトで開閉可能

**📊 学習データ構造**

**JSON形式**

```json
{
  "sessionId": "session-1234567890",
  "startedAt": "2024-02-22T10:30:00Z",
  "completedAt": "2024-02-22T11:45:00Z",
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true,
      "answerTime": 5000,
      "answeredAt": "2024-02-22T10:30:05Z"
    }
  ],
  "totalCorrect": 28,
  "totalWrong": 2,
  "averageAnswerTime": 4500,
  "sessionDuration": 4500000
}
```

**CSV 形式**

| 問題ID | 選択答 | 正解 | 正誤 | 解答時間(ms) | 回答日時 |
|--------|--------|------|------|--------------|---------|
| 1 | A | A | 正解 | 5000 | 2024-02-22T10:30:05Z |
| 2 | B | C | 不正解 | 8000 | 2024-02-22T10:30:13Z |

**⚙️ カスタマイズ**

**クイズセットの追加方法**

新しいクイズセットを追加するには、以下の手順に従ってください：

**1. ディレクトリ構造の作成**
```
src/data/
├── your-topic-name/          # 新しいクイズセットのディレクトリ
│   └── questions.json        # 質問データ
├── template/                 # テンプレート（参考用）
│   └── questions.json
├── quizSets.json             # クイズセットメタデータ
└── index.ts                  # データ読み込みロジック
```

**2. 質問データの作成**
`src/data/your-topic-name/questions.json` を作成します。テンプレートをコピーして編集：
```bash
cp src/data/template/questions.json src/data/your-topic-name/questions.json
```

**3. クイズセットメタデータの追加**
`src/data/quizSets.json` に新しいエントリを追加：
```json
{
  "id": "your-topic-id",
  "name": "クイズセット名",
  "description": "クイズセットの説明",
  "category": "カテゴリ",
  "icon": "🎯",
  "questionCount": 10,
  "difficulty": "beginner",  // "beginner", "intermediate", "advanced", "beginner to intermediate" のいずれか
  "dataPath": "your-topic-name/questions.json",
  "parentId": null,           // 親セットのID（シリーズの場合は親を指定）
  "group": null,              // グループ名（同じグループ内でセットをまとめる）
  "level": 1,                 // 1=最上位/親, 2=子セット
  "order": 1                  // グループ内での表示順序
}
```

**階層構造の設定方法**

**【基本的なセット】** (グループなし)
```json
{
  "id": "github-copilot-variables",
  "parentId": null,
  "group": null,
  "level": 1,
  "order": 1
}
```

**【シリーズ親セット】** (複数の子セットの親)
```json
{
  "id": "clean-architecture",
  "name": "クリーンアーキテクチャ完全ガイド",
  "parentId": null,
  "group": "clean-architecture-series",
  "level": 1,
  "order": 1
}
```

**【シリーズ子セット】** (STEP 1, 2, 3...)
```json
{
  "id": "clean-architecture-step1",
  "name": "クリーンアーキテクチャ STEP 1: 理論基盤",
  "parentId": "clean-architecture",  // 親セットのID
  "group": "clean-architecture-series",
  "level": 2,
  "order": 2  // 親の後に出現
}
```

**フィールド説明**
- `parentId`: 親セットのID。シリーズの場合のみ設定。null はトップレベル
- `group`: グループ識別名。同じグループのセットは一緒に表示される
- `level`: 1=親/最上位、2=子セット
- `order`: グループ内での表示順序。昇順でソートされる
開発サーバーを再起動すると、新しいクイズセットが自動的に認識されます。

**既存のクイズセットの編集**

`src/data/github-copilot/questions.json` を編集して問題を追加または変更できます：

```json
{
  "id": 31,
  "question": "新しい問題文",
  "options": [
    { "id": "A", "text": "選択肢A" },
    { "id": "B", "text": "選択肢B" },
    { "id": "C", "text": "選択肢C" },
    { "id": "D", "text": "選択肢D" }
  ],
  "correctAnswer": "A",
  "explanation": "解説テキスト"
}
```

**スタイルのカスタマイズ**

Tailwind CSSのクラスを修正、または `tailwind.config.js` で色や間隔をカスタマイズ：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // カスタムカラー
      },
    },
  },
};
```

**📝 TypeScript型定義**

完全な型安全性を提供：

```typescript
export interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface LearningHistory {
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  answers: QuestionAnswer[];
  totalCorrect: number;
  totalWrong: number;
  averageAnswerTime: number;
  sessionDuration: number;
}
```

**🔒 プライバシー・データ保護**

- ✅ すべてのデータはブラウザのlocalStorageに保存
- ✅ サーバーにはデータを送信しない
- ✅ 個人情報の収集なし
- ⚠️ ブラウザのキャッシュクリア時にデータが削除される

**🐛 既知の問題・限界**

- localStorageの容量制限（通常5-10MB）により、大量の履歴が保存されている場合は古いデータが削除される可能性あり
- ブラウザのシークレットモード使用時は、セッション終了時にデータが削除される

**📚 学習リソース**

- [GitHub Copilot 導入フレームワーク](https://github.com/your-repo/adoption-framework)
- [React 公式ドキュメント](https://react.dev)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com)

**📄 ライセンス**

MIT License

**🤝 貢献**

バグ報告や機能提案は、Issue を作成してください。

**📧 サポート**

質問や問題がある場合は、GitHubのIssueセクションから連絡してください。

---

**Happy Learning! 🚀**

# SPA Quiz App — ドキュメント {#chapter-docs}

## クイズサイト取り込みマニュアル {#section-docs-quiz-creator}


> **対象:** クイズコンテンツを新規作成・追加してサイトに反映させる方

> 📋 データ形式の詳細仕様は **[QUIZ-SPEC.md](#section-docs-quiz-spec)** を参照してください（開発環境なしで外部からコンテンツを提供する方向け）。

### 目次

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

### 1. はじめに

#### 取り込みの全体フロー

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

#### ファイルの配置ルール

| 用途 | 場所 |
|------|------|
| 問題 JSON のソース | `src/data/<カテゴリ>/<quiz-id>.json` |
| メタデータ一覧のソース | `src/data/quizSets.json` |
| 実行時に参照される公開データ | `public/data/` |
| JSON スキーマ | `public/schemas/` |

> このリポジトリでは **`src/data/` が編集元** です。`npm run build` 実行時に `npm run sync-data` が走り、`src/data/` の内容が `public/data/` にコピーされます。

---

### 2. 環境セットアップ

#### 必要なもの

- Node.js v16 以上
- Git
- GitHub アカウント（デプロイする場合）

#### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/duwenji/spa-quiz-app.git
cd spa-quiz-app

# パッケージをインストール
npm install

# 開発サーバーを起動（http://localhost:5173）
npm run dev
```

#### 主要コマンド

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

### 3. クイズデータの形式

#### 3-1. 問題 JSON ファイル（`<quiz-id>.json`）

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

##### フィールド仕様

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | number | ✅ | クイズ内で 1 から始まる連番 |
| `question` | string | ✅ | 問題文 |
| `options` | array | ✅ | 選択肢（A / B / C / D の 4 つ必須） |
| `options[].id` | string | ✅ | `"A"` / `"B"` / `"C"` / `"D"` のいずれか |
| `options[].text` | string | ✅ | 選択肢の本文 |
| `correctAnswer` | string | ✅ | 正解（`"A"` / `"B"` / `"C"` / `"D"`） |
| `explanation` | string | ✅ | 解説（空文字禁止） |

##### 問題作成チェックリスト

- [ ] `id` が 1 から始まる連番になっている
- [ ] `options` が A / B / C / D の 4 つすべてある
- [ ] `correctAnswer` が `options` のいずれかと一致している
- [ ] `explanation` が空でない
- [ ] すべての文字列フィールドが空でない

##### 難易度の目安

- **beginner（15%）:** 用語の定義、基本コマンドの目的
- **intermediate（70%）:** 設定内容の理解、エラー解決
- **advanced（15%）:** システム全体の把握、複合的な問題分析

---

#### 3-2. メタデータ（`quizSets.json`）

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

##### メタデータフィールド仕様

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

##### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| クイズ ID | kebab-case（小文字・ハイフン） | `github-copilot-variables` |
| JSON ファイル名 | kebab-case.json | `github-copilot-variables.json` |
| フォルダ名 | 小文字・ハイフン | `github-copilot/` |

---

#### 3-3. 階層構造（シリーズ形式）

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

### 4. クイズセットの作成手順

#### Step 1: 問題 JSON ファイルを作成する

1. `src/data/<カテゴリフォルダ>/` を作成する（フォルダがなければ）
2. `<quiz-id>.json` を作成し、[フォーマット](#3-1-問題-json-ファイルquiz-idjson) に従って問題を記述する

```
src/
  data/
    my-category/           ← 新規フォルダ（必要に応じて）
      my-new-quiz.json     ← 新規ファイル
```

#### Step 2: quizSets.json にメタデータを追加する

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

#### Step 3: バリデーションを実行する

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

#### Step 4: ローカルで動作確認する

```bash
npm run sync-data
npm run dev
```

`http://localhost:5173` を開き、追加したクイズが一覧に表示されることを確認します。

#### Step 5: デプロイする

動作確認後、[デプロイ](#7-デプロイ) セクションの手順に従ってデプロイします。

---

### 5. AI を使った問題生成

GitHub Copilot などの AI アシスタントを使うと、ドキュメントや教材から効率的に問題を生成できます。

#### プロンプト例

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

#### 生成した問題の品質チェックポイント

- [ ] 問題文が明確で曖昧さがない
- [ ] 不正解選択肢もそれぞれ意味のある内容になっている
- [ ] 正解が `options` 内の ID と一致している
- [ ] 解説がドキュメントの内容を正確に反映している
- [ ] `id` が 1 からの連番になっている

---

### 6. バリデーション

#### メタデータの検証

```bash
npm run validate:metadata
```

`src/data/quizSets.json` を JSON スキーマ（`public/schemas/quizset-metadata-schema.json`）で検証します。

#### 問題 JSON の検証

```bash
# 特定ファイルを検証
npm run validate:quiz -- src/data/my-category/my-new-quiz.json

# 設定ファイルの questionGlobs に一致する問題ファイルを検証
npm run validate:quiz
```

複数ファイルを一括検証したい場合は、`.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` を更新してください。

#### 主なエラーメッセージと対処法

| エラー | 原因 | 対処 |
|--------|------|------|
| `"id" is required` | id フィールドが未設定 | メタデータに id を追加 |
| `"options" must have 4 items` | 選択肢が 4 つない | A/B/C/D をすべて追加 |
| `"correctAnswer" must be one of A, B, C, D` | correctAnswer の値が不正 | 大文字のA/B/C/Dに修正 |
| `"questionCount" does not match actual count` | 問題数と questionCount が不一致 | quizSets.json の questionCount を修正 |
| `"description" must be 50-200 characters` | 説明文が短すぎる or 長すぎる | 文字数を調整 |

---

### 7. デプロイ

#### 前提条件

- GitHub リポジトリへのプッシュ権限があること
- GitHub Pages の設定で `gh-pages` ブランチが選択されていること  
  （`Settings > Pages > Branch: gh-pages`）

#### デプロイ手順

```bash
# 1. ローカルでビルドして確認
npm run build
npm run preview   # http://localhost:4173 で本番相当の動作を確認

# 2. GitHub Pages にデプロイ
npm run deploy
```

`Published` と表示されれば成功です。

#### デプロイ後の確認

URL にアクセスして追加したクイズが表示されることを確認します。

```
https://duwenji.github.io/spa-quiz-app/
```

> **反映タイミング:** デプロイ後、GitHub Pages への反映には数分かかることがあります。

#### vite.config.ts の base 設定

本番と開発でパスが異なる設定が自動的に適用されます。手動変更は不要です。

```ts
// vite.config.ts（参考）
base: process.env.NODE_ENV === 'production' ? '/spa-quiz-app/' : '/'
```

---

### 8. アーキテクチャ参考

#### データの流れ

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

#### ビルド出力と GitHub Pages

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

### 9. トラブルシューティング

#### ビルドエラー

##### `Property 'env' does not exist on type 'ImportMeta'`

`tsconfig.json` に以下を追加してください。

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

##### `Module not found: src/data/`

`public/data/` が存在しない場合に発生します。PowerShell で以下を実行して作成してください。

```powershell
Copy-Item -Recurse src/data/ public/data/
```

---

#### デプロイエラー

##### `npm run deploy` が失敗する

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

##### GitHub Pages に古いバージョンが表示される

- ブラウザキャッシュをクリア（`Ctrl+Shift+Delete`）してから再確認
- GitHub リポジトリの `gh-pages` ブランチのコミット日時を確認
- それでも解消しない場合は再度 `npm run deploy` を実行

---

#### データが表示されない

##### 「データが見つかりません」エラー

1. `public/data/` に問題 JSON ファイルが存在するか確認する
2. `quizSets.json` の `dataPath` が実際のファイルパスと一致しているか確認する
3. 開発サーバーのブラウザコンソール（F12）でネットワークエラーを確認する

##### ローカル開発中に 404 エラーが出る

`public/` フォルダと `public/data/` サブフォルダが存在することを確認してください。

```bash
# フォルダ構成を確認
Get-ChildItem public/data/ -Recurse
```

## クイズデータ仕様書 {#section-docs-quiz-spec}


> **対象:** 外部からクイズコンテンツを提供・取り込む方

本ドキュメントは、spa-quiz-app に取り込む**クイズデータの形式仕様**を定義します。  
開発環境がなくても、本仕様に従ったファイルを作成すれば取り込みを依頼できます。

### 目次

1. [ファイル構成](#1-ファイル構成)
2. [問題ファイル仕様](#2-問題ファイル仕様)
3. [メタデータ仕様](#3-メタデータ仕様)
4. [シリーズ（階層）構成](#4-シリーズ階層構成)
5. [命名規則](#5-命名規則)
6. [難易度ガイドライン](#6-難易度ガイドライン)
7. [バリデーション](#7-バリデーション)
8. [提出方法](#8-提出方法)

---

### 1. ファイル構成

外部から提供していただくファイルは **2種類** です。

| ファイル | 説明 |
|---|---|
| `<quiz-id>.json` | 問題データ（問題・選択肢・正解・解説） |
| メタデータ情報 | クイズの名前・カテゴリ・難易度など |

メタデータは提出時に情報として記載いただければ、管理者側で `quizSets.json` に登録します。

> リポジトリ内では、管理者が `src/data/` を編集元として管理し、ビルド時に `public/data/` へコピーします。外部提供者は **JSON ファイル本体とメタデータ情報** を提出すれば十分です。

#### 配置イメージ

```
提出物
  <quiz-id>.json                        ← 提供いただくファイル
  メタデータ情報                        ← Issue / PR 本文などで提出

管理者側の配置
  src/data/<カテゴリ>/<quiz-id>.json    ← 編集元
  src/data/quizSets.json                ← 管理者が更新
```

**カテゴリ例:** `github-copilot/`, `clean-architecture/`, `typescript/`, `aws/`

---

### 2. 問題ファイル仕様

#### 2-1. ファイル全体の構造

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

#### 2-2. 問題オブジェクト仕様

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

##### フィールド定義

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|-----|:---:|------|------|
| `id` | number | ✅ | 1 以上の整数、クイズ内連番 | 問題の番号（1, 2, 3…） |
| `question` | string | ✅ | 空文字禁止 | 問題文 |
| `options` | array | ✅ | 必ず 4 要素（A/B/C/D 全て） | 選択肢の配列 |
| `options[].id` | string | ✅ | `"A"`, `"B"`, `"C"`, `"D"` のいずれか | 選択肢の識別子 |
| `options[].text` | string | ✅ | 空文字禁止 | 選択肢の本文 |
| `correctAnswer` | string | ✅ | `"A"`, `"B"`, `"C"`, `"D"` のいずれか | 正解の選択肢 ID |
| `explanation` | string | ✅ | 空文字禁止 | 正解の解説 |

> ⚠️ 各選択肢オブジェクトに指定できるプロパティは `id` と `text` のみです。追加プロパティは許可されません。

---

#### 2-3. 完全な記述例

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

### 3. メタデータ仕様

取り込み依頼時に以下の情報を提供してください。内容を元に管理者が `quizSets.json` に登録します。

#### 3-1. フィールド定義

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|:---:|------|-----|
| `id` | string | ✅ | 一意の ID（kebab-case、英小文字・数字・ハイフンのみ） | `"typescript-basics"` |
| `name` | string | ✅ | クイズ一覧に表示される名前 | `"TypeScript 基礎"` |
| `description` | string | ✅ | 学習内容の概要（1〜500 文字、50〜200 文字推奨） | `"TypeScript の型システムと基本文法を学ぶクイズです"` |
| `category` | string | ✅ | カテゴリ名 | `"TypeScript"`, `"GitHub"`, `"AWS"` |
| `icon` | string | ✅ | 絵文字または短いアイコン文字列 | `"📘"`, `"🤖"`, `"☁️"` |
| `questionCount` | number | ✅ | 問題数（問題ファイルの実際の件数と一致させる） | `20` |
| `difficulty` | string | ✅ | 難易度（下記一覧から選択） | `"intermediate"` |
| `dataPath` | string | ✅ | 問題ファイルの保存場所（カテゴリ/ファイル名.json） | `"typescript/typescript-basics.json"` |
| `parentId` | string\|null | ✅ | シリーズ親の ID（単体なら `null`） | `null` |
| `group` | string\|null | ✅ | シリーズのグループ識別子（単体なら `null`） | `null` |
| `level` | number | ✅ | `1` = 単体またはシリーズ親、`2` = シリーズの子 | `1` |
| `order` | number | ✅ | グループ内の表示順（1 から始まる正の整数） | `1` |
| `estimatedLearningTime` | string | — | 推定学習時間（任意） | `"10〜15 分"` |
| `topics` | string[] | — | 学習トピック一覧（任意） | `["型注釈", "インターフェース", "ジェネリクス"]` |

#### 3-2. difficulty の選択肢

| 値 | 対象 |
|----|------|
| `"beginner"` | 用語の定義・基本概念の確認 |
| `"intermediate"` | 設定・構成・エラー解決の理解 |
| `"advanced"` | システム全体の把握・複合的な分析 |
| `"beginner to intermediate"` | 初級〜中級の混在セット |
| `"beginner to advanced"` | 初級〜上級の幅広いセット |

#### 3-3. メタデータ記述例（単体セット）

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

### 4. シリーズ（階層）構成

複数のステップに分かれるクイズシリーズを作成することができます。

#### 4-1. 構成ルール

- **親エントリ（`level: 1`）:** シリーズ全体のラベルとして機能する。`dataPath` は `""` または `null` にする
- **子エントリ（`level: 2`）:** 実際の問題ファイルを持つ。`parentId` に親の `id` を指定する
- `group` フィールドで親・子を同一グループとして識別する（親・子で同じ値を設定）

#### 4-2. シリーズのメタデータ例

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

### 5. 命名規則

| 対象 | ルール | 良い例 | 悪い例 |
|------|--------|--------|--------|
| クイズ ID | 英小文字・数字・ハイフンのみ（kebab-case） | `typescript-basics` | `TypeScriptBasics`, `typescript_basics` |
| ファイル名 | `<quiz-id>.json` | `typescript-basics.json` | `TypeScript Basics.json` |
| カテゴリフォルダ | 英小文字・ハイフン | `typescript/`, `github-copilot/` | `TypeScript/`, `GitHub Copilot/` |
| `options[].id` | 大文字アルファベット 1 文字 | `"A"`, `"B"`, `"C"`, `"D"` | `"a"`, `"1"`, `"Option1"` |

---

### 6. 難易度ガイドライン

| 難易度 | 推奨割合 | 問題のタイプ例 |
|--------|---------|---------------|
| beginner | 約 15% | 用語の定義（「〇〇とは何ですか？」）、基本コマンドの目的 |
| intermediate | 約 70% | 設定の意味・エラーの解決方法・動作の違いを問う問題 |
| advanced | 約 15% | システム全体の把握、複数概念の組み合わせ、トレードオフ分析 |

#### 良い問題の条件

- 問題文が一意に解釈できる（曖昧さがない）
- 不正解選択肢が「それらしく見えるが誤り」である（識別力がある）
- 解説が「なぜ正解か」「なぜ他は誤りか」を具体的に説明している
- 1 問で 1 つの概念・事実を問う（複合問題は上級向けのみ）

---

### 7. バリデーション

リポジトリをクローンした環境では、以下のコマンドで仕様への適合を検証できます。

```bash
# メタデータの検証（quizSets.json 全体）
npm run validate:metadata

# 問題ファイルの検証（単一ファイル指定）
npm run validate:quiz -- src/data/<カテゴリ>/<quiz-id>.json

# 問題ファイルの検証（設定ファイルの questionGlobs に一致するもの）
npm run validate:quiz
```

> 単一ファイルはコマンド引数で直接指定できます。複数ファイルをまとめて検証対象に含めたい場合は、管理者側で `.github/skills-config/quiz-generator/quiz-generator.config.json` の `questionGlobs` を更新してください。

#### JSON スキーマ

スキーマファイルは以下に公開されています（参照のみ）。

| スキーマ | パス | 用途 |
|---------|------|------|
| 問題オブジェクト | `public/schemas/question-schema.json` | 各問題の形式検証 |
| 問題ファイル全体 | `public/schemas/question-set-schema.json` | ファイル全体の形式検証 |
| メタデータ | `public/schemas/quizset-metadata-schema.json` | `quizSets.json` 各エントリの検証 |

---

### 8. 提出方法

#### Option A: GitHub Pull Request（推奨）

1. リポジトリをフォーク: [https://github.com/duwenji/spa-quiz-app](https://github.com/duwenji/spa-quiz-app)
2. フォーク先で問題 JSON ファイルを `src/data/<カテゴリ>/` に追加する
3. Pull Request を作成し、本文にメタデータ情報（[3-1 節](#3-1-フィールド定義) の全フィールド）を記載する

#### Option B: Issue での依頼

1. GitHub Issues で新規 Issue を作成する
2. 問題 JSON の内容とメタデータ情報を Issue に記載する
3. 管理者が取り込みを行う

#### 提出チェックリスト

- [ ] ファイル名が kebab-case になっている（例: `my-quiz.json`）
- [ ] `id` が 1 から始まる連番になっている
- [ ] `options` が A / B / C / D の 4 つすべて含まれている
- [ ] `correctAnswer` が `options` のいずれかの `id` と一致している
- [ ] `explanation` が空でない
- [ ] `questionCount`（メタデータ）と問題ファイルの実際の問題数が一致している
- [ ] `description` が 50 文字以上 200 文字以内（推奨）
- [ ] ファイルが有効な JSON（構文エラーがない）

## クイズ受験マニュアル {#section-docs-quiz-taker}


> **対象:** ブラウザでクイズサイトにアクセスして学習する方

### 目次

1. [サイトへのアクセス](#1-サイトへのアクセス)
2. [クイズの選び方](#2-クイズの選び方)
3. [クイズを始める](#3-クイズを始める)
4. [問題への回答](#4-問題への回答)
5. [ナビゲーション機能](#5-ナビゲーション機能)
6. [学習統計とダウンロード](#6-学習統計とダウンロード)
7. [よくある質問](#7-よくある質問)

---

### 1. サイトへのアクセス

ブラウザで以下の URL を開いてください。

```
https://duwenji.github.io/spa-quiz-app/
```

アカウント登録や会員登録は不要です。ブラウザのみで利用できます。

---

### 2. クイズの選び方

サイトを開くと、利用可能なクイズセットの一覧が表示されます。

#### 一覧の見方

各カードには以下の情報が表示されます。

| 項目 | 説明 |
|------|------|
| アイコン | クイズのカテゴリを表す絵文字 |
| タイトル | クイズセットの名前 |
| 説明 | 学習できる内容の概要 |
| 問題数 | 収録されている問題の数 |
| 難易度 | beginner / intermediate / advanced など |

#### シリーズ（ステップ）形式のクイズ

「クリーンアーキテクチャ完全ガイド」や「GitHub Copilot Agent & Skills 総合シリーズ」「GitHub Copilot 実務ワークフローシリーズ」など、複数のステップに分かれているクイズは、一覧画面で**シリーズ見出し付きの個別ステップ**として表示されます。

**受験の際は表示されている個別のステップをそのまま選択してください。**

---

### 3. クイズを始める

クイズカードをクリックすると、イントロ画面が表示されます。

#### イントロ画面で確認できること

- クイズの正式名称
- 学習内容の説明
- 問題数を含むクイズ概要

「**クイズを始める**」ボタンをクリックするとクイズが開始されます。

「**← 戻る**」をクリックするとクイズ一覧に戻ります。

---

### 4. 問題への回答

#### 回答手順

1. 問題文を読む
2. A / B / C / D の選択肢のいずれかをクリックして選択する
3. 「**確認する**」ボタンをクリックする

> **注意:** 「確認する」をクリックしないと回答が記録されません。

#### 結果フィードバック

回答を確定すると、その場で正誤が表示されます。

- **正解の場合:** 緑色の表示と解説が表示されます
- **不正解の場合:** 赤色の表示・正解・解説が表示されます

解説を読んで理解を深めてから、次の問題に進んでください。

#### プログレスバー

画面上部のプログレスバーで、現在のクイズ全体の進捗（正解数・不正解数）を確認できます。

---

### 5. ナビゲーション機能

#### 前後移動

- **「次の問題」:** 次の問題に進む（回答確定後に使用可）
- **「前の問題」:** 前の問題に戻る

前の問題に戻った場合、以前の回答が自動的に復元されます。  
**回答済みの問題は変更できません。**

#### 問題番号ジャンプ

画面下部の問題番号リストをクリックすると、任意の問題に直接移動できます。

| マーク | 意味 |
|--------|------|
| ✅ 緑 | 正解した問題 |
| ❌ 赤 | 不正解だった問題 |
| ⬜ グレー | 未回答の問題 |
| 🔵 青枠 | 現在表示中の問題 |

---

### 6. 学習統計とダウンロード

クイズ中に1問以上回答すると、画面下部に「📊 学習統計とダウンロード」パネルが表示されます。

#### 表示される統計

| 統計 | 説明 |
|------|------|
| 正解数 | 正解した問題の数 / 回答した問題数 |
| 正解率 | 全回答に対する正解の割合（%） |
| 平均解答時間 | 1問あたりの平均所要時間（秒） |
| 回答数 | 回答済みの問題数 |

初回回答日時・最終回答日時も確認できます。

#### データのダウンロード

「**📥 JSON形式でダウンロード**」  
すべての回答記録をJSON形式のファイルとして保存します。プログラムでの分析に適しています。

「**📊 CSV形式でダウンロード**」  
回答記録をCSV形式で保存します。Excelや Google スプレッドシートで開けます。

#### AI分析（Copilot Chat）

「**📋 AI分析用プロンプトをコピー**」ボタンをクリックすると、学習データの分析を依頼するプロンプトがクリップボードにコピーされます。

VS Code の Copilot Chat（`Ctrl+Shift+I`）を開いてプロンプトを貼り付けると、苦手分野の特定や学習アドバイスを得られます。

#### 学習履歴のリセット

「**🔄 学習履歴をリセット**」ボタンをクリックすると、現在のセッションの回答記録がすべて削除されます。

> **注意:** リセットすると履歴を元に戻せません。必要に応じてダウンロードしてから実行してください。

#### 学習履歴の保存場所

学習履歴はブラウザの **ローカルストレージ** に自動保存されます。  
同じブラウザ・同じデバイスで**同じクイズセット**を再度開くと、回答済み履歴が自動復元され、未回答の続きから再開できます。別のブラウザや別のデバイスには引き継がれません。

---

### 7. よくある質問

#### Q. 問題が表示されない / 「データが見つかりません」と表示される

「クイズ一覧に戻る」ボタンをクリックして別のクイズセットを選んでください。  
問題が解消されない場合は、ブラウザのキャッシュをクリアしてください（`Ctrl+Shift+Delete`）。

#### Q. 途中でブラウザを閉じると進捗は消えますか？

**回答済みの記録はローカルストレージに保存されます。** 同じブラウザ・同じデバイスで同じクイズセットを開き直すと、続きから再開できます。別のブラウザや別のデバイスへの引き継ぎはできません。長期保存したい場合は JSON または CSV でダウンロードしてください。

#### Q. 回答を後から修正できますか？

回答を確定した問題は変更できません。問題番号からその問題を表示することはできますが、選択肢を変更することはできない仕様です。

#### Q. ページ表示が古いままに見える

`Ctrl+Shift+R`（強制リロード）を試してください。  
それでも改善しない場合はブラウザキャッシュのクリアをお試しください（`Ctrl+Shift+Delete`）。

#### Q. スマートフォンでも使えますか？

はい、レスポンシブデザインのため PC・タブレット・スマートフォンで利用できます。

## SPA Quiz App — ドキュメント {#section-docs-readme}


**spa-quiz-app** は、React + TypeScript + Vite で構築された学習クイズ SPA です。  
GitHub Copilot 系の総合シリーズや実務ワークフロー、アーキテクチャ学習クイズを GitHub Pages 上で公開しています。

### 📖 マニュアル

| マニュアル | 対象 | 内容 |
|-----------|------|------|
| 🎯 **[クイズ受験マニュアル](#section-docs-quiz-taker)** | ブラウザでクイズを受ける方 | クイズの選び方・回答方法・学習履歴・ダウンロード |
| 🛠️ **[クイズ取り込みマニュアル](#section-docs-quiz-creator)** | クイズを追加・管理する方 | データ形式・作成手順・バリデーション・デプロイ |
| 📋 **[クイズデータ仕様書](#section-docs-quiz-spec)** | 外部からクイズを提供する方 | 問題 JSON・メタデータの完全仕様・提出方法 |

---

### 🔗 サイト URL

```
https://duwenji.github.io/spa-quiz-app/
```
