import { useState, useEffect } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { ResultFeedback } from './components/ResultFeedback';
import { NavigationButtons } from './components/NavigationButtons';
import { QuestionNavigation } from './components/QuestionNavigation';
import { ActivityDownload } from './components/ActivityDownload';
import { QuizSetSelector } from './components/QuizSetSelector';
import { Question, QuizSet } from './types';
import { getAllQuizSets, getQuizSetQuestions } from './data';
import './App.css';

function App() {
  const [appState, setAppState] = useState<'selecting' | 'intro' | 'quiz'>('selecting');
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // クイズセットが選択されたら質問データを非同期で読み込む
  useEffect(() => {
    const loadQuestions = async () => {
      if (selectedQuizSet && appState === 'quiz') {
        console.log('Loading questions for quiz set:', selectedQuizSet.id);
        setIsLoading(true);
        try {
          const loadedQuestions = await getQuizSetQuestions(selectedQuizSet.id);
          console.log('Loaded questions:', loadedQuestions.length);
          setQuestions(loadedQuestions);
        } catch (error) {
          console.error('Failed to load questions:', error);
          setQuestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setQuestions([]);
      }
    };

    loadQuestions();
  }, [selectedQuizSet, appState]);

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

  const quizSets = getAllQuizSets();

  const handleQuizSetSelect = (quizSet: QuizSet) => {
    setSelectedQuizSet(quizSet);
    setAppState('intro');
  };

  const handleStartQuiz = () => {
    // resetQuiz() は確認ダイアログを表示するので、代わりに状態を直接リセット
    // 新しいセッションを開始するために状態をクリア
    setQuestions([]);
    setAppState('quiz');
  };

  const handleBackToSelection = () => {
    setAppState('selecting');
    setSelectedQuizSet(null);
    resetQuiz();
  };

  // Show quiz set selection screen
  if (appState === 'selecting') {
    return <QuizSetSelector quizSets={quizSets} onSelectQuizSet={handleQuizSetSelect} />;
  }

  // Show quiz intro screen
  if (appState === 'intro' && selectedQuizSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{selectedQuizSet.icon}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedQuizSet.name}</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {selectedQuizSet.description}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-3">📋 クイズ内容:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ 全{selectedQuizSet.questionCount}問の選択問題</li>
              <li>✓ 学習履歴の自動保存</li>
              <li>✓ JSONとCSV形式でのダウンロード</li>
              <li>✓ AI分析ツール連携対応</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAppState('selecting')}
              className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              戻る
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex-1 px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg"
            >
              クイズをはじめる
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz screen
  if (appState === 'quiz' && selectedQuizSet) {
    // ローディング中の表示
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg">クイズデータを読み込んでいます...</p>
          </div>
        </div>
      );
    }

    // 質問データがない場合
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">データが見つかりません</h1>
            <p className="text-gray-700 mb-6">
              クイズデータの読み込みに失敗しました。別のクイズセットをお試しください。
            </p>
            <button
              onClick={handleBackToSelection}
              className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              クイズセット選択に戻る
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{selectedQuizSet.icon}</span>
              <h1 className="text-3xl font-bold text-gray-900">{selectedQuizSet.name}</h1>
            </div>
            <p className="text-gray-700">{selectedQuizSet.category}</p>
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
          <ActivityDownload 
            history={history} 
            onReset={handleBackToSelection}
            showBackButton={true}
            backButtonText="別のクイズを選ぶ"
          />

          {/* フッター */}
          <div className="mt-12 text-center text-gray-600 text-sm">
            <p>学習データはブラウザに自動保存されます</p>
            <p className="mt-2">※ ブラウザのキャッシュクリアでデータが削除されます</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
