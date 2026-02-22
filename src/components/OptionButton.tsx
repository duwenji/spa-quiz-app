import { Option } from '../types';

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  isAnswered: boolean;
  isCorrect: boolean;
  onClick: (id: 'A' | 'B' | 'C' | 'D') => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  isSelected,
  isAnswered,
  isCorrect,
  onClick,
}) => {
  let className =
    'w-full p-4 mb-3 text-left rounded-lg border-2 font-semibold transition-all duration-200';

  if (!isAnswered) {
    // 未回答時
    className += isSelected
      ? ' border-blue-500 bg-blue-50 text-blue-900 cursor-pointer hover:bg-blue-100'
      : ' border-gray-300 bg-white text-gray-800 cursor-pointer hover:border-gray-400 hover:bg-gray-50';
  } else {
    // 回答済み時
    if (option.id === 'A' || option.id === 'B' || option.id === 'C' || option.id === 'D') {
      if (isSelected) {
        // 選択した選択肢
        if (isCorrect) {
          className += ' border-green-500 bg-green-50 text-green-900';
        } else {
          className += ' border-red-500 bg-red-50 text-red-900';
        }
      } else {
        className += ' border-gray-300 bg-gray-100 text-gray-600 opacity-60';
      }
    }
  }

  return (
    <button
      className={className}
      onClick={() => !isAnswered && onClick(option.id)}
      disabled={isAnswered}
    >
      <div className="flex items-center">
        <span className="inline-block w-8 h-8 text-center leading-8 font-bold border-2 border-current rounded-full mr-3">
          {option.id}
        </span>
        <span>{option.text}</span>
      </div>
    </button>
  );
};
