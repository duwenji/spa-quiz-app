# React SPA 選択問題アプリ

TypeScript + React + Tailwind CSSを使用した習得用選択問題SPA（Single Page Application）です。IT分野の30問の選択問題で、ユーザーが各問題で回答→確認→解説を学習します。

## 🚀 機能

### 基本機能
- **30問の選択問題**: GitHub Copilot Chat関連のIT知識問題
- **問題表示画面**: 進捗表示、プログレスバー、見やすい問題テキスト
- **4択選択肢**: A/B/C/D の4つのボタン
- **結果表示**: ✓/✗ アイコン、正誤判定、詳細な解説

### クイズセット選択画面
- **カテゴリ別グループ化**: GitHub、アーキテクチャ、技術などのカテゴリで整理
- **シリーズ表示**: クリーンアーキテクチャなど複数のSTEPで構成されるシリーズをグループ化
- **階層表示**: 親セット（完全ガイド）と子セット（STEP 1-5）の親子関係を視覚的に表示
- **パンくずリスト**: 各クイズセットで親階層への経路を表示（例：`GitHub › クリーンアーキテクチャ完全ガイド`）
- **視覚的な強調**: グループ内のセットを背景色やボーダーで視覚的に囲む
- **段階的学習**: 関連するセットを一覧で表示し、無理のない学習フローを促進

### ナビゲーション
- **前へ/次へボタン**: 問題間の移動
- **問題番号ボタン**: 1-30の任意の問題への直接ジャンプ
   - 正解は緑、不正解は赤、未回答はグレーでハイライト

### 学習履歴追跡
- **自動記録**: 各問題の回答日時、選択答、正誤、所要時間を自動記録
- **ローカルストレージ保存**: ブラウザのlocalStorageに自動保存（ページ更新後も保持）
- **統計表示**:
  - 正解数/全問題数（正解率 %）
  - 平均解答時間
  - 最初の回答日時と最後の回答日時

### ダウンロード・エクスポート
- **JSON形式**: 学習データをJSON形式でダウンロード（AI分析に最適）
- **CSV形式**: 各回答を1行で表現、Excel/Google Sheets で開閉可能
- **ファイル名**: `learning-history-${timestamp}.json` / `.csv`

### AI分析連携
- **Copilot Chat統合**: ダウンロードしたデータをCopilot Chatに入力して分析
- **プロンプトコピー**: ワンクリックでAI分析用プロンプトをコピー
- **分析項目**:
  - 成績サマリー（正解率、分野別成績）
  - 苦手分野の特定
  - 解答時間の傾向分析
  - 改善提案

### リセット機能
- **確認ダイアログ付き**: 誤削除防止
- **全履歴クリア**: localStorageから対象キーを削除

## 🛠️ 技術スタック

| 項目 | 選択 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| パッケージマネージャー | npm |
| Node.js | 16.x 以上 |

## 📦 インストール

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

## 🌐 GitHub Pagesへのデプロイ

このSPAはGitHub Pagesでホストできます。以下の設定が含まれています：

### 自動デプロイ（推奨）
1. リポジトリのSettings → Pagesに移動
2. 「Build and deployment」で「GitHub Actions」を選択
3. プッシュ時に自動的にデプロイされます

### 手動デプロイ
```bash
# 依存関係をインストール（初回のみ）
npm install

# gh-pagesパッケージをインストール
npm install --save-dev gh-pages

# ビルドとデプロイ
npm run deploy
```

### SPAの404エラー対策
GitHub Pagesは静的サイトホスティングのため、SPAのリロード時に404エラーが発生します。この問題を解決するために以下の対策を実装しています：

1. **404.htmlファイル**: すべてのリクエストをindex.htmlにリダイレクト
2. **Viteのbase設定**: `/spa-quiz-app/` に設定
3. **GitHub Actionsワークフロー**: 自動ビルドとデプロイ

### カスタムドメインを使用する場合
カスタムドメインを使用する場合は、`vite.config.ts`の`base`設定を`/`に変更してください：
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/', // カスタムドメイン用
})
```

### アクセスURL
- GitHub Pages: `https://<username>.github.io/spa-quiz-app/`
- カスタムドメイン: 設定したドメイン

## 📁 プロジェクト構造

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

## 🎯 使い方

### クイズに挑戦

1. **スタート**: トップページのボタンをクリック
2. **問題を読む**: 大きく表示された問題テキストを確認
3. **選択肢を選ぶ**: A/B/C/D のボタンをクリック
4. **確認を押す**: 確認ボタンで回答を確定
5. **解説を読む**: 正誤判定と詳細な解説を確認
6. **次へ進む**: 「次へ」ボタンで次の問題へ

### 学習データを分析

#### Step 1: 学習データのダウンロード
1. 複数問題を解いて履歴を記録
2. 「JSON形式でダウンロード」ボタンをクリック
3. `learning-history-*.json` ファイルを取得

#### Step 2: Copilot Chat への入力
1. VS Code で Copilot Chat を開く（Ctrl+Shift+I）
2. 「AI分析用プロンプトをコピー」ボタンをクリック
3. Copilot Chat にペーストして実行

#### Step 3: 改善実施
- 分析結果に基づいて弱点分野を重点的に復習
- データを再ダウンロードして継続的に進捗を追跡
- 改善前後の成績比較

### データをエクスポート

- **JSON形式**: 完全な構造化データ、AI分析に最適
- **CSV形式**: スプレッドシートソフトで開閉可能

## 📊 学習データ構造

### JSON形式

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

### CSV 形式

| 問題ID | 選択答 | 正解 | 正誤 | 解答時間(ms) | 回答日時 |
|--------|--------|------|------|--------------|---------|
| 1 | A | A | 正解 | 5000 | 2024-02-22T10:30:05Z |
| 2 | B | C | 不正解 | 8000 | 2024-02-22T10:30:13Z |

## ⚙️ カスタマイズ

### クイズセットの追加方法

新しいクイズセットを追加するには、以下の手順に従ってください：

#### 1. ディレクトリ構造の作成
```
src/data/
├── your-topic-name/          # 新しいクイズセットのディレクトリ
│   └── questions.json        # 質問データ
├── template/                 # テンプレート（参考用）
│   └── questions.json
├── quizSets.json             # クイズセットメタデータ
└── index.ts                  # データ読み込みロジック
```

#### 2. 質問データの作成
`src/data/your-topic-name/questions.json` を作成します。テンプレートをコピーして編集：
```bash
cp src/data/template/questions.json src/data/your-topic-name/questions.json
```

#### 3. クイズセットメタデータの追加
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

#### 階層構造の設定方法

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

##### フィールド説明
- `parentId`: 親セットのID。シリーズの場合のみ設定。null はトップレベル
- `group`: グループ識別名。同じグループのセットは一緒に表示される
- `level`: 1=親/最上位、2=子セット
- `order`: グループ内での表示順序。昇順でソートされる
開発サーバーを再起動すると、新しいクイズセットが自動的に認識されます。

### 既存のクイズセットの編集

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

### スタイルのカスタマイズ

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

## 📝 TypeScript型定義

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

## 🔒 プライバシー・データ保護

- ✅ すべてのデータはブラウザのlocalStorageに保存
- ✅ サーバーにはデータを送信しない
- ✅ 個人情報の収集なし
- ⚠️ ブラウザのキャッシュクリア時にデータが削除される

## 🐛 既知の問題・限界

- localStorageの容量制限（通常5-10MB）により、大量の履歴が保存されている場合は古いデータが削除される可能性あり
- ブラウザのシークレットモード使用時は、セッション終了時にデータが削除される

## 📚 学習リソース

- [GitHub Copilot 導入フレームワーク](https://github.com/your-repo/adoption-framework)
- [React 公式ドキュメント](https://react.dev)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com)

## 📄 ライセンス

MIT License

## 🤝 貢献

バグ報告や機能提案は、Issue を作成してください。

## 📧 サポート

質問や問題がある場合は、GitHubのIssueセクションから連絡してください。

---

**Happy Learning! 🚀**
