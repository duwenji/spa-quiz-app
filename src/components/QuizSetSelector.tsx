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

const organizeQuizSets = (quizSets: QuizSet[]): OrganizedQuizSets[] => {
  // カテゴリで分類
  const byCategory = new Map<string, QuizSet[]>();
  
  for (const set of quizSets) {
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

export const QuizSetSelector = ({ quizSets, onSelectQuizSet }: QuizSetSelectorProps) => {
  const organized = organizeQuizSets(quizSets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">📚 クイズセットを選択</h1>
          <p className="text-blue-100 text-lg">学びたい分野を選んで、クイズに挑戦しましょう！</p>
        </div>

        <div className="space-y-8">
          {organized.map((section) => (
            <div key={section.category} className="bg-white rounded-lg shadow-lg p-6">
              {/* カテゴリ見出し */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-200">
                {section.category}
              </h2>

              {/* グループごとの表示 */}
              <div className="space-y-6">
                {section.groups.map((group, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      group.groupName
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
                        : 'bg-transparent border-0'
                    }`}
                  >
                    {/* グループ見出し（グループが存在する場合） */}
                    {group.groupName && (
                      <h3 className="text-lg font-semibold text-blue-900 mb-4 pl-2 border-l-4 border-blue-500">
                        {getGroupLabel(group.groupName, group.sets)}
                      </h3>
                    )}

                    {/* クイズセットグリッド */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.sets.map((quizSet) => (
                        <button
                          key={quizSet.id}
                          onClick={() => onSelectQuizSet(quizSet)}
                          className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-5 text-left cursor-pointer border-l-4 border-blue-400 hover:border-blue-600"
                        >
                          {/* パンくずリスト */}
                          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                            <span>{section.category}</span>
                            {quizSet.parentId && (
                              <>
                                <span>›</span>
                                <span className="max-w-[150px] truncate">
                                  {quizSets.find(s => s.id === quizSet.parentId)?.name}
                                </span>
                              </>
                            )}
                          </div>

                          {/* カード上部：アイコンと難易度 */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">{quizSet.icon}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                              {quizSet.difficulty === 'beginner' && '初級'}
                              {quizSet.difficulty === 'intermediate' && '中級'}
                              {quizSet.difficulty === 'advanced' && '上級'}
                              {quizSet.difficulty === 'beginner to intermediate' && '初中級'}
                            </span>
                          </div>

                          {/* タイトル */}
                          <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                            {quizSet.name}
                          </h3>

                          {/* 説明 */}
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{quizSet.description}</p>

                          {/* フッター：問題数 */}
                          <div className="pt-3 border-t border-gray-200 flex justify-end">
                            <span className="text-sm font-semibold text-blue-600">
                              {quizSet.questionCount}問
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 クイズの特徴</h3>
          <ul className="text-gray-700 space-y-2 inline-block text-left">
            <li>✓ 各セットで選択肢問題に挑戦</li>
            <li>✓ 学習履歴の自動保存</li>
            <li>✓ JSONとCSV形式でダウンロード対応</li>
            <li>✓ 復習機能で弱点克服</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

