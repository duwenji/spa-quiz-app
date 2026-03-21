import { useState, useEffect, useCallback } from 'react';
import { Question, QuizState, LearningHistory, QuestionAnswer } from '../types';
import { storageManager } from '../utils/storageManager';

const createEmptyState = (): QuizState => ({
  currentQuestionIndex: 0,
  selectedAnswer: null,
  isAnswered: false,
  correctCount: 0,
  wrongCount: 0,
});

const createEmptyHistory = (quizSetId: string | null): LearningHistory => ({
  sessionId: `session-${Date.now()}`,
  quizSetId,
  startedAt: new Date().toISOString(),
  completedAt: null,
  answers: [],
  totalCorrect: 0,
  totalWrong: 0,
  averageAnswerTime: 0,
  sessionDuration: 0,
});

const buildRestoredState = (history: LearningHistory, questions: Question[]): QuizState => {
  const baseState = {
    ...createEmptyState(),
    correctCount: history.totalCorrect,
    wrongCount: history.totalWrong,
  };

  if (questions.length === 0 || history.answers.length === 0) {
    return baseState;
  }

  const answeredIds = new Set(history.answers.map(answer => answer.questionId));
  const nextUnansweredIndex = questions.findIndex(question => !answeredIds.has(question.id));
  if (nextUnansweredIndex >= 0) {
    return {
      ...baseState,
      currentQuestionIndex: nextUnansweredIndex,
    };
  }

  const lastAnswer = history.answers[history.answers.length - 1];
  const lastAnsweredIndex = questions.findIndex(question => question.id === lastAnswer.questionId);
  if (lastAnsweredIndex < 0) {
    return baseState;
  }

  return {
    ...baseState,
    currentQuestionIndex: lastAnsweredIndex,
    selectedAnswer: lastAnswer.selectedAnswer,
    isAnswered: true,
  };
};

export const useQuiz = (questions: Question[], quizSetId: string | null) => {
  const [state, setState] = useState<QuizState>(createEmptyState);
  const [history, setHistory] = useState<LearningHistory>(() => createEmptyHistory(quizSetId));
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!quizSetId) {
      setState(createEmptyState());
      setHistory(createEmptyHistory(null));
      setIsHydrated(false);
      return;
    }

    if (questions.length === 0) {
      setIsHydrated(false);
      return;
    }

    const restoredHistory = storageManager.getLatestHistory(quizSetId) ?? createEmptyHistory(quizSetId);
    setHistory(restoredHistory);
    setState(buildRestoredState(restoredHistory, questions));
    setQuestionStartTime(Date.now());
    setIsHydrated(true);
  }, [quizSetId, questions]);

  const selectAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setState(prev => ({
      ...prev,
      selectedAnswer: answer,
    }));
  }, []);

  const confirmAnswer = useCallback(() => {
    const currentQuestion = questions[state.currentQuestionIndex];
    if (!currentQuestion || !state.selectedAnswer) {
      return;
    }

    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;
    const answerTime = Date.now() - questionStartTime;
    const newAnswer: QuestionAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: state.selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      answerTime,
      answeredAt: new Date().toISOString(),
    };

    setHistory(prev => {
      const updatedAnswers = [...prev.answers];
      const existingIndex = updatedAnswers.findIndex(answer => answer.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      const totalCorrect = updatedAnswers.filter(answer => answer.isCorrect).length;
      const totalWrong = updatedAnswers.length - totalCorrect;
      const averageTime = updatedAnswers.reduce((sum, answer) => sum + answer.answerTime, 0) / updatedAnswers.length;
      const sessionDuration = Date.now() - new Date(prev.startedAt).getTime();
      const completedAt = updatedAnswers.length === questions.length ? new Date().toISOString() : prev.completedAt;

      return {
        ...prev,
        quizSetId,
        answers: updatedAnswers,
        totalCorrect,
        totalWrong,
        averageAnswerTime: averageTime,
        sessionDuration,
        completedAt,
      };
    });

    setState(prev => ({
      ...prev,
      isAnswered: true,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      wrongCount: isCorrect ? prev.wrongCount : prev.wrongCount + 1,
    }));
  }, [state.currentQuestionIndex, state.selectedAnswer, questions, questionStartTime, quizSetId]);

  const goToNextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [state.currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      const prevQuestionId = questions[state.currentQuestionIndex - 1].id;
      const prevAnswer = history.answers.find(answer => answer.questionId === prevQuestionId);

      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        selectedAnswer: prevAnswer?.selectedAnswer || null,
        isAnswered: !!prevAnswer,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [state.currentQuestionIndex, questions, history.answers]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      const questionId = questions[index].id;
      const answer = history.answers.find(savedAnswer => savedAnswer.questionId === questionId);

      setState(prev => ({
        ...prev,
        currentQuestionIndex: index,
        selectedAnswer: answer?.selectedAnswer || null,
        isAnswered: !!answer,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [questions, history.answers]);

  const resetQuiz = useCallback(() => {
    if (window.confirm('学習履歴をリセットしますか？この操作は取り消せません。')) {
      storageManager.clearHistory(quizSetId);
      setState(createEmptyState());
      setHistory(createEmptyHistory(quizSetId));
      setQuestionStartTime(Date.now());
      setIsHydrated(true);
    }
  }, [quizSetId]);

  useEffect(() => {
    if (!quizSetId || !isHydrated || questions.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      storageManager.saveHistory(history);
    }, 1000);

    return () => clearTimeout(timer);
  }, [history, isHydrated, questions.length, quizSetId]);

  return {
    state,
    history,
    selectAnswer,
    confirmAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    resetQuiz,
    currentQuestion: questions[state.currentQuestionIndex],
  };
};
