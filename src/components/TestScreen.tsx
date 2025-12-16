import { useEffect, useRef, useState } from 'react';
import { Screen } from '@/pages/Index';
import { useTestStore } from '@/store/testStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Pause, Play, Grid3X3, Trash2, Tag, Check, 
  ChevronLeft, ChevronRight, Save, Send, Gift
} from 'lucide-react';
import QuestionPalette from '@/components/QuestionPalette';
import { cn } from '@/lib/utils';

interface TestScreenProps {
  onNavigate: (screen: Screen) => void;
}

const TestScreen = ({ onNavigate }: TestScreenProps) => {
  const { 
    currentTest, 
    testState, 
    selectOption, 
    clearResponse,
    markForReview,
    saveAndNext,
    nextQuestion,
    previousQuestion,
    decrementTime,
    decrementQuestionTime,
    togglePause,
    lockQuestion,
    submitTest,
    endTest,
  } = useTestStore();

  const [showPalette, setShowPalette] = useState(false);
  const [showBonusIndicator, setShowBonusIndicator] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof submitTest>>(null);
  
  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentTest || !testState) {
      onNavigate('dashboard');
      return;
    }

    // Main timer
    mainTimerRef.current = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    };
  }, [currentTest]);

  // Question timer for force time mode
  useEffect(() => {
    if (!currentTest?.forceTimeMode || !testState) return;

    questionTimerRef.current = setInterval(() => {
      const expired = decrementQuestionTime();
      if (expired) {
        lockQuestion();
        toast.warning('Time expired! Moving to next question...');
        setTimeout(() => {
          if (testState.currentQuestion < currentTest.questions.length - 1) {
            saveAndNext();
          } else {
            handleSubmit();
          }
        }, 1000);
      }
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentTest?.forceTimeMode, testState?.currentQuestion]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (testState && testState.timeRemaining <= 0) {
      handleSubmit();
      toast.warning('Time up! Test auto-submitted.');
    }
  }, [testState?.timeRemaining]);

  // Show bonus indicator when compound time is applied
  useEffect(() => {
    if (currentTest?.forceTimeMode && currentTest?.compoundTimeEnabled && testState) {
      const baseTime = currentTest.forceTimeMinutes * 60;
      if (testState.questionTimeRemaining > baseTime) {
        const bonus = testState.questionTimeRemaining - baseTime;
        setBonusAmount(bonus);
        setShowBonusIndicator(true);
        setTimeout(() => setShowBonusIndicator(false), 3000);
      }
    }
  }, [testState?.currentQuestion]);

  if (!currentTest || !testState) return null;

  const question = currentTest.questions[testState.currentQuestion];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    const testResult = submitTest();
    setResult(testResult);
    endTest();
    onNavigate('results');
    toast.success('Test submitted successfully!');
  };

  const confirmSubmit = () => {
    const unanswered = currentTest.questions.length - Object.keys(testState.userAnswers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    } else {
      if (!confirm('Are you sure you want to submit the test?')) return;
    }
    handleSubmit();
  };

  const handleSaveTest = () => {
    if (confirm('Save current progress and exit? You can resume later from My Tests.')) {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      endTest();
      onNavigate('my-tests');
      toast.success('Test saved! Resume from My Tests.');
    }
  };

  const handleExitTest = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost if you don\'t submit.')) {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      endTest();
      onNavigate('dashboard');
      toast.warning('Test exited');
    }
  };

  const timerClass = cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm",
    testState.isPaused && "bg-accent/20 text-accent",
    !testState.isPaused && testState.timeRemaining <= 300 && "bg-destructive/20 text-destructive animate-pulse-custom",
    !testState.isPaused && testState.timeRemaining > 300 && testState.timeRemaining <= 600 && "bg-warning/20 text-warning",
    !testState.isPaused && testState.timeRemaining > 600 && "bg-secondary text-primary"
  );

  const questionTimerClass = cn(
    "px-3 py-1 rounded-full text-sm font-semibold",
    testState.questionTimeRemaining <= 30 && "bg-destructive text-destructive-foreground animate-pulse-custom",
    testState.questionTimeRemaining > 30 && testState.questionTimeRemaining <= currentTest.forceTimeMinutes * 60 && "bg-warning text-warning-foreground",
    testState.questionTimeRemaining > currentTest.forceTimeMinutes * 60 && "bg-success text-success-foreground"
  );

  const answered = Object.keys(testState.userAnswers).length;
  const total = currentTest.questions.length;
  const progress = (answered / total) * 100;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Pause Overlay */}
      {testState.isPaused && (
        <div className="fixed inset-0 bg-background/90 z-[60] flex flex-col items-center justify-center gap-4">
          <div className="text-4xl">⏸️</div>
          <h2 className="text-2xl font-bold">Test Paused</h2>
          <p className="text-muted-foreground">Click Resume to continue</p>
          <Button onClick={togglePause} size="lg" className="gradient-primary text-primary-foreground">
            <Play className="w-5 h-5 mr-2" />
            Resume Test
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                <circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="hsl(var(--border))" 
                  strokeWidth="3"
                />
                <circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="hsl(var(--success))" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="113"
                  strokeDashoffset={113 - (progress / 100) * 113}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {answered}/{total}
              </span>
            </div>
          </div>

          <div className={timerClass}>
            <span>⏱️</span>
            <span>{formatTime(testState.timeRemaining)}</span>
          </div>

          {/* Bonus Time Indicator */}
          {showBonusIndicator && (
            <div className="gradient-success text-success-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-bonus-pop">
              <Gift className="w-3 h-3" />
              +{bonusAmount}s bonus
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePause}
              className={testState.isPaused ? "bg-warning text-warning-foreground" : ""}
            >
              {testState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowPalette(true)}
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border flex-wrap gap-2">
            <span className="text-lg font-semibold text-primary">
              Question {testState.currentQuestion + 1}
            </span>
            {currentTest.forceTimeMode && (
              <span className={questionTimerClass}>
                {formatTime(testState.questionTimeRemaining)}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              +{currentTest.positiveMarks}, -{currentTest.negativeMarks}
            </span>
          </div>

          <div className="text-foreground mb-6 leading-relaxed whitespace-pre-wrap">
            {question.question}
          </div>

          <div className="space-y-3 mb-24">
            {question.options.map((option, index) => {
              const isSelected = testState.userAnswers[testState.currentQuestion] === index;
              const isLocked = testState.questionLocked;
              
              return (
                <button
                  key={index}
                  onClick={() => !isLocked && selectOption(index)}
                  disabled={isLocked}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
                    isSelected && "border-primary bg-primary/10",
                    !isSelected && "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0",
                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" onClick={clearResponse} disabled={testState.questionLocked}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={markForReview}
            className="border-warning text-warning hover:bg-warning/10"
          >
            <Tag className="w-4 h-4 mr-1" />
            Mark
          </Button>
          <Button onClick={saveAndNext} className="gradient-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" />
            Save & Next
          </Button>
        </div>

        {!currentTest.forceTimeMode && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={previousQuestion}
              disabled={testState.currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmSubmit}
            >
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={nextQuestion}
              disabled={testState.currentQuestion === currentTest.questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {currentTest.forceTimeMode && (
          <div className="flex gap-3">
            <Button variant="destructive" onClick={confirmSubmit} className="flex-1">
              <Send className="w-4 h-4 mr-1" />
              Submit Test
            </Button>
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={currentTest.forceTimeMode ? handleSaveTest : handleExitTest}
          className="w-full text-muted-foreground"
        >
          {currentTest.forceTimeMode ? (
            <>
              <Save className="w-4 h-4 mr-1" />
              Save Test
            </>
          ) : (
            '🚪 Exit Test'
          )}
        </Button>
      </div>

      {/* Question Palette Modal */}
      <QuestionPalette 
        isOpen={showPalette} 
        onClose={() => setShowPalette(false)} 
      />
    </div>
  );
};

export default TestScreen;
