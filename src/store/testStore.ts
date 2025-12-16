import { create } from 'zustand';
import { Test, TestState, TestResult, QuestionStatus } from '@/types/test';
import { storage } from '@/lib/storage';

interface TestStore {
  // Current test being taken
  currentTest: Test | null;
  testState: TestState | null;
  
  // Test creation
  setCurrentTest: (test: Test | null) => void;
  
  // Test execution
  startTest: (test: Test) => void;
  endTest: () => void;
  
  // Question navigation
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  saveAndNext: () => void;
  
  // Answer handling
  selectOption: (optionIndex: number) => void;
  clearResponse: () => void;
  markForReview: () => void;
  
  // Timer
  decrementTime: () => void;
  decrementQuestionTime: () => boolean; // Returns true if question expired
  togglePause: () => void;
  lockQuestion: () => void;
  
  // Submit
  submitTest: () => TestResult | null;
}

export const useTestStore = create<TestStore>((set, get) => ({
  currentTest: null,
  testState: null,

  setCurrentTest: (test) => set({ currentTest: test }),

  startTest: (test) => {
    const questionStatus: Record<number, QuestionStatus> = {};
    test.questions.forEach((_, i) => {
      questionStatus[i] = 'unvisited';
    });
    questionStatus[0] = 'visited';

    set({
      currentTest: test,
      testState: {
        currentQuestion: 0,
        userAnswers: {},
        questionStatus,
        timeRemaining: test.duration * 60,
        questionTimeRemaining: test.forceTimeMode ? test.forceTimeMinutes * 60 : 0,
        bonusTime: 0,
        isPaused: false,
        questionLocked: false,
      },
    });

    // Save test to storage
    storage.addTest(test);
  },

  endTest: () => set({ currentTest: null, testState: null }),

  goToQuestion: (index) => {
    const { currentTest, testState } = get();
    if (!currentTest || !testState) return;
    if (currentTest.forceTimeMode) return; // Can't navigate freely in force time mode
    if (index < 0 || index >= currentTest.questions.length) return;

    const newStatus = { ...testState.questionStatus };
    if (newStatus[index] === 'unvisited') {
      newStatus[index] = 'visited';
    }

    set({
      testState: {
        ...testState,
        currentQuestion: index,
        questionStatus: newStatus,
        questionLocked: false,
      },
    });
  },

  nextQuestion: () => {
    const { currentTest, testState } = get();
    if (!currentTest || !testState) return;
    if (currentTest.forceTimeMode) return;
    if (testState.currentQuestion >= currentTest.questions.length - 1) return;

    const newIndex = testState.currentQuestion + 1;
    const newStatus = { ...testState.questionStatus };
    if (newStatus[newIndex] === 'unvisited') {
      newStatus[newIndex] = 'visited';
    }

    set({
      testState: {
        ...testState,
        currentQuestion: newIndex,
        questionStatus: newStatus,
      },
    });
  },

  previousQuestion: () => {
    const { currentTest, testState } = get();
    if (!currentTest || !testState) return;
    if (currentTest.forceTimeMode) return;
    if (testState.currentQuestion <= 0) return;

    set({
      testState: {
        ...testState,
        currentQuestion: testState.currentQuestion - 1,
      },
    });
  },

  saveAndNext: () => {
    const { currentTest, testState } = get();
    if (!currentTest || !testState) return;
    if (testState.isPaused) return;

    // Calculate bonus time if compound time is enabled
    let bonusTime = 0;
    if (currentTest.forceTimeMode && currentTest.compoundTimeEnabled && testState.questionTimeRemaining > 0) {
      bonusTime = testState.questionTimeRemaining;
    }

    if (testState.currentQuestion < currentTest.questions.length - 1) {
      const newIndex = testState.currentQuestion + 1;
      const newStatus = { ...testState.questionStatus };
      if (newStatus[newIndex] === 'unvisited') {
        newStatus[newIndex] = 'visited';
      }

      const baseTime = currentTest.forceTimeMinutes * 60;
      const newQuestionTime = currentTest.forceTimeMode ? baseTime + bonusTime : 0;

      set({
        testState: {
          ...testState,
          currentQuestion: newIndex,
          questionStatus: newStatus,
          questionTimeRemaining: newQuestionTime,
          bonusTime: 0, // Reset after applying
          questionLocked: false,
        },
      });
    }
  },

  selectOption: (optionIndex) => {
    const { testState } = get();
    if (!testState || testState.questionLocked || testState.isPaused) return;

    const newAnswers = { ...testState.userAnswers };
    newAnswers[testState.currentQuestion] = optionIndex;

    const newStatus = { ...testState.questionStatus };
    newStatus[testState.currentQuestion] = 'answered';

    set({
      testState: {
        ...testState,
        userAnswers: newAnswers,
        questionStatus: newStatus,
      },
    });
  },

  clearResponse: () => {
    const { testState } = get();
    if (!testState || testState.questionLocked || testState.isPaused) return;

    const newAnswers = { ...testState.userAnswers };
    delete newAnswers[testState.currentQuestion];

    const newStatus = { ...testState.questionStatus };
    if (newStatus[testState.currentQuestion] !== 'marked') {
      newStatus[testState.currentQuestion] = 'visited';
    }

    set({
      testState: {
        ...testState,
        userAnswers: newAnswers,
        questionStatus: newStatus,
      },
    });
  },

  markForReview: () => {
    const { testState } = get();
    if (!testState || testState.isPaused) return;

    const newStatus = { ...testState.questionStatus };
    newStatus[testState.currentQuestion] = 'marked';

    set({
      testState: {
        ...testState,
        questionStatus: newStatus,
      },
    });
  },

  decrementTime: () => {
    const { testState } = get();
    if (!testState || testState.isPaused) return;

    set({
      testState: {
        ...testState,
        timeRemaining: testState.timeRemaining - 1,
      },
    });
  },

  decrementQuestionTime: () => {
    const { testState } = get();
    if (!testState || testState.isPaused || testState.questionLocked) return false;

    const newTime = testState.questionTimeRemaining - 1;
    
    set({
      testState: {
        ...testState,
        questionTimeRemaining: newTime,
      },
    });

    return newTime <= 0;
  },

  togglePause: () => {
    const { testState } = get();
    if (!testState) return;

    set({
      testState: {
        ...testState,
        isPaused: !testState.isPaused,
      },
    });
  },

  lockQuestion: () => {
    const { testState } = get();
    if (!testState) return;

    set({
      testState: {
        ...testState,
        questionLocked: true,
      },
    });
  },

  submitTest: () => {
    const { currentTest, testState } = get();
    if (!currentTest || !testState) return null;

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let score = 0;

    currentTest.questions.forEach((question, index) => {
      const userAnswer = testState.userAnswers[index];
      if (userAnswer === question.correct) {
        correctAnswers++;
        score += currentTest.positiveMarks;
      } else if (userAnswer !== undefined) {
        incorrectAnswers++;
        score -= currentTest.negativeMarks;
      }
    });

    const totalMarks = currentTest.questions.length * currentTest.positiveMarks;
    const percentage = Math.round((Math.max(0, score) / totalMarks) * 100);

    const result: TestResult = {
      testId: currentTest.id,
      title: currentTest.title,
      score: Math.max(0, score),
      totalMarks,
      percentage,
      correct: correctAnswers,
      incorrect: incorrectAnswers,
      unanswered: currentTest.questions.length - correctAnswers - incorrectAnswers,
      answers: { ...testState.userAnswers },
      date: new Date().toISOString(),
      forceTimeMode: currentTest.forceTimeMode,
    };

    storage.addResult(result);

    return result;
  },
}));
