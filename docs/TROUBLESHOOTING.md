# トラブルシューティング

よくある問題と解決方法をまとめています。

---

## 📍 問題別ガイド

### 1️⃣ ビルドエラー

#### ❌ `error TS2339: Property 'env' does not exist on type 'ImportMeta'`

**症状:**
```
src/data/index.ts:28:33 - error TS2339: Property 'env' does not exist on type 'ImportMeta'.
28     const baseUrl = import.meta.env.BASE_URL;
```

**原因:** TypeScriptがVite環境変数型を認識していない

**解決:**

`tsconfig.json` で `types` を追加：

```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    ...
  }
}
```

その後：
```bash
npm run build
```

---

#### ❌ `Module not found: src/data`

**症状:**
```
error: Cannot find module 'src/data/...
```

**原因:** `public/data/` が存在しない

**確認:**
```bash
ls public/data/
```

**解決:**

```bash
# Windows PowerShell
Copy-Item -Recurse "src\data" "public\data" -Force

# macOS/Linux
cp -r src/data public/data
```

確認：
```bash
ls dist/data/
npm run deploy
```

---

#### ❌ ビルドで assets に JavaScript が含まれない

**症状:**
```
dist/assets/
  ├── vite-xxxxx.svg
  └── (index-xxxxx.js がない！)
```

**原因:** `src/main.tsx` が `index.html` で参照されていない

**解決:**

`index.html` を確認：

```html
<!-- ❌ 間違い: document.write() で読み込み -->
<script>
  document.write('<script src="...">');
</script>

<!-- ✅ 正解: 標準的なViteテンプレート -->
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

修正後：
```bash
npm run build
```

---

### 2️⃣ デプロイエラー

#### ❌ `npm run deploy` で失敗

**症状:**
```
error Failed to push...
```

**確認:**

1. **gh-pages パッケージがインストール済みか確認**
   ```bash
   npm list gh-pages
   ```

2. **Git 設定を確認**
   ```bash
   git config user.name
   git config user.email
   ```

3. _GitHubアクセストークンを確認**
   ```bash
   # Windows
   Set-Item -Path Env:GITHUB_TOKEN -Value "your-token"
   ```

**解決:**
```bash
npm install                # 再インストール
npm run deploy             # 再実行
```

---

#### ❌ GitHub Pages が反映されない

**症状:**
```
https://duwenji.github.io/spa-quiz-app/ 
にアクセスしても古いバージョンが表示される
```

**確認:**

1. **デプロイが完了したか確認**
   ```
   GitHub > Settings > Actions > 最新の実行状況
   ```

2. **gh-pages ブランチを確認**
   ```
   GitHub > Branches > "gh-pages" ブランチの最新コミット時刻
   ```

3. **ページ設定を確認**
   ```
   Settings > Pages
   ├─ Source: "Deploy from a branch" ✓
   ├─ Branch: "gh-pages" ✓
   └─ Folder: "/(root)" ✓
   ```

**解決:**

```bash
# キャッシュクリア（ブラウザ）
# Ctrl+Shift+Delete で全キャッシュ削除

# または再度デプロイ
npm run deploy
```

数分待機してから再度アクセス。

---

### 3️⃣ データ読み込みエラー

#### ❌ 「データが見つかりません」エラー

**症状:**
```
クイズセットを始める → エラー画面
コンソール (F12):
  ✗ Failed with path /spa-quiz-app/data/github-copilot/...
  ✗ All paths failed
```

**原因:**
- `public/data/` がない
- または GitHub Pages にデプロイされていない

**確認:**

```bash
# ローカル確認 (開発環境)
npm run dev
# F12 > Console タブ
# "Trying path: /data/..." が成功しているか確認
```

**解決:**

```bash
# 1. public/data/ を確認
ls public/data/

# 2. ない場合は作成
Copy-Item -Recurse "src\data" "public\data"

# 3. ビルド & デプロイ
npm run deploy

# 4. GitHub Pages で確認
# https://duwenji.github.io/spa-quiz-app/
# などのコンソール確認
```

---

#### ❌ ローカル開発で 404 エラー

**症状:**
```
npm run dev で起動
「クイズセットを始める」→ 404 Not Found
コンソール:
  GET http://localhost:5173/data/... 404
```

**原因:** `public/` フォルダが見つからない

**解決:**

```bash
# 確認
ls public/

# ない場合は作成
mkdir public
Copy-Item -Recurse "src\data" "public\data"

# Vite 開発サーバーを再起動
npm run dev
```

---

### 4️⃣ TypeScript エラー

#### ❌ `Argument of type 'string' is not assignable to parameter of type...`

**症状:**
```
TypeScript strict mode エラー
型チェックが厳しい
```

**原因:** 型定義が曖昧

**解決:**

```typescript
// ❌ 型が曖昧
const data = await response.json();

// ✅ 明確に型指定
const data = await response.json() as Question[];
```

---

#### ❌ `Cannot find module '@/...'` パスエイリアス

**症状:**
```
TypeScript が @/ パスをわからない
```

**原因:** `tsconfig.json` でパスエイリアスが設定されていない

**確認:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**注:** 現在のプロジェクトでは使用していません。

---

### 5️⃣ 開発環境の問題

#### ❌ `npm install` が失敗

**症状:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**原因:** 依存パッケージが競合している

**解決：**

```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -r node_modules
# または
Remove-Item -Recurse node_modules

# 再インストール
npm install
```

---

#### ❌ ローカル接続ができない

**症状:**
```
npm run dev を実行しても localhost:5173 に接続できない
```

**確認:**

1. **ポート 5173 が使用中でないか**
   ```bash
   netstat -ano | findstr :5173  # Windows
   lsof -i :5173                 # macOS/Linux
   ```

2. **Node プロセス確認**
   ```bash
   npm list
   ```

**解決:**

```bash
# Vite サーバーを再起動
npm run dev

# または host を明示的に指定
vite --host 0.0.0.0 --port 5173
```

---

### 6️⃣ React エラー

#### ❌ `Uncaught TypeError: hook can only be called inside a function component`

**原因:** カスタムフック（useQuiz）をコンポーネント外で呼び出している

**解決:**

```typescript
// ❌ コンポーネント関数外
const data = useQuiz(...);

// ✅ コンポーネント関数内
function MyComponent() {
  const data = useQuiz(...);
  return ...;
}
```

---

#### ❌ `Warning: Each child in a list should have a unique "key" prop`

**原因:** リスト要素に `key` prop がない

**解決:**

```jsx
// ❌
{items.map(item => <div>{item}</div>)}

// ✅
{items.map(item => <div key={item.id}>{item}</div>)}
```

---

### 7️⃣ ブラウザ問題

#### ❌ スタイルが反映されない

**症状:**
```
Tailwind CSS が適用されていない
```

**原因:**
- キャッシュ
- ダーク・モード設定
- CSS バンドリングエラー

**解決:**

```bash
# キャッシュクリア
Ctrl+Shift+Delete  # ブラウザ内から

# または
npm run build
npm run preview
```

---

#### ❌ 古いバージョンが表示される

**症状:**
```
デプロイ後もブラウザに古いアプリが表示されている
```

**原因:** Service Worker またはブラウザキャッシュ

**解決:**

```bash
# 1. ブラウザキャッシュをクリア
Ctrl+Shift+Delete

# 2. Hard Reload（キャッシュスキップ）
Ctrl+Shift+R  # Chrome/Firefox
Cmd+Shift+R   # Safari

# 3. プライベート・ウィンドウでアクセス
```

---

## 🔍 デバッグのコツ

### ブラウザコンソール（F12）で確認

```javascript
// BASE_URL を確認
console.log(import.meta.env.BASE_URL);

// ローカルストレージ確認
localStorage.getItem('quiz-history');

// ネットワークタブで失敗したリクエスト確認
// F12 > Network > Failed
```

### VS Code デバッグ設定

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## 📞 さらに困った場合

1. **コンソールエラーをスクリーンショット**
2. **エラーメッセージを grep_search で検索**
3. **GitHub Issues で確認**
   - [Vite Issues](https://github.com/vitejs/vite/issues)
   - [gh-pages Issues](https://github.com/tschaub/gh-pages/issues)
4. **関連ドキュメント参照**
   - [README.md](README.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)

