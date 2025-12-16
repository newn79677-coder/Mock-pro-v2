import { useState, useEffect } from 'react';
import { Screen } from '@/pages/Index';
import { storage } from '@/lib/storage';
import { TestResult } from '@/types/test';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Plus, Zap, Home } from 'lucide-react';

interface ResultsProps {
  onNavigate: (screen: Screen) => void;
}

const Results = ({ onNavigate }: ResultsProps) => {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    setResults(storage.getResults());
  }, []);

  const handleDeleteResult = (index: number) => {
    if (!confirm('Delete this result?')) return;
    
    storage.deleteResult(index);
    setResults(storage.getResults());
    toast.success('Result deleted');
  };

  const handleClearAll = () => {
    if (!confirm('Clear all results? This cannot be undone.')) return;
    
    storage.clearResults();
    setResults([]);
    toast.success('All results cleared');
  };

  if (results.length === 0) {
    return (
      <div className="p-4 animate-fade-in">
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="bg-secondary p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Test Results</h2>
          </div>
          <div className="p-8 text-center">
            <h3 className="font-semibold mb-2">No test results yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Take a test to see your results here</p>
            <Button onClick={() => onNavigate('create')} className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show latest result prominently if it exists
  const latestResult = results[results.length - 1];

  return (
    <div className="p-4 animate-fade-in space-y-4">
      {/* Latest Result Card */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Latest Result: {latestResult.title}</h2>
          <p className="text-sm text-muted-foreground">
            Completed on {new Date(latestResult.date).toLocaleString()}
            {latestResult.forceTimeMode && (
              <span className="inline-flex items-center gap-1 ml-2 text-warning">
                <Zap className="w-3 h-3" />
                Force Time Mode
              </span>
            )}
          </p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard 
              value={`${latestResult.score}/${latestResult.totalMarks}`} 
              label="Score" 
              className="bg-secondary"
            />
            <StatCard 
              value={`${latestResult.percentage}%`} 
              label="Percentage" 
              className="bg-secondary"
            />
            <StatCard 
              value={latestResult.correct} 
              label="Correct" 
              className="bg-success text-success-foreground"
            />
            <StatCard 
              value={latestResult.incorrect} 
              label="Incorrect" 
              className="bg-destructive text-destructive-foreground"
            />
          </div>
          
          <Button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full"
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* All Results */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">All Results ({results.length})</h2>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleClearAll}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
        
        <div className="divide-y divide-border max-h-[400px] overflow-auto">
          {[...results].reverse().map((result, index) => {
            const actualIndex = results.length - 1 - index;
            
            return (
              <div key={actualIndex} className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{result.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(result.date).toLocaleDateString()}
                      {result.forceTimeMode && (
                        <span className="inline-flex items-center gap-1 ml-2 text-warning">
                          <Zap className="w-3 h-3" />
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-primary">{result.percentage}%</span>
                      <p className="text-xs text-muted-foreground">
                        {result.correct}/{result.correct + result.incorrect + result.unanswered}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteResult(actualIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label, className = '' }: { value: string | number; label: string; className?: string }) => (
  <div className={`text-center p-4 rounded-lg ${className}`}>
    <span className="text-xl font-bold block">{value}</span>
    <span className="text-sm">{label}</span>
  </div>
);

export default Results;
