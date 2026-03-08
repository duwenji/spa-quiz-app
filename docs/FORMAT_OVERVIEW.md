# SPA Quiz App - データフォーマット ガイド

外部のチュートリアルやコンテンツからクイズセットを生成・提供する場合は、このゲイドに従ってください。

---

## 📚 ドキュメント一覧

| ドキュメント | 用途 |
|-----------|------|
| [DATA_FORMAT_SPECIFICATION.md](./DATA_FORMAT_SPECIFICATION.md) | **完全なデータ仕様書** - 全フィールド、ルール、バリデーション |
| [QUIZ_CREATION_TEMPLATE.md](./QUIZ_CREATION_TEMPLATE.md) | **クイズ作成ガイド** - ステップバイステップの作成手順 |
| [JSON Schemas](../public/schemas/) | **形式定義** - quizSets.json、質問データの JSON Schema |

---

## 🚀 クイズ作成の最短手順

### 1️⃣ テンプレートをコピー

```json
{
  "questions": [
    {
      "id": 1,
      "question": "質問文",
      "options": [
        {"id": "A", "text": "選択肢A"},
        {"id": "B", "text": "選択肢B"},
        {"id": "C", "text": "選択肢C"},
        {"id": "D", "text": "選択肢D"}
      ],
      "correctAnswer": "A",
      "explanation": "解説"
    }
  ]
}
```

### 2️⃣ ファイルを配置

```
public/data/your-category/your-quiz-id.json
```

### 3️⃣ メタデータに登録

`src/data/quizSets.json` に追加：

```json
{
  "id": "your-quiz-id",
  "name": "Your Quiz Name",
  "description": "Description",
  "category": "Category",
  "icon": "🎯",
  "questionCount": 10,
  "difficulty": "intermediate",
  "dataPath": "your-category/your-quiz-id.json",
  "parentId": null,
  "group": null,
  "level": 1,
  "order": 999
}
```

### 4️⃣ 検証

```bash
npm run validate:metadata      # メタデータ検証
npm run validate:quiz -- your/file.json   # 質問データ検証
```

---

## 📋 フィールド説明

### メタデータの重要フィールド

| フィールド | 値の種類 | 例 |
|----------|--------|-----|
| `id` | ケバブケース | `"github-copilot-basics"` |
| `name` | 日本語テキスト | `"GitHub Copilot の基礎"` |
| `difficulty` | `beginner`, `intermediate`, `advanced`, `beginner to intermediate`, `beginner to advanced` | `"intermediate"` |
| `dataPath` | ファイルパス | `"github-copilot/github-copilot-basics.json"` |
| `questionCount` | 実際の問題数 | `30` |
| `level` | `1` (親) または `2` (子) | `1` |

### 質問データの要求事項

✅ **必須**:
- `id`: 連番（1, 2, 3, ...）
- `question`: 問題文
- `options`: **4つの選択肢**
  - 各選択肢に `id` (A/B/C/D) と `text`
- `correctAnswer`: A/B/C/D いずれか
- `explanation`: 詳細な解説

---

## ✅ チェックリスト

新しいクイズセットを提出する前に：

- [ ] JSON 形式が正しい（`npm run validate:quiz` でチェック）
- [ ] メタデータフィールドが全て埋まっている
- [ ] `questionCount` が実際の問題数と一致
- [ ] ファイル名・ID がケバブケース（`my-quiz-id.json`）
- [ ] 選択肢が必ず 4 つ
- [ ] `correctAnswer` の値が options に存在
- [ ] 問題文と解説が明確で誤字がない

---

## 📁 ディレクトリ構造

```
spa-quiz-app/
├── public/schemas/              # JSON Schema 定義
│   ├── question-schema.json
│   ├── question-set-schema.json
│   └── quizset-metadata-schema.json
│
├── src/data/
│   ├── quizSets.json            # メタデータインデックス
│   ├── github-copilot/          # クイズセット
│   ├── clean-architecture/
│   ├── spa-quiz-app/
│   └── template/                # テンプレート
│
└── docs/
    ├── DATA_FORMAT_SPECIFICATION.md   # 完全仕様書
    ├── QUIZ_CREATION_TEMPLATE.md      # 作成ガイド
    └── README.md                      # このファイル
```

---

## 🔗 JSON Schema リンク

外部でバリデーションする場合：

```json
{
  "$schema": "https://spa-quiz-app.example.com/schemas/question-set-schema.json"
}
```

---

## 🆘 よくある質問

**Q: 難易度のレベルは？**

A:
- `beginner`: 基本概念（初心者向け）
- `intermediate`: 実践知識（中級者向け）
- `advanced`: 深い理解（上級者向け）
- `beginner to intermediate`: 初中級混在
- `beginner to advanced`: 全レベル

**Q: parentId と level は何？**

A: 階層的なクイズセットの場合に使用：
- 親セット: `level: 1`, `parentId: null`
- 子セット: `level: 2`, `parentId: "parent-id"`

**Q: order フィールドは何？**

A: グループ内での表示順序（同じ `group` を持つセット内での順番）

---

## 📞 サポート

- 📖 完全な仕様: [DATA_FORMAT_SPECIFICATION.md](./DATA_FORMAT_SPECIFICATION.md)
- 🛠️ 作成手順: [QUIZ_CREATION_TEMPLATE.md](./QUIZ_CREATION_TEMPLATE.md)
- 🐛 バグ報告: GitHub Issues
- 💬 質問: GitHub Discussions

---

**最終更新**: 2024-03-08  
**スキーマバージョン**: 1.0.0
