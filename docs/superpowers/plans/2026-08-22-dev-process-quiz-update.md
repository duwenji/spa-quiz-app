# Dev-Process Skill Library Quiz Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the `dev-process-skill-library-series` quiz sets in spa-quiz-app back into sync with the current state of the `dev-process-skill-library` source repo (last synced 2026-04-04), fixing questions that are now factually wrong and adding coverage for major content added since then, including a brand-new quiz section for the `060_development-method` skill.

**Architecture:** Both repos are plain git checkouts on disk (`C:\Dev\tutorials\dev-process-skill-library` = read-only source, `C:\Dev\tutorials\spa-quiz-app` = quiz app to edit). Quiz content lives as hand-authored JSON files under `spa-quiz-app/src/data/dev-process-skill-library/*.json` (source of truth — `public/data/` is a generated copy, regenerated via `npm run sync-data`, never edit it directly). Each of the 7 quiz sections is one JSON file with a flat `{ "questions": [...] }` array. A parallel `src/data/quizSets.json` holds the series/section registry consumed by the app UI, and `src/data/dev-process-skill-library/metadata.json` holds the series-level description/counts. All three are edited independently per section but must stay numerically consistent (question counts) — the final task reconciles them.

**Tech Stack:** Plain JSON content files, validated with Node scripts (`ajv`-based) invoked via `npm run validate:quiz` / `validate:metadata` / `validate:all`, no compilation needed for content changes. `npm run build` runs `sync-data` + `tsc` + `vite build`.

**Spec:** No separate spec doc — the spec is the research findings embedded directly in each task below, gathered by auditing the current `dev-process-skill-library` source against the existing quiz JSON (see task bodies for exact source quotes and file paths).

## Global Constraints

- Edit only files under `spa-quiz-app/src/data/...` — never edit `public/data/...` or `dist/data/...` directly (they are generated).
- Every question object requires exactly these fields, no more, no less (schema: `public/schemas/question-schema.json`, `additionalProperties: false`): `id` (number), `question` (non-empty string), `options` (array of **exactly 4** objects), `correctAnswer` (one of `"A"|"B"|"C"|"D"`), `explanation` (non-empty string).
- Every option object requires exactly `id` (`"A"|"B"|"C"|"D"`) and `text` (non-empty string), no extra fields.
- `id` values must be sequential integers starting at 1 within each file, in array order — when appending new questions, continue the existing max id upward, do not renumber existing ones.
- All Japanese question/answer/explanation text must be grounded in an actual quote or fact from the named source file — do not invent facts. Match the existing tone: formal, direct, single-best-answer multiple choice with 3 plausible-but-wrong distractors, explanation cites *why* the correct answer is right and briefly why the trap answer is wrong.
- After editing a file, immediately run `npm run validate:quiz` (spa-quiz-app root) and fix any schema violation before moving on.
- Do not touch `dev-process-skill-library` — it is the read-only source of truth for this task.

---

## Task 1: Fix and extend `intro-overview.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/intro-overview.json` (currently 12 questions, ids 1-12)
- Read for grounding: `dev-process-skill-library/skills/README.md` (absorbed the old usage-guide.md/taxonomy.md content — this is now the single source for this section), `dev-process-skill-library/skills/shared-templates/document-templates/README.md`, `dev-process-skill-library/skills/shared-references/document-architecture-principles.md`, `dev-process-skill-library/skills/shared-references/traceability-id-convention.md`, `dev-process-skill-library/skills/shared-templates/PATTERN-SELECTION-GUIDE.md`, `dev-process-skill-library/README.md` (3 learning-design principles), `dev-process-skill-library/skills/VALIDATION_CHECKLIST.md`

**Fix these 3 questions (currently wrong or citing deleted sources):**

- [ ] **Step 1: Fix Q4** — current question asks for the "usage-guide にある全体フロー" and its correct answer is the 6-step "リポジトリ配布 → Skill 選択 → SKILL.md に沿って実行 → 承認ゲート通過 → ログと出力物記録 → 更新申請". This flow no longer exists — `docs/usage-guide.md` was deleted and merged into `skills/README.md`, whose current "全体フロー" is 5 steps with **no distribution step**:
  ```
  1. 開発タスクに合う Skill を選ぶ
  2. SKILL.md を読んでフェーズを実行する
  3. 承認ゲートを通過させる
  4. ログ・出力物を残す
  5. 改善点があれば Skill 更新を申請する
  ```
  Rewrite the question stem to reference `skills/README.md`'s 使い方ガイド (not "usage-guide"), set the correct option to this 5-step flow, and write 3 wrong-order or wrong-step-count distractors (e.g. inserting a "リポジトリ配布" step, or omitting 承認ゲート). Update the explanation to cite `skills/README.md`.

- [ ] **Step 2: Fix Q3** — current question asks about "taxonomy に基づく Skill 適用順"; `docs/taxonomy.md` no longer exists and the word "taxonomy" appears nowhere in the repo. The underlying ordering fact is still true (要件・計画→設計・実装→検証・品質→運用・リリース, via the `010_`/`020_`/`030_`/`040_` folder numbering) but must now ALSO account for the new 6th category. Reword the stem to ask about the category/folder order without naming "taxonomy" as a document, and make sure the correct answer's category list includes all 6 current top-level categories in order: 要件・計画 → 設計・実装 → 検証・品質 → 運用・リリース → 学習・改善 (横断) → 開発方法論 (ddd-ai-responsibility, セット適用). Ground this in the current `skills/README.md` Skill 体系マップ section.

- [ ] **Step 3: Fix Q9 and Q10 explanations** — both explanations currently cite concepts that no longer exist in the source: Q9's explanation says "Pilot 実施はライブラリ導入計画の論点です" (Pilot/パイロット no longer appears anywhere in the repo — grep confirmed zero hits) and Q10's explanation says "導入前1か月をベースラインとし、導入後1か月と3か月の比較..." (this baseline methodology text no longer exists). Keep both questions' stems and correct answers if still defensible from current KPI/完了条件 lists in `skills/README.md`, but **rewrite the explanations** to cite only what's actually in the current 5-metric KPI list and current 最小完了条件 list — do not reference Pilot or the old baseline methodology.

**Add these 6 new questions covering content added since 2026-04-04 with zero current coverage (append as ids 13-18):**

- [ ] **Step 4: Add a question on the 成果物文書テンプレート system** — source: `skills/shared-templates/document-templates/README.md`. Testable fact: there are 15 templates indexed by a 2-4 letter ID prefix (REQ, DES, DM, ADR, API, REV, RFC, DEF, SEC, TS, OPS, PERF, REL, DOC, PMR), and every template shares a common skeleton section set (文書情報 / 目的・背景 / スコープ / 対応元ID / 方針・決定事項 / 制約 / 未決事項・リスク / 関連ドキュメント / 変更履歴). Write a question asking which section every 成果物文書テンプレート shares in common, or how many templates exist / what they're indexed by.

- [ ] **Step 5: Add a question on `document-architecture-principles.md`** — source: `skills/shared-references/document-architecture-principles.md`. Testable fact: one of its 5 principles is that traceability between documents is expressed via **backward links only** (逆リンクのみ) — there is deliberately no central aggregating traceability matrix — and another principle explicitly separates 実行ログ (execution log) from 成果物文書 (deliverable document) as different artifact types, and another notes プロセス構造とドキュメント構造は独立して変更する (citing a past failed attempt at renumbering stages as the reason). Write a question asking which of the 5 principles is correct (with distractors proposing a central matrix, or coupling doc structure to process stage numbering).

- [ ] **Step 6: Add a question on `traceability-id-convention.md`** — source: `skills/shared-references/traceability-id-convention.md`. Testable fact: ID format is `<prefix>-<3桁連番>` (e.g. `REQ-001`), and the postmortem report prefix is specifically `PMR` (not `PM`) because `PM` is already reserved for "プロジェクトマネージャー" in the glossary. Write a question asking for the correct ID format or why `PMR` (not `PM`) is used for postmortem reports.

- [ ] **Step 7: Add a question on the 3 implementation patterns / 2 structural exceptions** — source: `skills/shared-templates/PATTERN-SELECTION-GUIDE.md`. Testable fact: the 3 patterns are パターンA調査・検証型 / パターンB意思決定・設計型 / パターンC運用手続き型, and there are exactly 2 sanctioned "構造例外" (Skills that don't follow any of the 3 patterns): known-how-ingestion and ddd-ai-responsibility (060_development-method). Write a question asking which two Skills are the sanctioned structural exceptions, or which pattern a given example Skill belongs to.

- [ ] **Step 8: Add a question on the 3 learning-design principles** — source: `dev-process-skill-library/README.md`. Testable fact: the 3 principles are (1) 教育コンテキストをAI実行手順と分離する, (2) 振り返りを証跡ログに組み込む, (3) AIスコープ境界を明示する — implemented via an `<!-- AI実行対象外 -->` HTML comment marker in SKILL.md files to mark human-only educational content that AI should not execute as instructions. Write a question asking what the `<!-- AI実行対象外 -->` marker is for.

- [ ] **Step 9: Add a question on the new 060_development-method category** — source: `skills/README.md` Skill 体系マップ. Testable fact: as of now there are 6 top-level Skill categories (010-060), with 060_development-method (ddd-ai-responsibility) being the newest, applied together with (セットで使う) other Skills rather than standalone in the main flow. Write a question asking how many top-level Skill categories currently exist, or what 060_development-method's Skill is.

- [ ] **Step 10: Update `metadata.json` question count for this section** to match the new total (18) — see Task 8 for the full cross-file reconciliation; you may defer the actual metadata.json edit to Task 8, but note the new count here for that task.

- [ ] **Step 11: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `intro-overview.json`

- [ ] **Step 12: Commit**

```bash
git add src/data/dev-process-skill-library/intro-overview.json
git commit -m "content: sync intro-overview quiz with current skill library (fix 3, add 6)"
```

---

## Task 2: Extend `requirements-planning.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/requirements-planning.json` (currently 10 questions, ids 1-10, all still factually correct — no fixes needed)
- Read for grounding: `dev-process-skill-library/skills/010_requirements-and-planning/010_requirements-refinement/SKILL.md`, `runbook.md`

**Add these 4 new questions (append as ids 11-14):**

- [ ] **Step 1: Add a question on the 成果物文書 completion criterion** — the Skill's 完了条件 now includes a 6th bullet requiring the deliverable document to satisfy `requirements-definition-document-template.md`'s required sections — this bullet doesn't exist in the quiz. Write a question asking what was added to the 完了条件 list.

- [ ] **Step 2: Add a question on the `REQ-xxx` traceability ID prefix** — this Skill's outputs are tagged `REQ-xxx`. Write a question asking which prefix this Skill's deliverable document uses (distractors: DES, ADR, DM).

- [ ] **Step 3: Add a question distinguishing the 3 実行モード (strict/speed/balance)** — the existing quiz only tests the "speed" mode (Q6); write a question that requires distinguishing strict vs. speed vs. balance mode behavior per the SKILL.md's 実行モード table.

- [ ] **Step 4: Add a question on 前提/次のステップ** — this Skill has no prerequisite (前提: なし — it's the entry point of the whole library), and its 次のステップ are `data-model-design-unified` and `api-contract-design`. Write a question asking which Skill(s) come right after requirements-refinement, or confirming it has no prerequisite.

- [ ] **Step 5: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `requirements-planning.json`

- [ ] **Step 6: Commit**

```bash
git add src/data/dev-process-skill-library/requirements-planning.json
git commit -m "content: extend requirements-planning quiz with 4 new questions"
```

---

## Task 3: Extend `design-implementation.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/design-implementation.json` (currently 20 questions, ids 1-20, all still factually correct — no fixes needed)
- Read for grounding: `dev-process-skill-library/skills/020_design-and-implementation/{010_api-contract-design,020_architecture-decision-record,030_code-review-assistant,040_data-model-design-unified,050_feature-implementation-unified,060_refactoring-safety}/SKILL.md`

**Add these 6 new questions (append as ids 21-26):**

- [ ] **Step 1: Add a question on the 6 traceability ID prefixes** — `DES-xxx` (feature-implementation-unified), `DM-xxx` (data-model-design-unified), `ADR-xxx` (architecture-decision-record), `API-xxx` (api-contract-design), `REV-xxx` (code-review-assistant), `RFC-xxx` (refactoring-safety). Write a question asking to match a Skill to its correct prefix (pick one pairing as correct, 3 wrong pairings as distractors).

- [ ] **Step 2: Add a question on refactoring-safety's prerequisite** — its explicit 前提 is `test-strategy-unified`, with the caveat "テストがない場合は先に整備する" (if there's no test coverage yet, establish it first, before refactoring). Write a question asking what must precede a refactoring-safety run when test coverage is missing.

- [ ] **Step 3: Add a question on feature-implementation-unified's unique 対応元ID requirement** — unlike the other 5 design/implementation Skills, its 完了条件 uniquely also requires "対応元IDが上流の要件定義書のIDで埋まっている" (the upstream requirement ID must be filled in). Write a question asking which Skill has this unique traceability requirement.

- [ ] **Step 4: Add a question on the feature-implementation-unified vs. defect-repair-unified boundary** — feature-implementation-unified explicitly distinguishes itself: "不具合原因の特定と修正が主目的" (defect-repair) vs. "新規要求または仕様変更の実現が主目的" (feature-implementation). Write a question asking which Skill to use for a new feature vs. a bug fix.

- [ ] **Step 5: Add a question on ADR's prerequisite** — architecture-decision-record's 前提 is `requirements-refinement`. Write a question asking what must precede writing an ADR.

- [ ] **Step 6: Add a question on the "このスキルが解く問題" framing for api-contract-design** — its educational framing states: "API は「約束」。変えるコストが大きいため設計段階に最大の思考を投資する" (an API is a "promise" — because changing it later is expensive, invest maximum thought at design time). Write a question asking why api-contract-design invests heavily at the design stage before implementation.

- [ ] **Step 7: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `design-implementation.json`

- [ ] **Step 8: Commit**

```bash
git add src/data/dev-process-skill-library/design-implementation.json
git commit -m "content: extend design-implementation quiz with 6 new questions"
```

---

## Task 4: Extend `verification-quality.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/verification-quality.json` (currently 16 questions, ids 1-16, all still factually correct — no fixes needed)
- Read for grounding: `dev-process-skill-library/skills/030_verification-and-quality/{010_defect-repair-unified,020_security-hardening,030_test-strategy-unified}/SKILL.md`

**Add these 5 new questions (append as ids 17-21):**

- [ ] **Step 1: Add a question on the 3 traceability ID prefixes** — `DEF-xxx` (defect-repair-unified), `SEC-xxx` (security-hardening), `TS-xxx` (test-strategy-unified). Write a matching question.

- [ ] **Step 2: Add a question on security-hardening's explicit scope exclusions** — its 対象外・非対象 section states 侵入テストや脆弱性診断の実施自体は本Skillの範囲外 (penetration testing / vulnerability scanning execution itself is out of scope) and 秘密情報をログに残さない (never leave secrets in logs). Write a question asking what is explicitly OUT of scope for security-hardening.

- [ ] **Step 3: Add a question on defect-repair-unified's Phase 1 minimum required output** — its 各Phase完了時の最小必須出力 for Phase 1 requires: 調査報告書 / 処理フロー図 / 対応案3案以上 (an investigation report, a process flow diagram, and at least 3 candidate fix proposals). Write a question asking what Phase 1 of defect-repair-unified must produce at minimum.

- [ ] **Step 4: Add a question on security-hardening's residual-risk rule** — accepted (受容した) residual risks must be recorded with a 期限と再確認条件 (a deadline and a recheck condition) — you cannot just accept a risk and move on. Write a question asking what must accompany an accepted residual risk.

- [ ] **Step 5: Add a question on the 前提/次 chain for security-hardening** — 前提: requirements-refinement, セットで使う: api-contract-design, 次: release-readiness. Write a question asking what Skill typically follows security-hardening.

- [ ] **Step 6: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `verification-quality.json`

- [ ] **Step 7: Commit**

```bash
git add src/data/dev-process-skill-library/verification-quality.json
git commit -m "content: extend verification-quality quiz with 5 new questions"
```

---

## Task 5: Extend `operations-release.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/operations-release.json` (currently 15 questions, ids 1-15, all still factually correct — no fixes needed)
- Read for grounding: `dev-process-skill-library/skills/040_operations-and-release/{010_observability-and-ops-readiness,020_performance-investigation,030_release-readiness}/SKILL.md`

**Add these 4 new questions (append as ids 16-19):**

- [ ] **Step 1: Add a question on the 3 traceability ID prefixes** — `REL-xxx` (release-readiness), `PERF-xxx` (performance-investigation), `OPS-xxx` (observability-and-ops-readiness). Write a matching question.

- [ ] **Step 2: Add a question on release-readiness's dual prerequisite** — unlike most Skills with a single 前提, release-readiness explicitly requires **both** `test-strategy-unified` AND `observability-and-ops-readiness` as prerequisites. Write a question asking which two Skills must both precede release-readiness (distractors: pick single-Skill or wrong-pair answers).

- [ ] **Step 3: Add a question on observability-and-ops-readiness's self-check** — its 実行前の自己確認 includes: "アラートの誤報が多いと運用が崩壊すると理解している（閾値設計の重要性）" (understanding that too many false-positive alerts collapse operations — i.e. threshold design matters). Write a question asking why alert-threshold design is emphasized before executing this Skill.

- [ ] **Step 4: Add a question on performance-investigation's 段階7 gate criteria** (already partially tested in Q5 — go deeper) — the full gate requires 症状と目標値 / 仮説と計測方法 / 優先順位 to all be defined before proceeding. Pick one facet not yet covered by the existing question and write a new question on it (e.g. asking specifically what "目標値" must be paired with).

- [ ] **Step 5: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `operations-release.json`

- [ ] **Step 6: Commit**

```bash
git add src/data/dev-process-skill-library/operations-release.json
git commit -m "content: extend operations-release quiz with 4 new questions"
```

---

## Task 6: Extend `learning-improvement.json`

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/learning-improvement.json` (currently 14 questions, ids 1-14, all still factually correct — no fixes needed)
- Read for grounding: `dev-process-skill-library/skills/050_learning-and-improvement/{010_documentation-sync,020_incident-postmortem,030_known-how-ingestion}/SKILL.md`, `dev-process-skill-library/skills/shared-templates/PATTERN-SELECTION-GUIDE.md`

**Add these 5 new questions (append as ids 15-19):**

- [ ] **Step 1: Add a question on known-how-ingestion's structural exception status** — unlike the standard 段階1-14/Phase1-4 pattern used elsewhere, known-how-ingestion uses **5 stages** (Intake → Structuring → Codification → Publishing → Improvement Loop) with only **2** approval points, and the approver role is "ユーザ" (any user), not "開発者" — this is one of only 2 sanctioned 構造例外 in the whole library (the other being ddd-ai-responsibility, see Task 7). Write a question asking how many stages known-how-ingestion uses and who its approver is.

- [ ] **Step 2: Add a question on known-how-ingestion's 削除判定基準** — its 操作種別と判定基準 table's trigger for 削除 (deletion) of a knowledge item is specifically "陳腐化・重複・**90日未参照**" (obsolete, duplicate, or unreferenced for 90 days). Write a question asking what the numeric threshold for considering a knowledge item for deletion is.

- [ ] **Step 3: Add a question on known-how-ingestion's 4 操作種別** — 新規生成 / 既存改善 / マージ / 削除. Write a question asking which of these 4 operation types applies to a given scenario (e.g. two near-duplicate knowledge entries should be handled via which operation — マージ).

- [ ] **Step 4: Add a question on the traceability ID prefixes** — `PMR-xxx` (incident-postmortem — note: NOT `PM-xxx`, since `PM` is reserved for プロジェクトマネージャー in the glossary, see Task 1 Step 6) and `DOC-xxx` (documentation-sync). Write a question asking for incident-postmortem's correct prefix, using the PM-vs-PMR distinction as the key distractor.

- [ ] **Step 5: Add a question on documentation-sync's relationship to feature-implementation-unified** — documentation-sync runs "直前" (immediately following) relative to feature-implementation-unified in typical sequencing. Write a question asking when documentation-sync is typically triggered.

- [ ] **Step 6: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`
Expected: PASS with no schema errors for `learning-improvement.json`

- [ ] **Step 7: Commit**

```bash
git add src/data/dev-process-skill-library/learning-improvement.json
git commit -m "content: extend learning-improvement quiz with 5 new questions"
```

---

## Task 7: Create new `development-method.json` section

**Files:**
- Create: `spa-quiz-app/src/data/dev-process-skill-library/development-method.json`
- Read for grounding: `dev-process-skill-library/skills/060_development-method/README.md`, `010_ddd-ai-responsibility/SKILL.md`, `010_ddd-ai-responsibility/runbook.md`, `dev-process-skill-library/skills/shared-templates/PATTERN-SELECTION-GUIDE.md` (for the 構造例外 framing)

**Interfaces:**
- Produces: a JSON file with the same shape as every other section file — `{ "questions": [ {id, question, options[4], correctAnswer, explanation}, ... ] }`, 14 questions with ids 1-14 — this file's path and question count are consumed by Task 8 when wiring it into `metadata.json` and `quizSets.json`.

**Write 14 questions covering (one question per fact, use the exact facts below — do not invent additional facts):**

- [ ] **Step 1: Q1 — purpose/problem this Skill solves.** Fact: in DDD, if AI's role per phase is left unclear, domain-expert judgment gets outsourced to AI wholesale; AI requests must be scoped to "たたき台生成" (draft generation) only, because otherwise the AI's hypothesis gets frozen into the model. Correct answer should reflect this scoping principle; distractors should propose letting AI make final domain decisions.

- [ ] **Step 2: Q2 — prerequisites and companion Skills.** Fact: 前提 = `010_requirements-refinement`; セットで使う = `040_data-model-design-unified` (modeling phase) and `050_feature-implementation-unified` (implementation phase). Write a question asking what must precede ddd-ai-responsibility, or which Skills it's typically paired with.

- [ ] **Step 3: Q3 — the 6 DDD phases in order.** Fact: 1) 要件定義・ドメイン理解 2) モデリング 3) 設計 4) 実装 5) テスト・品質 6) 運用・進化. Write a question asking for the correct phase order (distractors: shuffle 2 adjacent phases, or omit one).

- [ ] **Step 4: Q4 — Phase 1 AI/human split.** Fact: AI can summarize docs, list business terms, draft business-flow, enumerate common requirements/constraints. Human decides: business value/essence, core vs. auxiliary scope, which requirements to adopt/discard, constraint priority, final Ubiquitous Language. Gate: "用語と業務目的の認識差が解消されていること". Write a question asking what the human (not AI) must decide in Phase 1.

- [ ] **Step 5: Q5 — Phase 2 (Modeling) AI/human split.** Fact: AI proposes entities, value objects, aggregates, bounded-context candidates (via noun extraction / class-diagram drafts). Human decides: entity-vs-value-object judgment, bounded context boundaries, where domain rules live. Gate: "モデルが業務を過不足なく説明できること". Write a question asking what AI may propose vs. what only a human may decide in the modeling phase.

- [ ] **Step 6: Q6 — Phase 3 (Design) AI/human split.** Fact: AI proposes layer structure, DDL/API drafts, exception patterns. Human decides: responsibility separation validity, normalization/performance tradeoffs, public-interface stability policy, "where to stop vs. continue on error". Gate: "モデル意図と設計方針が矛盾していないこと". Write a question on this gate condition or the human-decision list.

- [ ] **Step 7: Q7 — Phase 4 (Implementation) AI/human split.** Fact: AI does CRUD/boilerplate, refactoring proposals, comments. Human decides: domain-rule placement, whether to apply a refactor, business meaning/背景 supplementation. Gate: "ルール配置と実装責務が説明できること". Write a question on what AI is trusted to do unsupervised at implementation time vs. not.

- [ ] **Step 8: Q8 — Phase 5 (Test/Quality) AI/human split.** Fact: AI proposes unit-test coverage cases, IT/ST scenario candidates, edge/error-case enumeration. Human decides: priority of critical logic, which observations feed recurrence-prevention, real-world severity judgment. Gate: "重要ロジックの検証漏れがないこと". Write a question on this gate or the human-decision list.

- [ ] **Step 9: Q9 — Phase 6 (Ops/Evolution) AI/human split.** Fact: AI does log/alert summarization, similar-incident search, impact-scope mapping. Human decides: root-cause interpretation, direction of evolution, whether the domain model itself should change. Gate: "短期対処と中長期改善が切り分けられていること". Write a question on this gate or the human-decision list.

- [ ] **Step 10: Q10 — who approves at every phase.** Fact: the 判定基準一覧 table lists 確認者 as "人" (a human) for all 6 phases — never AI. Write a question asking who signs off at each DDD phase in this Skill.

- [ ] **Step 11: Q11 — DDD glossary term matching.** Fact: `runbook.md` defines 10 terms — ドメイン, エンティティ, 値オブジェクト, 集約, リポジトリ, サービス, ファクトリ, ユビキタス言語, バウンデッドコンテキスト, ドメインイベント — each with a one-line definition. Pick 2-3 terms and write a definition-matching question (e.g. "業務ルールを整合性の単位としてまとめたオブジェクト群" → 集約).

- [ ] **Step 12: Q12 — structural exception status.** Fact: unlike the other 15 Skills, ddd-ai-responsibility has NO Phase1-4/段階1-14/3-gate structure, no `sub-skills/`, no `assets/` — everything lives in `runbook.md`; it's sanctioned in `PATTERN-SELECTION-GUIDE.md`'s "パターン外: 構造例外" alongside known-how-ingestion (see Task 6 Step 1). Write a question asking which structural pattern ddd-ai-responsibility follows (correct: none — it's a sanctioned exception).

- [ ] **Step 13: Q13 — no own deliverable document.** Fact: "本Skill単体の成果物文書は持たない。実行結果は前提/セットで使うスキル（architecture-decision-record, data-model-design-unified, feature-implementation-unified 等）の成果物文書に反映する". Write a question asking where this Skill's output gets recorded, given it produces no document of its own.

- [ ] **Step 14: Q14 — 完了条件.** Fact: (a) AIへの依頼文と人の確認観点が揃っている, (b) AI出力を採用するかどうかの判断理由が説明できる, (c) ドメイン意味・境界・責任の所在が曖昧なまま次フェーズへ進まない. Write a question asking which of these is/isn't a valid completion criterion (use a plausible-but-wrong distractor like "AIが承認する" as one of the wrong options).

- [ ] **Step 15: Validate**

Run: `cd spa-quiz-app && npm run validate:quiz`

Note: `invoke-validate.ps1 -Mode quiz` may validate all files under the directory or require a target — check the script's parameter handling (`.github/skills-config/quiz-generator/invoke-validate.ps1`) and pass the new file explicitly if it takes a path argument, otherwise confirm it auto-discovers `development-method.json` since it now sits alongside the other section files.

Expected: PASS with no schema errors for `development-method.json`

- [ ] **Step 16: Commit**

```bash
git add src/data/dev-process-skill-library/development-method.json
git commit -m "content: add new development-method quiz section (14 questions)"
```

---

## Task 8: Reconcile `metadata.json` and `quizSets.json`, validate, and build

**Files:**
- Modify: `spa-quiz-app/src/data/dev-process-skill-library/metadata.json`
- Modify: `spa-quiz-app/src/data/quizSets.json`

**Interfaces:**
- Consumes: final question counts from Tasks 1-7 — intro-overview: 18, requirements-planning: 14, design-implementation: 26, verification-quality: 21, operations-release: 19, learning-improvement: 19, development-method: 14 (new). Total: **131** (was 87).

- [ ] **Step 1: Update `metadata.json`** — set `series.totalQuestions` to 131, update each existing section's `questionCount` to its new value (18/14/26/21/19/19), and append a new section object for `development-method` after `learning-improvement` (order: 7):
  ```json
  {
    "id": "development-method",
    "order": 7,
    "name": "開発方法論（DDD×AI責任分担）",
    "description": "ドメイン駆動設計の各フェーズでAIと人がどちらを判断するかを学ぶ",
    "questionCount": 14,
    "difficulty": "advanced",
    "estimatedTime": "35-45 minutes",
    "keyTopics": [
      "DDDフェーズ別AI/human分担",
      "ユビキタス言語",
      "バウンデッドコンテキスト",
      "構造例外",
      "ドメインイベント"
    ]
  }
  ```
  Also update `series.description` and `series.estimatedDuration` to reflect the new total (currently says "87 問" / "5-6 hours" — recompute a reasonable duration estimate proportionally, e.g. "7-8 hours").

- [ ] **Step 2: Update `quizSets.json`** — find the `dev-process-skill-library` (parent, `level: 1`) entry and update its `questionCount` to 131 and `description` text (currently says "87 問"). Update each existing child entry's (`dev-process-intro-overview`, `dev-process-requirements-planning`, `dev-process-design-implementation`, `dev-process-verification-quality`, `dev-process-operations-release`, `dev-process-learning-improvement`) `questionCount` field to match Task 1-6's new totals. Append one new child entry:
  ```json
  {
    "id": "dev-process-development-method",
    "name": "開発方法論（DDD×AI責任分担）",
    "description": "ドメイン駆動設計の6フェーズでAIと人の役割分担を判断する力を養う",
    "category": "技術",
    "icon": "🧬",
    "questionCount": 14,
    "difficulty": "advanced",
    "dataPath": "dev-process-skill-library/development-method.json",
    "parentId": "dev-process-skill-library",
    "group": "dev-process-skill-library-series",
    "level": 2,
    "order": 7
  }
  ```
  (Pick an `icon` not already used by a sibling entry — check the other 6 dev-process child entries' icons first and choose something distinct, e.g. 🧬 is a placeholder, swap if it collides.)

- [ ] **Step 3: Run full validation**

Run: `cd spa-quiz-app && npm run validate:all`
Expected: PASS — both quiz-schema and metadata-schema validation succeed for all 7 section files plus `metadata.json` and `quizSets.json`. If it fails, read the error output, fix the offending file, and re-run.

- [ ] **Step 4: Sync and build**

Run: `cd spa-quiz-app && npm run build`
Expected: succeeds (this runs `sync-data` which copies `src/data` → `public/data`, then `tsc -b`, then `vite build`) with no TypeScript or Vite errors.

- [ ] **Step 5: Manual spot-check in the running app**

Run: `cd spa-quiz-app && npm run dev`, open the app, navigate to the "開発プロセス標準化 Skill ライブラリ" series, confirm all 7 sections (including the new 開発方法論 one) appear with correct question counts, open a few of the newly-added questions in each section and confirm they render correctly (4 options, correct answer highlights, explanation shows). Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/data/dev-process-skill-library/metadata.json src/data/quizSets.json
git commit -m "content: reconcile dev-process quiz metadata after full content sync (87 -> 131 questions, +1 section)"
```

---

## Self-Review Notes

- **Spec coverage:** every "missing topic" and "outdated question" identified in the research audit is assigned to exactly one task/step above; the 060_development-method new-section content (15 candidate facts identified) was trimmed to the 14 most distinct/testable ones for Task 7 to match the sibling sections' question-count scale.
- **Placeholder scan:** every add/fix step names the exact source file and quotes the exact fact/table/number to test, rather than saying "add appropriate questions" — the only thing left to the executor is MC phrasing and distractor wording, not fact discovery.
- **Type/shape consistency:** question/option JSON shape, id sequencing rule, and the `metadata.json`/`quizSets.json` field names used in Task 8 match the schema fields confirmed via `validate-quiz-questions.mjs`/`validate-quiz-metadata.mjs` during the research pass — no invented fields.
- **Ordering:** Tasks 1-7 are fully independent of each other (separate files, no shared state) and can be executed in parallel; Task 8 has a hard dependency on the final question counts from all of Tasks 1-7 and must run last.
