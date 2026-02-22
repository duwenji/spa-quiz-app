interface ResultFeedbackProps {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export const ResultFeedback: React.FC<ResultFeedbackProps> = ({
  isCorrect,
  selectedAnswer,
  correctAnswer,
  explanation,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-8 mb-6 border-l-4 ${
        isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
      }`}
    >
      <div className="flex items-center mb-4">
        <span className={`text-4xl font-bold mr-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '正解です！' : `残念です。正解は ${correctAnswer} です。`}
        </h3>
      </div>

      {!isCorrect && (
        <div className="mb-4 p-3 bg-white rounded border border-red-300">
          <p className="text-sm text-gray-700">
            <strong>あなたの選択:</strong> {selectedAnswer}
          </p>
          <p className="text-sm text-gray-700">
            <strong>正解:</strong> {correctAnswer}
          </p>
        </div>
      )}

      <div className="bg-white rounded p-4 border border-gray-300">
        <h4 className="font-bold text-gray-900 mb-2">📚 解説</h4>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{explanation}</p>
      </div>
    </div>
  );
};
