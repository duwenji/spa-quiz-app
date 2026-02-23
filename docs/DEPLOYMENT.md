# デプロイ手順書

`spa-quiz-app` をGitHub Pagesで公開するための詳細な手順です。

## 前提条件

- Node.js v16以上がインストール済み
- GitHubアカウントを所有
- このリポジトリを`git clone`済み
- 依存パッケージが`npm install`で導入済み

## デプロイの3ステップ

### **ステップ 1: GitHub リポジトリの準備**

#### 1-1. GitHub リポジトリを作成

リポジトリ名は以下の形式である必要があります：

```
<username>.github.io  （個人サイトの場合）
または
<you-want-name>       （プロジェクトサイトの場合）
```

本アプリの場合：
```
リポジトリ: spa-quiz-app
URL: https://github.com/duwenji/spa-quiz-app
```

#### 1-2. GitHub Pages 設定を確認

リポジトリの **Settings > Pages** で以下を確認：

```
✓ Source: "Deploy from a branch"
✓ Branch: "gh-pages"
✓ Folder: "/(root)"
```

**保存**をクリック。

---

### **ステップ 2: ローカルで開発・ビルド**

#### 2-1. ローカル開発サーバーで確認

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いて動作確認。

#### 2-2. クイズデータの配置確認

以下のファイルが存在することを確認：

```
public/data/
├── quizSets.json
└── github-copilot/
    ├── github-copilot-variables.json
    └── github-copilot-csharp-best-practices.json
```

**公開する前に必ず確認してください。**

#### 2-3. ビルド実行

```bash
npm run build
```

以下が生成されることを確認：

```
dist/
├── assets/
│   ├── index-xxxxx.js      # JavaScriptバンドル
│   ├── index-xxxxx.css     # CSSバンドル
│   └── vite-xxxxx.svg      # その他アセット
├── data/                    # クイズデータ
├── index.html               # メインHTML
```

---

### **ステップ 3: GitHub Pages にデプロイ**

#### 3-1. デプロイコマンド実行

```bash
npm run deploy
```

以下のメッセージが表示されれば成功：

```
Published
```

#### 3-2. 公開URL にアクセス

```
https://duwenji.github.io/spa-quiz-app/
```

反映に数分かかることがあります。アクセスできない場合は：
- ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
- 数分待機して再度アクセス

---

## vite.config.ts の重要な設定

```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/spa-quiz-app/' : '/',
})
```

このため、本番環境では `/spa-quiz-app/` 配下にデプロイされます。

---

## 各種コマンド詳細

### `npm run dev`
ホット・モジュール・リロード（HMR）有効の開発サーバーを起動。
- ローカルアドレス: `http://localhost:5173`
- 変更を保存するとブラウザが自動更新

### `npm run build`
プロダクション最適化ビルド。
- TypeScript型チェック（`tsc -b`）を先に実行
- Viteで圧縮・最適化
- 出力: `dist/` フォルダ

### `npm run preview`
ビルド結果をローカルで確認（本番環境をシミュレート）。
```bash
npm run build
npm run preview
```

### `npm run deploy`
ビルド + GitHub Pages へのデプロイ（gh-pages パッケージ使用）。
```bash
npm run build          # 内部的に実行
gh-pages -d dist       # dist/ を gh-pages ブランチにpush
```

---

## package.json のスクリプト定義

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.1",
    ...
  }
}
```

---

## トラブルシューティング

### ❌ ビルドが失敗する

**エラー:** `error TS2339: Property 'env' does not exist on type 'ImportMeta'`

**解決：** `tsconfig.json` に以下を追加

```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    ...
  }
}
```

### ❌「クイズセットを始める」でデータが読み込めない

**原因:** `public/data/` が `dist/` に含まれていない

**確認:**
```bash
ls dist/data/  # Windows: dir dist\data
```

**解決:**
```bash
Copy-Item -Recurse "src\data" "public\data"  # Windows PowerShell
# または
cp -r src/data public/data                   # macOS/Linux
```

その後、`npm run deploy` を再実行。

### ❌ GitHub Pages でアクセスできない

1. リポジトリの **Settings > Pages** を確認
2. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
3. 数分待機して再度アクセス
4. コンソールエラーをチェック（F12キー）

詳しくは [TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照。

---

## 更新の流れ

コードを更新したら：

```bash
# 1. ローカルで確認
npm run dev

# 2. テスト・確認完了後、本番ビルド
npm run build

# 3. プレビュー確認（任意）
npm run preview

# 4. GitHub Pages にデプロイ
npm run deploy
```

---

## 参考資料

- [GitHub Pages 公式ドキュメント](https://docs.github.com/en/pages)
- [Vite 公式ドキュメント](https://vitejs.dev/)
- [gh-pages npm パッケージ](https://www.npmjs.com/package/gh-pages)
