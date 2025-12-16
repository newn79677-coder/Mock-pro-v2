import { Screen } from '@/pages/Index';
import { useTestStore } from '@/store/testStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, Zap } from 'lucide-react';

interface TestPreviewProps {
  onNavigate: (screen: Screen) => void;
}

const TestPreview = ({ onNavigate }: TestPreviewProps) => {
  const { currentTest, startTest } = useTestStore();

  if (!currentTest) {
    onNavigate('dashboard');
    return null;
  }

  const totalMarks = currentTest.questions.length * currentTest.positiveMarks;
  const modeText = currentTest.forceTimeMode 
    ? `Force Time Mode (${currentTest.forceTimeMinutes} min per question)` 
    : 'Normal Mode (Free Navigation)';

  const handleStartTest = () => {
    startTest(currentTest);
    onNavigate('test');
  };

  return (
    <div className="p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">{currentTest.title}</h2>
          <p className="text-sm text-muted-foreground">Review test settings before starting</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard value={currentTest.questions.length} label="Questions" />
            <StatCard value={`${currentTest.duration} min`} label="Total Duration" />
            <StatCard value={totalMarks} label="Total Marks" />
            <StatCard 
              value={`+${currentTest.positiveMarks}/-${currentTest.negativeMarks}`} 
              label="Marking Scheme" 
            />
          </div>

          <div className={`text-center p-4 rounded-lg border ${
            currentTest.forceTimeMode 
              ? 'bg-warning/10 border-warning/30' 
              : 'bg-secondary border-border'
          }`}>
            <strong className={currentTest.forceTimeMode ? 'text-warning' : 'text-foreground'}>
              {currentTest.forceTimeMode && <Zap className="w-4 h-4 inline mr-1" />}
              {modeText}
            </strong>
            {currentTest.forceTimeMode && currentTest.compoundTimeEnabled && (
              <p className="text-xs text-success mt-2">
                🎁 Compound Time: Unused time carries over to next question!
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleStartTest}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start Test
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('create')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label }: { value: string | number; label: string }) => (
  <div className="text-center bg-secondary p-4 rounded-lg">
    <span className="text-xl font-bold text-primary block">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default TestPreview;
