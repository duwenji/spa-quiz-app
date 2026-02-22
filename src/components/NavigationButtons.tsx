interface NavigationButtonsProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isAnswered: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  isAnswered,
}) => {
  return (
    <div className="flex justify-between gap-4 mb-6">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex-1"
      >
        ← 前へ
      </button>

      <button
        onClick={onNext}
        disabled={!isAnswered || !canGoNext}
        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex-1"
      >
        次へ →
      </button>
    </div>
  );
};
