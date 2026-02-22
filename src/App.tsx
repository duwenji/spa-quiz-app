import { useState } from 'react';
import questionsData from './data/questions.json';
import { useQuiz } from './hooks/useQuiz';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { ResultFeedback } from './components/ResultFeedback';
import { NavigationButtons } from './components/NavigationButtons';
import { QuestionNavigation } from './components/QuestionNavigation';
import { ActivityDownload } from './components/ActivityDownload';
import { Question } from './types';
import './App.css';

function App() {
  const questions: Question[] = questionsData.questions as Question[];
  const {
    state,
    history,
    selectAnswer,
    confirmAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    resetQuiz,
    currentQuestion,
  } = useQuiz(questions);

  const [appStarted, setAppStarted] = useState(false);

  const handleStartClick = () => {
    setAppStarted(true);
  };

  if (!appStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 選択問題クイズ</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            GitHub Copilot Chat の知識を確認するアプリです。30問に挑戦して、あなたの習得度をチェックしましょう！
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-3">✨ このアプリの特徴:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ 30問の選択問題</li>
              <li>✓ 学習履歴の自動保存</li>
              <li>✓ JSONとCSV形式でのダウンロード</li>
              <li>✓ AI分析ツール連携対応</li>
            </ul>
          </div>
          <button
            onClick={handleStartClick}
            className="w-full px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg"
          >
            クイズをはじめる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GitHub Copilot 選択問題</h1>
          <p className="text-gray-700">Chat機能の完全習得チャレンジ</p>
        </div>

        {/* 進捗バー */}
        <ProgressBar current={state.currentQuestionIndex} total={questions.length} />

        {/* 問題と選択肢 */}
        {currentQuestion && (
          <>
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={state.selectedAnswer}
              isAnswered={state.isAnswered}
              onSelectAnswer={selectAnswer}
              onConfirm={confirmAnswer}
            />

            {/* 結果フィードバック */}
            {state.isAnswered && (
              <ResultFeedback
                isCorrect={
                  history.answers.find(a => a.questionId === currentQuestion.id)?.isCorrect || false
                }
                selectedAnswer={state.selectedAnswer || 'N/A'}
                correctAnswer={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
              />
            )}

            {/* ナビゲーションボタン */}
            <NavigationButtons
              canGoPrevious={state.currentQuestionIndex > 0}
              canGoNext={state.currentQuestionIndex < questions.length - 1}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
              isAnswered={state.isAnswered}
            />

            {/* 問題選択ボタン */}
            <QuestionNavigation
              totalQuestions={questions.length}
              currentIndex={state.currentQuestionIndex}
              history={history}
              onSelectQuestion={goToQuestion}
            />
          </>
        )}

        {/* 最後の問題を回答済みの場合 */}
        {state.currentQuestionIndex === questions.length - 1 && state.isAnswered && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center border-l-4 border-purple-500">
            <h3 className="text-3xl font-bold text-purple-600 mb-4">🎉 お疲れさまでした！</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold text-green-600">{history.totalCorrect}</p>
                <p className="text-sm text-gray-600 mt-1">正解</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{history.totalWrong}</p>
                <p className="text-sm text-gray-600 mt-1">不正解</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {((history.totalCorrect / questions.length) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 mt-1">正解率</p>
              </div>
            </div>
          </div>
        )}

        {/* 学習統計とダウンロード */}
        <ActivityDownload history={history} onReset={resetQuiz} />

        {/* フッター */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>学習データはブラウザに自動保存されます</p>
          <p className="mt-2">※ ブラウザのキャッシュクリアでデータが削除されます</p>
        </div>
      </div>
    </div>
  );
}

export default App;
