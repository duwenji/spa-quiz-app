import { LearningHistory } from '../types';

const STORAGE_KEY = 'quiz-learning-history';

export const storageManager = {
  saveHistory: (history: LearningHistory) => {
    try {
      const histories = storageManager.getAllHistories();
      // 同じセッションの履歴を更新するか、新規追加するか判定
      const existingIndex = histories.findIndex(h => h.sessionId === history.sessionId);
      if (existingIndex >= 0) {
        histories[existingIndex] = history;
      } else {
        histories.push(history);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  },

  getAllHistories: (): LearningHistory[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load histories:', error);
      return [];
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
};
