import { Test, TestResult } from '@/types/test';

const TESTS_KEY = 'mockTests';
const RESULTS_KEY = 'testResults';

export const storage = {
  getTests: (): Test[] => {
    try {
      const data = localStorage.getItem(TESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTests: (tests: Test[]) => {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  },

  addTest: (test: Test) => {
    const tests = storage.getTests();
    const existing = tests.find(t => t.id === test.id);
    if (!existing) {
      tests.push(test);
      storage.saveTests(tests);
    }
  },

  deleteTest: (testId: number) => {
    const tests = storage.getTests().filter(t => t.id !== testId);
    storage.saveTests(tests);
  },

  getResults: (): TestResult[] => {
    try {
      const data = localStorage.getItem(RESULTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveResults: (results: TestResult[]) => {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  },

  addResult: (result: TestResult) => {
    const results = storage.getResults();
    results.push(result);
    storage.saveResults(results);
  },

  deleteResult: (index: number) => {
    const results = storage.getResults();
    results.splice(index, 1);
    storage.saveResults(results);
  },

  clearResults: () => {
    storage.saveResults([]);
  },

  getStats: () => {
    const results = storage.getResults();
    const testsTaken = results.length;
    const avgScore = testsTaken > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / testsTaken) 
      : 0;
    const bestScore = testsTaken > 0 
      ? Math.max(...results.map(r => r.percentage)) 
      : 0;
    
    return { testsTaken, avgScore, bestScore };
  }
};
