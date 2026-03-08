# クイズセット作成テンプレート

このテンプレートを使用して、新しいクイズセットを作成してください。

## 1. 質問ファイルの作成

`public/data/your-category/your-quiz-id.json` というファイルを作成します。

以下のテンプレートをコピーして編集してください：

```json
{
  "questions": [
    {
      "id": 1,
      "question": "ここに質問文を入力してください",
      "options": [
        {
          "id": "A",
          "text": "選択肢A"
        },
        {
          "id": "B",
          "text": "選択肢B"
        },
        {
          "id": "C",
          "text": "選択肢C"
        },
        {
          "id": "D",
          "text": "選択肢D"
        }
      ],
      "correctAnswer": "A",
      "explanation": "ここに解説文を入力してください。正解の理由や関連情報を記載します。"
    },
    {
      "id": 2,
      "question": "2つ目の質問例",
      "options": [
        {
          "id": "A",
          "text": "選択肢A"
        },
        {
          "id": "B",
          "text": "選択肢B"
        },
        {
          "id": "C",
          "text": "選択肢C"
        },
        {
          "id": "D",
          "text": "選択肢D"
        }
      ],
      "correctAnswer": "B",
      "explanation": "2つ目の質問の解説です。"
    }
  ]
}
```

### チェックリスト

- [ ] 各質問について `id` は連番（1, 2, 3, ...）
- [ ] 各質問について選択肢は**必ず 4 つ**
- [ ] 選択肢の `id` は A, B, C, D のいずれか
- [ ] `correctAnswer` に指定した値が options に存在する
- [ ] 全フィールドが埋まっている（空文字列なし）

---

## 2. メタデータの登録

`src/data/quizSets.json` に新しいエントリを追加します。

```json
{
  "id": "your-quiz-id",
  "name": "Your Quiz Name",
  "description": "Short description of your quiz",
  "category": "Category Name",
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

### メタデータフィールドの説明

| フィールド | 説明 | 例 |
|----------|------|-----|
| `id` | クイズセットの一意識別子（ケバブケース） | `"my-quiz-set"` |
| `name` | UI に表示される名前 | `"My Quiz Set"` |
| `description` | クイズセットの説明 | `"Learn about X topics"` |
| `category` | カテゴリ名 | `"GitHub"`, `"Architecture"` |
| `icon` | 表示用絵文字 | `"🤖"` |
| `questionCount` | 実際の問題数（JSON ファイルの `questions` 配列の要素数） | `10` |
| `difficulty` | 難易度 | `"beginner"`, `"intermediate"`, `"advanced"`, `"beginner to intermediate"` |
| `dataPath` | 問題ファイルの相対パス（`public/data/` からの相対パス） | `"my-category/my-quiz.json"` |
| `parentId` | 親クイズセット ID（子要素の場合）、なければ `null` | `"parent-quiz"` |
| `group` | グループ名（複数セットをグループ化する場合） | `"my-series"` |
| `level` | 階層（1=トップレベル、2=子要素） | `1` |
| `order` | グループ内での表示順番 | `1` |

---

## 3. 検証

作成したクイズセットを検証します：

```bash
# 質問ファイルの検証
npm run validate:quiz -- public/data/your-category/your-quiz-id.json

# メタデータの検証
npm run validate:metadata
```

✓ すべて合格したら完成です！

---

## 4. 例

### 単純なクイズセット

**ファイル**: `public/data/javascript/javascript-basics.json`

```json
{
  "questions": [
    {
      "id": 1,
      "question": "JavaScript の var, let, const の違いはどれか？",
      "options": [
        {
          "id": "A",
          "text": "スコープと再宣言の可否"
        },
        {
          "id": "B",
          "text": "パフォーマンスのやり方"
        },
        {
          "id": "C",
          "text": "メモリ使用量の効率性"
        },
        {
          "id": "D",
          "text": "構文の複雑さ"
        }
      ],
      "correctAnswer": "A",
      "explanation": "var はファンクションスコープ、let と const はブロックスコープを持ちます。また、let は再宣言可能、const は不可です。"
    }
  ]
}
```

**メタデータ**:

```json
{
  "id": "javascript-basics",
  "name": "JavaScript 基礎",
  "description": "変数スコープ、型、非同期処理など JavaScript の基本概念を学習",
  "category": "Programming",
  "icon": "📦",
  "questionCount": 1,
  "difficulty": "beginner",
  "dataPath": "javascript/javascript-basics.json",
  "parentId": null,
  "group": null,
  "level": 1,
  "order": 1
}
```

### 階層的なクイズセット

**親**: `public/data/architecture/clean-architecture.json`  
**子**: `public/data/architecture/clean-architecture-step1.json`

親のメタデータ:

```json
{
  "id": "clean-architecture",
  "name": "クリーンアーキテクチャ完全ガイド",
  "description": "クリーンアーキテクチャの全体像",
  "category": "Architecture",
  "icon": "🏗️",
  "questionCount": 5,
  "difficulty": "intermediate",
  "dataPath": "architecture/clean-architecture.json",
  "parentId": null,
  "group": "clean-architecture-series",
  "level": 1,
  "order": 1
}
```

子のメタデータ:

```json
{
  "id": "clean-architecture-step1",
  "name": "クリーンアーキテクチャ STEP 1: 理論基盤",
  "description": "基本概念と層構造を学ぶ",
  "category": "Architecture",
  "icon": "📖",
  "questionCount": 5,
  "difficulty": "beginner to intermediate",
  "dataPath": "architecture/clean-architecture-step1.json",
  "parentId": "clean-architecture",
  "group": "clean-architecture-series",
  "level": 2,
  "order": 2
}
```

---

## 5. トラブルシューティング

### `questionCount` が実際の問題数と合致しないエラー

`quizSets.json` の `questionCount` 値を、JSON ファイル内の `questions` 配列の要素数と一致させてください。

### JSON 形式エラー

```bash
npm run validate:quiz -- path/to/your-quiz.json
```

を実行して、エラーメッセージを確認してください。

### 選択肢が 4 つ以外のエラー

各質問について、`options` 配列の要素数が**必ず 4 つ**であることを確認してください。

---

## 6. ネーミング規則

### ID（ケバブケース）

```
✓ "javascript-basics"
✓ "clean-architecture-step1"
✓ "github-copilot-variables"
✗ "JavaScriptBasics"
✗ "javascript_basics"
```

### ファイル名

```
✓ "javascript-basics.json"
✓ "clean-architecture-step1.json"
✗ "JavaScriptBasics.json"
```

### ディレクトリ名

```
✓ public/data/javascript/
✓ public/data/clean-architecture/
✗ public/data/JavaScript/
```

---

## 7. サポート

分からないことや質問がある場合：

1. [DATA_FORMAT_SPECIFICATION.md](./DATA_FORMAT_SPECIFICATION.md) を参照
2. GitHub Issues で質問する
3. Discussions で相談する

Happy quiz creating! 🎉
