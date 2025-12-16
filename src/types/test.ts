export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface Test {
  id: number;
  title: string;
  duration: number;
  positiveMarks: number;
  negativeMarks: number;
  questions: Question[];
  forceTimeMode: boolean;
  forceTimeMinutes: number;
  compoundTimeEnabled: boolean;
  created: string;
}

export interface TestResult {
  testId: number;
  title: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  answers: Record<number, number>;
  date: string;
  forceTimeMode: boolean;
}

export type QuestionStatus = 'unvisited' | 'visited' | 'answered' | 'marked';

export interface TestState {
  currentQuestion: number;
  userAnswers: Record<number, number>;
  questionStatus: Record<number, QuestionStatus>;
  timeRemaining: number;
  questionTimeRemaining: number;
  bonusTime: number;
  isPaused: boolean;
  questionLocked: boolean;
}
