import { QuizSet } from '../types';

interface QuizSetSelectorProps {
  quizSets: QuizSet[];
  onSelectQuizSet: (quizSet: QuizSet) => void;
}

export const QuizSetSelector = ({ quizSets, onSelectQuizSet }: QuizSetSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">📚 クイズセットを選択</h1>
          <p className="text-blue-100 text-lg">学びたい分野を選んで、クイズに挑戦しましょう！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizSets.map((quizSet) => (
            <button
              key={quizSet.id}
              onClick={() => onSelectQuizSet(quizSet)}
              className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{quizSet.icon}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {quizSet.difficulty === 'beginner' && '初級'}
                  {quizSet.difficulty === 'intermediate' && '中級'}
                  {quizSet.difficulty === 'advanced' && '上級'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                {quizSet.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4">{quizSet.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {quizSet.category}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {quizSet.questionCount}問
                </span>
              </div>
            </button>
          ))}
        </div>

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
