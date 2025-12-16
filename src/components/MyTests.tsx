import { useState, useEffect } from 'react';
import { Screen } from '@/pages/Index';
import { useTestStore } from '@/store/testStore';
import { storage } from '@/lib/storage';
import { Test } from '@/types/test';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Play, Trash2, Zap, Plus } from 'lucide-react';

interface MyTestsProps {
  onNavigate: (screen: Screen) => void;
}

const MyTests = ({ onNavigate }: MyTestsProps) => {
  const [tests, setTests] = useState<Test[]>([]);
  const { setCurrentTest } = useTestStore();

  useEffect(() => {
    setTests(storage.getTests());
  }, []);

  const handleStartTest = (test: Test) => {
    setCurrentTest(test);
    onNavigate('preview');
  };

  const handleDeleteTest = (testId: number) => {
    if (!confirm('Delete this test? This cannot be undone.')) return;
    
    storage.deleteTest(testId);
    setTests(storage.getTests());
    toast.success('Test deleted');
  };

  const results = storage.getResults();

  if (tests.length === 0) {
    return (
      <div className="p-4 animate-fade-in">
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="bg-secondary p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">My Tests</h2>
          </div>
          <div className="p-8 text-center">
            <h3 className="font-semibold mb-2">No saved tests</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first test to get started</p>
            <Button onClick={() => onNavigate('create')} className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">My Tests</h2>
        </div>
        
        <div className="divide-y divide-border">
          {tests.map((test) => {
            const attempts = results.filter(r => r.testId === test.id).length;
            
            return (
              <div key={test.id} className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary truncate">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {test.questions.length} questions • {test.duration} min
                      {test.forceTimeMode && (
                        <span className="inline-flex items-center gap-1 ml-2 text-warning">
                          <Zap className="w-3 h-3" />
                          Force Time
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Attempts: {attempts}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartTest(test)}
                      className="gradient-primary text-primary-foreground"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTest(test.id)}
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

export default MyTests;
