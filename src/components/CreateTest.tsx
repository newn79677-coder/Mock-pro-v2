import { useState } from 'react';
import { Screen } from '@/pages/Index';
import { useTestStore } from '@/store/testStore';
import { Test, Question } from '@/types/test';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Copy, ArrowLeft, Zap, Clock } from 'lucide-react';

interface CreateTestProps {
  onNavigate: (screen: Screen) => void;
}

const sampleJSON = `[
  {
    "question": "What is 2 + 2?",
    "options": ["2", "3", "4", "5"],
    "correct": 2,
    "explanation": "Basic addition: 2 + 2 = 4"
  },
  {
    "question": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Venus", "Mars", "Jupiter"],
    "correct": 2,
    "explanation": "Mars is called the Red Planet due to its iron oxide surface."
  },
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Madrid", "Paris"],
    "correct": 3,
    "explanation": "Paris is the capital city of France."
  }
]`;

const CreateTest = ({ onNavigate }: CreateTestProps) => {
  const { setCurrentTest } = useTestStore();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [positiveMarks, setPositiveMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [forceTimeMode, setForceTimeMode] = useState(false);
  const [forceTimeMinutes, setForceTimeMinutes] = useState(2);
  const [compoundTimeEnabled, setCompoundTimeEnabled] = useState(true);
  const [questionsJson, setQuestionsJson] = useState('');

  const copySampleJSON = () => {
    navigator.clipboard.writeText(sampleJSON);
    toast.success('Sample JSON copied to clipboard!');
  };

  const handleCreateTest = () => {
    if (!title.trim()) {
      toast.error('Please enter a test title');
      return;
    }

    if (!questionsJson.trim()) {
      toast.error('Please enter questions JSON');
      return;
    }

    if (forceTimeMode && (forceTimeMinutes < 1 || forceTimeMinutes > 10)) {
      toast.error('Force time must be between 1 and 10 minutes');
      return;
    }

    try {
      const questions: Question[] = JSON.parse(questionsJson);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid format - must be array of questions');
      }

      questions.forEach((q, i) => {
        if (!q.question || !Array.isArray(q.options) || typeof q.correct !== 'number') {
          throw new Error(`Invalid question ${i + 1} - must have question, options array, and correct index`);
        }
        if (!q.explanation) {
          q.explanation = "No explanation provided.";
        }
      });

      const test: Test = {
        id: Date.now(),
        title: title.trim(),
        duration,
        positiveMarks,
        negativeMarks,
        questions,
        forceTimeMode,
        forceTimeMinutes,
        compoundTimeEnabled: forceTimeMode && compoundTimeEnabled,
        created: new Date().toISOString(),
      };

      setCurrentTest(test);
      toast.success('Test created successfully!');
      onNavigate('preview');
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="bg-secondary p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Create New Test</h2>
          <p className="text-sm text-muted-foreground">Upload questions in JSON format</p>
        </div>
        
        <div className="p-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              placeholder="Enter test title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Total Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            />
          </div>

          {/* Force Time Mode Section */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <Label className="font-semibold">Force Time Mode</Label>
              </div>
              <Switch
                checked={forceTimeMode}
                onCheckedChange={setForceTimeMode}
              />
            </div>
            
            {forceTimeMode && (
              <>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Time per question:</span>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={forceTimeMinutes}
                    onChange={(e) => setForceTimeMinutes(parseInt(e.target.value) || 2)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>

                {/* Compound Time Option */}
                <div className="flex items-center justify-between bg-success/10 rounded-lg p-3 border border-success/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-success font-medium text-sm">🎁 Compound Time</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leftover time from current question adds to the next question
                    </p>
                  </div>
                  <Switch
                    checked={compoundTimeEnabled}
                    onCheckedChange={setCompoundTimeEnabled}
                  />
                </div>
              </>
            )}
            
            <p className="text-xs text-muted-foreground">
              ⚡ Force Time Mode: Set custom time per question (1-10 min). 
              {compoundTimeEnabled && forceTimeMode && " Unused time carries over to next question!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positive">Positive Marks</Label>
              <Input
                id="positive"
                type="number"
                min={1}
                step={0.25}
                value={positiveMarks}
                onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 4)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="negative">Negative Marks</Label>
              <Input
                id="negative"
                type="number"
                min={0}
                step={0.25}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json">Questions JSON</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copySampleJSON}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Sample
              </Button>
            </div>
            <Textarea
              id="json"
              placeholder="Paste your questions JSON here..."
              value={questionsJson}
              onChange={(e) => setQuestionsJson(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Copy the sample JSON → paste into any AI and ask it to produce questions in the same format.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreateTest}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              Create Test
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
