import { Question } from '../types';
import { OptionButton } from './OptionButton';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isAnswered: boolean;
  onSelectAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void;
  onConfirm: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  isAnswered,
  onSelectAnswer,
  onConfirm,
}) => {
  const correctAnswer = question.correctAnswer;

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h2>

      <div className="mb-6">
        {question.options.map(option => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedAnswer === option.id}
            isAnswered={isAnswered}
            isCorrect={option.id === correctAnswer}
            onClick={onSelectAnswer}
          />
        ))}
      </div>

      {!isAnswered && selectedAnswer && (
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          確認する
        </button>
      )}
    </div>
  );
};
