import { useState, useEffect, useCallback } from 'react';
import { Question, QuizState, LearningHistory, QuestionAnswer } from '../types';
import { storageManager } from '../utils/storageManager';

export const useQuiz = (questions: Question[]) => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    isAnswered: false,
    correctCount: 0,
    wrongCount: 0,
  });

  const [history, setHistory] = useState<LearningHistory>(() => {
    const sessionId = `session-${Date.now()}`;
    return {
      sessionId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      answers: [],
      totalCorrect: 0,
      totalWrong: 0,
      averageAnswerTime: 0,
      sessionDuration: 0,
    };
  });

  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const selectAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setState(prev => ({
      ...prev,
      selectedAnswer: answer,
    }));
  }, []);

  const confirmAnswer = useCallback(() => {
    const currentQuestion = questions[state.currentQuestionIndex];
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
      // 既に同じ問題の回答がある場合は置き換え
      const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      const totalCorrect = updatedAnswers.filter(a => a.isCorrect).length;
      const totalWrong = updatedAnswers.length - totalCorrect;
      const averageTime = updatedAnswers.reduce((sum, a) => sum + a.answerTime, 0) / updatedAnswers.length;
      const sessionDuration = Date.now() - new Date(prev.startedAt).getTime();

      return {
        ...prev,
        answers: updatedAnswers,
        totalCorrect,
        totalWrong,
        averageAnswerTime: averageTime,
        sessionDuration,
      };
    });

    setState(prev => ({
      ...prev,
      isAnswered: true,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      wrongCount: isCorrect ? prev.wrongCount : prev.wrongCount + 1,
    }));
  }, [state.selectedAnswer, state.currentQuestionIndex, questions, questionStartTime]);

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
      const prevAnswer = history.answers.find(a => a.questionId === prevQuestionId);

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
      const answer = history.answers.find(a => a.questionId === questionId);

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
      storageManager.clearHistory();
      setState({
        currentQuestionIndex: 0,
        selectedAnswer: null,
        isAnswered: false,
        correctCount: 0,
        wrongCount: 0,
      });
      setHistory({
        sessionId: `session-${Date.now()}`,
        startedAt: new Date().toISOString(),
        completedAt: null,
        answers: [],
        totalCorrect: 0,
        totalWrong: 0,
        averageAnswerTime: 0,
        sessionDuration: 0,
      });
    }
  }, []);

  // 履歴をlocalStorageに定期保存（デバウンス）
  useEffect(() => {
    const timer = setTimeout(() => {
      storageManager.saveHistory(history);
    }, 1000);

    return () => clearTimeout(timer);
  }, [history]);

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
