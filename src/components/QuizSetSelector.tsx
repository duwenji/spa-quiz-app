import { useMemo, useState } from 'react';
import { QuizSet } from '../types';

interface QuizSetSelectorProps {
  quizSets: QuizSet[];
  onSelectQuizSet: (quizSet: QuizSet) => void;
}

// カテゴリとグループで整理されたクイズセット構造
interface OrganizedQuizSets {
  category: string;
  groups: {
    groupName: string | null;
    sets: QuizSet[];
  }[];
}

type DifficultyFilter = 'all' | QuizSet['difficulty'];

const difficultyItems: Array<{ value: DifficultyFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
  { value: 'beginner to intermediate', label: '初中級' },
  { value: 'beginner to advanced', label: '初級〜上級' },
];

const organizeQuizSets = (quizSets: QuizSet[]): OrganizedQuizSets[] => {
  // カテゴリで分類（親セット除外：group が存在し parentId が null のセット）
  const byCategory = new Map<string, QuizSet[]>();
  
  for (const set of quizSets) {
    // 親セット（グループ有且つ parentId 無）は UI 表示から除外
    if (set.group && set.parentId === null) {
      continue;
    }
    if (!byCategory.has(set.category)) {
      byCategory.set(set.category, []);
    }
    byCategory.get(set.category)!.push(set);
  }

  // 各カテゴリ内でグループで分類
  const organized: OrganizedQuizSets[] = [];
  
  for (const [category, sets] of byCategory.entries()) {
    const byGroup = new Map<string | null, QuizSet[]>();
    
    for (const set of sets) {
      const key = set.group ?? null;
      if (!byGroup.has(key)) {
        byGroup.set(key, []);
      }
      byGroup.get(key)!.push(set);
    }

    // グループ内でorderでソート
    const groups = Array.from(byGroup.entries()).map(([groupName, groupSets]) => ({
      groupName,
      sets: groupSets.sort((a, b) => a.order - b.order),
    }));

    organized.push({
      category,
      groups,
    });
  }

  return organized;
};

const getGroupLabel = (group: string | null, sets: QuizSet[]): string => {
  if (!group) return '';
  
  // グループの親セットを見つける
  const parentSet = sets.find(s => s.level === 1 && s.group === group);
  if (parentSet) {
    return `${parentSet.icon} ${parentSet.name.split(' ').slice(0, 3).join(' ')} Series`;
  }
  return group;
};

const isDisplayableSet = (set: QuizSet): boolean => !(set.group && set.parentId === null);

const difficultyLabel = (difficulty: QuizSet['difficulty']): string => {
  const found = difficultyItems.find((item) => item.value === difficulty);
  return found ? found.label : difficulty;
};

export const QuizSetSelector = ({ quizSets, onSelectQuizSet }: QuizSetSelectorProps) => {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [isConditionExpanded, setIsConditionExpanded] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const parentSetMap = useMemo(
    () => new Map(quizSets.map((set) => [set.id, set])),
    [quizSets]
  );

  const filteredQuizSets = useMemo(() => {
    return quizSets.filter((set) => {
      if (!isDisplayableSet(set)) {
        return false;
      }

      const parentSet = set.parentId ? parentSetMap.get(set.parentId) : null;
      const difficultyMatch = difficulty === 'all' || set.difficulty === difficulty;
      const textMatch =
        normalizedQuery.length === 0 ||
        [
          set.name,
          set.description,
          set.category,
          set.group ?? '',
          parentSet?.name ?? '',
          parentSet?.description ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return difficultyMatch && textMatch;
    });
  }, [quizSets, difficulty, normalizedQuery, parentSetMap]);

  const organized = useMemo(() => organizeQuizSets(filteredQuizSets), [filteredQuizSets]);

  const totalDisplayable = useMemo(
    () => quizSets.filter(isDisplayableSet).length,
    [quizSets]
  );

  const visibleCount = useMemo(
    () => organized.flatMap((section) => section.groups).flatMap((group) => group.sets).length,
    [organized]
  );

  const hasActiveQuery = query.trim().length > 0;
  const hasActiveDifficulty = difficulty !== 'all';
  const showReset = hasActiveQuery || hasActiveDifficulty;
  const activeFilterCount = (hasActiveQuery ? 1 : 0) + (hasActiveDifficulty ? 1 : 0);

  const handleResetFilters = () => {
    setQuery('');
    setDifficulty('all');
  };

  const clearQuery = () => setQuery('');
  const clearDifficulty = () => setDifficulty('all');

  return (
      <div className="selector-shell relative min-h-screen overflow-hidden px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-lime-300/25 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 sm:space-y-8">
        <section className="selector-fade-in rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_16px_45px_-20px_rgba(17,24,39,0.55)] backdrop-blur-sm sm:rounded-3xl sm:p-10">
          <div className="mb-5 sm:mb-7">
            <p className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              QUIZ NAVIGATOR
            </p>
            <h1 className="mb-2 text-2xl font-black leading-tight text-slate-900 sm:mb-3 sm:text-5xl" style={{ fontFamily: '"Zen Kaku Gothic New", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif' }}>
              クイズセットを選択
            </h1>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-base">
              キーワード検索と難易度フィルタで、今の自分に合う学習セットをすばやく見つけられます。
            </p>
          </div>

          <div className="selector-control-panel grid gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-sm sm:gap-4 sm:p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <label className="block" htmlFor="quiz-search-input">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">キーワード検索</span>
              <input
                id="quiz-search-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例: Clean Architecture / GitHub Copilot"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 sm:px-4 sm:py-3"
              />
            </label>

            <div className="flex items-center justify-between gap-3 sm:justify-self-end sm:justify-start">
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">表示件数</p>
                <p className="text-lg font-black text-slate-900">
                  {visibleCount}
                  <span className="ml-1 text-sm font-semibold text-slate-500">/ {totalDisplayable}</span>
                </p>
              </div>
              {showReset && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:px-4"
                >
                  リセット
                </button>
              )}
            </div>
          </div>

          <div className="selector-chip-row mt-4 flex gap-2 overflow-x-auto px-0.5 pb-1" role="group" aria-label="難易度フィルタ">
            {difficultyItems.map((item) => {
              const active = difficulty === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficulty(item.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                    active
                      ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {showReset && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  検索条件 ({activeFilterCount})
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConditionExpanded((prev) => !prev)}
                    aria-expanded={isConditionExpanded}
                    aria-controls="active-filter-details"
                    className="text-xs font-bold text-sky-700 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-900"
                  >
                    {isConditionExpanded ? '詳細を閉じる' : '詳細表示'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-800"
                  >
                    すべてクリア
                  </button>
                </div>
              </div>

              {!isConditionExpanded && (
                <p className="mt-2 text-xs text-slate-600">
                  {hasActiveQuery && `キーワード: ${query.trim()}`}
                  {hasActiveQuery && hasActiveDifficulty && ' / '}
                  {hasActiveDifficulty && `難易度: ${difficultyLabel(difficulty)}`}
                </p>
              )}

              {isConditionExpanded && (
                <div id="active-filter-details" className="mt-3 flex flex-wrap gap-2">
                  {hasActiveQuery && (
                    <button
                      type="button"
                      onClick={clearQuery}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-50"
                      aria-label="キーワード条件を解除"
                    >
                      <span>キーワード: {query.trim()}</span>
                      <span className="text-[10px]">×</span>
                    </button>
                  )}

                  {hasActiveDifficulty && (
                    <button
                      type="button"
                      onClick={clearDifficulty}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                      aria-label="難易度条件を解除"
                    >
                      <span>難易度: {difficultyLabel(difficulty)}</span>
                      <span className="text-[10px]">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {organized.length === 0 && (
          <section className="selector-fade-in rounded-2xl border border-amber-200 bg-amber-50/85 p-5 text-center shadow-sm sm:p-8">
            <h2 className="mb-2 text-xl font-black text-amber-900 sm:text-2xl">条件に合うクイズが見つかりません</h2>
            <p className="mb-5 text-sm text-amber-800">
              キーワードを短くするか、難易度を「すべて」に戻して再検索してみてください。
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-amber-300 bg-white px-5 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              フィルタをクリア
            </button>
          </section>
        )}

        <div className="space-y-4 sm:space-y-6">
          {organized.map((section, sectionIndex) => (
            <section
              key={section.category}
              className="selector-fade-in rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_10px_35px_-20px_rgba(17,24,39,0.4)] sm:p-7"
              style={{ animationDelay: `${Math.min(sectionIndex * 70, 280)}ms` }}
            >
              <h2 className="mb-4 inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-50 via-sky-50 to-emerald-50 px-3 py-2 text-lg font-black text-slate-900 sm:mb-5 sm:px-4 sm:text-2xl">
                {section.category}
              </h2>

              <div className="space-y-5">
                {section.groups.map((group, idx) => (
                  <div
                    key={`${section.category}-${group.groupName ?? 'ungrouped'}-${idx}`}
                    className={
                      group.groupName
                        ? 'rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/60 p-3 sm:p-4'
                        : 'rounded-2xl p-1'
                    }
                  >
                    {group.groupName && (
                      <h3 className="mb-3 border-l-4 border-sky-500 pl-3 text-xs font-black tracking-wide text-sky-900 sm:mb-4 sm:text-base">
                        {getGroupLabel(group.groupName, quizSets)}
                      </h3>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.sets.map((quizSet) => (
                        <button
                          key={quizSet.id}
                          type="button"
                          onClick={() => onSelectQuizSet(quizSet)}
                          className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-200 sm:p-5"
                        >
                          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-500">
                            <span>{section.category}</span>
                            {quizSet.parentId && (
                              <>
                                <span>›</span>
                                <span className="max-w-[160px] truncate">
                                  {parentSetMap.get(quizSet.parentId)?.name}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-2xl leading-none sm:text-3xl">{quizSet.icon}</span>
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                              {difficultyLabel(quizSet.difficulty)}
                            </span>
                          </div>

                          <h3 className="mb-2 line-clamp-2 text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-sky-700">
                            {quizSet.name}
                          </h3>

                          <p className="mb-4 line-clamp-2 text-sm text-slate-600">{quizSet.description}</p>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-xs font-semibold text-slate-500">選択して開始</span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              {quizSet.questionCount}問
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-2xl border border-white/80 bg-white/90 p-5 text-center shadow-sm sm:p-8">
          <h3 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">クイズの特徴</h3>
          <ul className="inline-block space-y-2 text-left text-sm text-slate-700 sm:text-base">
            <li>✓ 各セットで選択肢問題に挑戦</li>
            <li>✓ 学習履歴の自動保存</li>
            <li>✓ JSONとCSV形式でダウンロード対応</li>
            <li>✓ 復習機能で弱点克服</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

