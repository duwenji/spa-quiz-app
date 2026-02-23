# SPA Quiz App - GitHub Pages デプロイガイド

このドキュメントでは、`spa-quiz-app`をGitHub Pagesで公開する仕組みと使い方について説明します。

## 📋 ドキュメント目次

| ドキュメント | 内容 | 対象者 |
|-----------|------|-------|
| 🚀 **[クイックスタート](QUICKSTART.md)** | 5分で始める最小手順 | すべての開発者 |
| 📖 **[本ドキュメント](#概要)** | GitHub Pages と構成の基礎 | 初心者 |
| 🔧 **[デプロイ手順](DEPLOYMENT.md)** | 詳細な本番デプロイ方法 | デプロイ担当者 |
| 🏗️ **[アーキテクチャ](ARCHITECTURE.md)** | 内部構成とビルドシステム | 開発者・保守者 |
| 🐛 **[トラブルシューティング](TROUBLESHOOTING.md)** | 問題解決ガイド | 全員 |

---

## 🎯 どのドキュメントを読むべき？

### 「今すぐ始めたい」
→ **[QUICKSTART.md](QUICKSTART.md)** で5分で開始

### 「開発の基礎を理解したい」
→ このREADME + **[ARCHITECTURE.md](ARCHITECTURE.md)**

### 「本番にデプロイしたい」
→ **[DEPLOYMENT.md](DEPLOYMENT.md)**

### 「エラーが出た」
→ **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

---

## 📋 目次

1. [概要](#概要)
2. [GitHub Pages の仕組み](#github-pagesの仕組み)
3. [アプリケーションの構成](#アプリケーションの構成)
4. [参考リンク](#参考リンク)

---

## 概要

**spa-quiz-app** は、React + TypeScript + Viteで構築された単一ページアプリケーション（SPA）です。GitHub Pagesを使用して無料で公開できます。

### 公開URL
```
https://duwenji.github.io/spa-quiz-app/
```

---

## GitHub Pages の仕組み

### 1. GitHub Pages とは

GitHub Pages は、GitHubが提供する**静的ウェブホスティングサービス**です。

- 📁 **対応形式**: 静的HTMLファイルのみ
- 🌐 **対応プロトコル**: HTTPS（自動）
- 💰 **料金**: 無料
- ⚡ **デプロイ**: GitHubへのpushで自動反映

### 2. デプロイの流れ

```
┌─────────────────────────────────────┐
│  1. ローカルで npm run build        │
│     dist/ フォルダを生成             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  2. npm run deploy                  │
│     gh-pages パッケージが実行        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  3. gh-pages ブランチで配信          │
│     dist/ の内容をpush              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  4. GitHub Pages が公開              │
│     https://duwenji.github.io/      │
│     spa-quiz-app/                   │
└─────────────────────────────────────┘
```

### 3. GitHub Pages の設定

リポジトリの **Settings > Pages** で以下を確認：

```
Source: Deploy from a branch
Branch: gh-pages
Folder: /(root)
```

---

## アプリケーションの構成

### ディレクトリ構造

```
spa-quiz-app/
├── src/                          # ソースコード
│   ├── components/               # Reactコンポーネント
│   ├── data/
│   │   ├── quizSets.json        # クイズセットのメタデータ
│   │   └── github-copilot/      # クイズデータ
│   ├── hooks/                    # カスタムフック
│   ├── types/                    # TypeScript型定義
│   ├── utils/                    # ユーティリティ関数
│   ├── App.tsx                   # メインコンポーネント
│   └── main.tsx                  # エントリーポイント
├── public/                       # 静的ファイル
│   └── data/                     # ビルド時に dist/ にコピーされるデータ
├── dist/                         # ビルド出力（本番用）
├── docs/                         # ドキュメント（このフォルダ）
├── package.json                  # 依存パッケージと npm スクリプト
├── vite.config.ts                # Viteビルド設定
├── tsconfig.json                 # TypeScript設定
└── index.html                    # Viteのエントリーポイント
```

### 重要なファイル

| ファイル | 役割 |
|---------|------|
| `package.json` | npm スクリプトとパッケージ定義 |
| `vite.config.ts` | Viteビルド設定（GitHub Pagesパス対応） |
| `public/` | 静的ファイル（ビルド時に dist/ へコピー） |
| `index.html` | 単一ページのHTML（Viteが自動処理） |

---

## key フォルダの役割

### `src/data/`
- クイズの質問データを保存
- JSON形式のデータファイル
- ビルド時に `public/data/` にコピーされて、本番環境で読み込まれる

### `public/`
- Viteが `dist/` にそのままコピーするフォルダ
- `public/data/` は本番環境で `/data/` でアクセス可能

### `dist/`
- ビルド出力フォルダ
- `npm run deploy` で GitHub Pages にpushされる

---

## npm スクリプト

```bash
npm run dev      # 開発サーバー起動 (localhost:5173)
npm run build    # 本番ビルド実行
npm run preview  # ビルド結果をローカルで確認
npm run deploy   # ビルド + GitHub Pages にデプロイ
```

---

## まとめ

| ステップ | コマンド | 説明 |
|---------|--------|------|
| **開発** | `npm run dev` | ローカル開発サーバーで編集・確認 |
| **ビルド** | `npm run build` | 本番用に最適化してビルド |
| **デプロイ** | `npm run deploy` | GitHub Pages に公開 |

詳しいデプロイ手順は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

---

## 参考リンク

### 📚 このプロジェクトのドキュメント
- [クイックスタート](QUICKSTART.md) - 5分で始める
- [デプロイ手順](DEPLOYMENT.md) - 本番環境への公開方法
- [アーキテクチャ](ARCHITECTURE.md) - 内部構成解説
- [トラブルシューティング](TROUBLESHOOTING.md) - 問題解決

### 🔗 外部リソース
- [GitHub Pages 公式ドキュメント](https://docs.github.com/en/pages)
- [Vite 日本語ドキュメント](https://ja.vitejs.dev/)
- [React 公式ドキュメント](https://react.dev/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [gh-pages npm パッケージ](https://www.npmjs.com/package/gh-pages)

### 🐙 リポジトリ
- **本リポジトリ**: https://github.com/duwenji/spa-quiz-app
- **本番URL**: https://duwenji.github.io/spa-quiz-app/

---

## 📝 ドキュメント使用期限

作成日: 2026年2月23日
最終更新: 本READMEを参照
