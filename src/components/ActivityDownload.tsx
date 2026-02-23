import { LearningHistory, Question, QuizSet } from '../types';
import { downloadAsJSON, downloadAsCSV, generateAIAnalysisPrompt } from '../utils/downloadHistory';

interface ActivityDownloadProps {
  history: LearningHistory;
  onReset: () => void;
  showBackButton?: boolean;
  backButtonText?: string;
  quizSet?: QuizSet;
  questions?: Question[];
}

export const ActivityDownload: React.FC<ActivityDownloadProps> = ({ 
  history, 
  onReset,
  showBackButton = false,
  backButtonText = '学習履歴をリセット',
  quizSet,
  questions
}) => {
  const totalAnswers = history.answers.length;
  if (totalAnswers === 0) {
    return null;
  }

  const correctRate = totalAnswers > 0 ? ((history.totalCorrect / totalAnswers) * 100).toFixed(1) : '0';
  const avgAnswerTime = (history.averageAnswerTime / 1000).toFixed(1);
  const firstAnswerTime = history.answers.length > 0 ? history.answers[0].answeredAt : '';
  const lastAnswerTime = history.answers.length > 0 ? history.answers[history.answers.length - 1].answeredAt : '';

  const copyPromptToClipboard = () => {
    const prompt = generateAIAnalysisPrompt(history, quizSet?.name, questions);
    navigator.clipboard.writeText(prompt).then(() => {
      alert('AI分析用プロンプトをコピーしました！Copilot Chatに貼り付けてください。');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8 border border-blue-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6">📊 学習統計とダウンロード</h3>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded p-4">
          <p className="text-xs text-gray-600 mb-1">正解数</p>
          <p className="text-2xl font-bold text-blue-600">{history.totalCorrect}</p>
          <p className="text-xs text-gray-600 mt-1">/ {totalAnswers}</p>
        </div>
        <div className="bg-green-50 rounded p-4">
          <p className="text-xs text-gray-600 mb-1">正解率</p>
          <p className="text-2xl font-bold text-green-600">{correctRate}%</p>
        </div>
        <div className="bg-orange-50 rounded p-4">
          <p className="text-xs text-gray-600 mb-1">平均解答時間</p>
          <p className="text-2xl font-bold text-orange-600">{avgAnswerTime}</p>
          <p className="text-xs text-gray-600 mt-1">秒</p>
        </div>
        <div className="bg-purple-50 rounded p-4">
          <p className="text-xs text-gray-600 mb-1">回答数</p>
          <p className="text-2xl font-bold text-purple-600">{totalAnswers}</p>
          <p className="text-xs text-gray-600 mt-1">問</p>
        </div>
      </div>

      {/* 日時情報 */}
      <div className="mb-6 text-sm text-gray-700 bg-gray-50 rounded p-4">
        <p className="mb-1">
          <strong>最初の回答:</strong> {new Date(firstAnswerTime).toLocaleString('ja-JP')}
        </p>
        <p>
          <strong>最後の回答:</strong> {new Date(lastAnswerTime).toLocaleString('ja-JP')}
        </p>
      </div>

      {/* ダウンロードボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => downloadAsJSON(history)}
          className="px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors duration-200 w-full"
        >
          📥 JSON形式でダウンロード
        </button>
        <button
          onClick={() => downloadAsCSV(history)}
          className="px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200 w-full"
        >
          📊 CSV形式でダウンロード
        </button>
      </div>

      {/* AI分析へのコピー */}
      <div className="mb-6 bg-indigo-50 rounded-lg p-4 border border-indigo-300">
        <h4 className="font-bold text-indigo-900 mb-3">🤖 AI分析（Copilot Chat）</h4>
        <p className="text-sm text-indigo-800 mb-4">
          このボタンをクリックするとプロンプトをコピーできます。Copilot Chat（Ctrl+Shift+I）に貼り付けて、学習データの分析を依頼してください。
        </p>
        <button
          onClick={copyPromptToClipboard}
          className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          📋 AI分析用プロンプトをコピー
        </button>
      </div>

      {/* リセット/戻るボタン */}
      {showBackButton ? (
        <button
          onClick={onReset}
          className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          ← {backButtonText}
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          🔄 学習履歴をリセット
        </button>
      )}
    </div>
  );
};
