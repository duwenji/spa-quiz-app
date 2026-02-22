import { Question, QuizSet } from '../types';
import githubCopilotQuestions from './github-copilot/questions.json';
import quizSetsMetadata from './quizSets.json';

export interface QuizSetWithQuestions extends QuizSet {
  questions: Question[];
}

// Quiz sets with their questions
const quizSetMap: Record<string, QuizSetWithQuestions> = {
  'github-copilot': {
    ...(quizSetsMetadata.quizSets.find(q => q.id === 'github-copilot') || quizSetsMetadata.quizSets[0]),
    questions: githubCopilotQuestions.questions as Question[],
  },
};

export const getAllQuizSets = (): QuizSet[] => {
  return quizSetsMetadata.quizSets;
};

export const getQuizSetWithQuestions = (quizSetId: string): QuizSetWithQuestions | null => {
  return quizSetMap[quizSetId] || null;
};

export const getQuizSetQuestions = (quizSetId: string): Question[] => {
  return quizSetMap[quizSetId]?.questions || [];
};
