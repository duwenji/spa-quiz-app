export interface Option {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isAnswered: boolean;
  correctCount: number;
  wrongCount: number;
}

export interface QuestionAnswer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  answerTime: number;
  answeredAt: string;
}

export interface LearningHistory {
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  answers: QuestionAnswer[];
  totalCorrect: number;
  totalWrong: number;
  averageAnswerTime: number;
  sessionDuration: number;
}

export interface QuizSet {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dataPath: string;
}
