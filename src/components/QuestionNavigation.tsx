import { LearningHistory } from '../types';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentIndex: number;
  history: LearningHistory;
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  totalQuestions,
  currentIndex,
  history,
  onSelectQuestion,
}) => {
  const getButtonColor = (questionId: number) => {
    const answer = history.answers.find(a => a.questionId === questionId);
    if (!answer) return 'bg-gray-200 text-gray-700';
    if (answer.isCorrect) return 'bg-green-400 text-white';
    return 'bg-red-400 text-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">問題を選択</h3>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(index)}
            className={`
              w-full py-2 rounded font-semibold text-sm transition-all duration-200
              ${currentIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${getButtonColor(index + 1)}
              hover:scale-105
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
