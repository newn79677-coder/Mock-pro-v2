import { useTestStore } from '@/store/testStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuestionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestionPalette = ({ isOpen, onClose }: QuestionPaletteProps) => {
  const { currentTest, testState, goToQuestion } = useTestStore();

  if (!isOpen || !currentTest || !testState) return null;

  const handleGoToQuestion = (index: number) => {
    if (currentTest.forceTimeMode) {
      toast.warning('Cannot navigate freely in Force Time Mode');
      return;
    }
    goToQuestion(index);
    onClose();
  };

  // Count stats
  let answered = 0, marked = 0, visited = 0, unvisited = 0;
  currentTest.questions.forEach((_, i) => {
    const status = testState.questionStatus[i];
    const hasAnswer = testState.userAnswers[i] !== undefined;
    
    if (hasAnswer) answered++;
    else if (status === 'marked') marked++;
    else if (status === 'visited') visited++;
    else unvisited++;
  });

  return (
    <div className="fixed inset-0 bg-background/80 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-xl shadow-elevated max-w-md w-full max-h-[80vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-primary">Question Palette</h3>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-border bg-secondary/50">
          <LegendItem color="bg-success" label="Answered" />
          <LegendItem color="bg-warning" label="Marked" />
          <LegendItem color="bg-destructive" label="Visited" />
          <LegendItem color="bg-border" label="Not Visited" />
        </div>

        {/* Question Grid */}
        <div className="p-4 max-h-[300px] overflow-auto">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
            {currentTest.questions.map((_, i) => {
              const status = testState.questionStatus[i];
              const hasAnswer = testState.userAnswers[i] !== undefined;
              const isCurrent = i === testState.currentQuestion;

              let bgClass = 'bg-secondary';
              if (hasAnswer) bgClass = 'bg-success text-success-foreground';
              else if (status === 'marked') bgClass = 'bg-warning text-warning-foreground';
              else if (status === 'visited') bgClass = 'bg-destructive text-destructive-foreground';

              return (
                <button
                  key={i}
                  onClick={() => handleGoToQuestion(i)}
                  className={cn(
                    "aspect-square rounded-lg font-semibold text-sm transition-all",
                    bgClass,
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                    !currentTest.forceTimeMode && "hover:scale-105"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-secondary/50 border-t border-border">
          <div className="grid grid-cols-4 gap-2 text-center">
            <StatItem count={answered} label="Answered" />
            <StatItem count={marked} label="Marked" />
            <StatItem count={visited} label="Not Ans." />
            <StatItem count={unvisited} label="Unvisited" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className={cn("w-4 h-4 rounded", color)} />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

const StatItem = ({ count, label }: { count: number; label: string }) => (
  <div>
    <span className="text-lg font-bold text-primary block">{count}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default QuestionPalette;
