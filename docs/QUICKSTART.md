# クイックスタートガイド

アプリケーションをすぐに始めるための最小限の手順です。

---

## 🚀 5分で始める

### 1. リポジトリをクローン

```bash
git clone https://github.com/duwenji/spa-quiz-app.git
cd spa-quiz-app
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザが自動で開きます。なければ以下にアクセス：

```
http://localhost:5173
```

### 4. コードを編集

任意のファイルを編集すると、ブラウザが自動更新します。

---

## 📦 本番にデプロイ

### 1. ビルド実行

```bash
npm run build
```

`dist/` フォルダが生成されます。

### 2. GitHub Pages にデプロイ

```bash
npm run deploy
```

完了メッセージ `Published` が表示されたら成功です。

### 3. アクセス確認

```
https://duwenji.github.io/spa-quiz-app/
```

反映に数分かかることがあります。

---

## 📚 主要コマンド

| コマンド | 説明 | 環境 |
|---------|------|------|
| `npm run dev` | 開発サーバー起動 | ローカル |
| `npm run build` | 本番ビルド | ローカル |
| `npm run preview` | ビルド結果確認 | ローカル |
| `npm run deploy` | GitHub Pages へデプロイ | ローカル |

---

## 🐛 問題が発生した？

各種ドキュメントを参照：

- **基本情報**: [README.md](README.md)
- **デプロイ方法**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **アーキテクチャ**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **トラブルシューティング**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📝 ファイル構成（重要）

```
spa-quiz-app/
├── src/                  # ソースコード
├── public/data/          # クイズデータ（ビルド時に含まれる）
├── dist/                 # ビルド出力（.gitignored）
├── docs/                 # このドキュメント
└── package.json          # npm設定
```

### クイズデータについて

新しいクイズを追加する場合：

1. `src/data/` に JSON ファイルを作成
2. `public/data/` にもコピー
3. `quizSets.json` にメタデータを追加
4. `npm run build && npm run deploy`

例：
```bash
cp src/data/github-copilot/questions.json public/data/github-copilot/
```

---

## 🔗 リンク

- **リポジトリ**: https://github.com/duwenji/spa-quiz-app
- **本番サイト**: https://duwenji.github.io/spa-quiz-app/
- **GitHub Pages**: https://pages.github.com/
- **Vite**: https://vitejs.dev/

---

## 💡 Tips

### 開発を効率よく進めるには

```bash
# ターミナル1: 開発サーバー実行
npm run dev

# ターミナル2: 別の作業（同時実行可能）
git status
git commit
```

### ビルド結果をローカルで確認

```bash
npm run build
npm run preview
# localhost:4173 で本番環境をシミュレート
```

### Git の使い方

```bash
# 変更を確認
git status

# ステージング
git add .

# コミット
git commit -m "機能説明"

# プッシュ
git push origin main
```

---

## ❓ よくある質問

**Q: 開発時と本番時で URL が異なるのはなぜ？**

A: vite.config.ts で次のように設定しているため：
- 開発: `base: '/'`
- 本番: `base: '/spa-quiz-app/'`

**Q: `public/data/` は何のためにあるのか？**

A: Viteの public フォルダはビルド時に丸ごとコピーされるため、JSONデータを配置します。

**Q: GitHub Pages にデプロイしたい場合は？**

A: `npm run deploy` だけで完了です。gh-pages パッケージが自動化してくれます。

---

次のステップ → より詳しい情報は [README.md](README.md) をご覧ください。
