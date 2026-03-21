import { LearningHistory } from '../types';

const STORAGE_KEY = 'quiz-learning-history';

const normalizeHistory = (history: Partial<LearningHistory>): LearningHistory => ({
  sessionId: history.sessionId ?? `session-${Date.now()}`,
  quizSetId: typeof history.quizSetId === 'string' ? history.quizSetId : null,
  startedAt: history.startedAt ?? new Date().toISOString(),
  completedAt: history.completedAt ?? null,
  answers: Array.isArray(history.answers) ? history.answers : [],
  totalCorrect: typeof history.totalCorrect === 'number' ? history.totalCorrect : 0,
  totalWrong: typeof history.totalWrong === 'number' ? history.totalWrong : 0,
  averageAnswerTime: typeof history.averageAnswerTime === 'number' ? history.averageAnswerTime : 0,
  sessionDuration: typeof history.sessionDuration === 'number' ? history.sessionDuration : 0,
});

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
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map(normalizeHistory) : [];
    } catch (error) {
      console.error('Failed to load histories:', error);
      return [];
    }
  },

  getLatestHistory: (quizSetId: string): LearningHistory | null => {
    const histories = storageManager
      .getAllHistories()
      .filter(history => history.quizSetId === quizSetId)
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt));

    return histories[0] ?? null;
  },

  clearHistory: (quizSetId?: string | null) => {
    try {
      if (quizSetId) {
        const histories = storageManager.getAllHistories();
        const remaining = histories.filter(history => history.quizSetId !== quizSetId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        return;
      }

      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
};
