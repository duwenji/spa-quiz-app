# Contributing

改善提案やクイズ追加は歓迎します。

## 基本方針
- 学習者が使いやすい UI と分かりやすい解説を優先してください。
- クイズデータ追加時は validation を必ず実行してください。
- 大きな変更は `Issue` で背景共有してから進めてください。

## 推奨フロー
1. `Issue` を作成する
2. branch を切る
3. `src/` または `src/data/` を更新する
4. `npm run validate:all` を実行する
5. `npm run build` を実行する
6. `Pull Request` を作成する
