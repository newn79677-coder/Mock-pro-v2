import { storage } from '@/lib/storage';
import { Screen } from '@/pages/Index';
import { FileText, BookOpen, BarChart3 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const stats = storage.getStats();

  return (
    <div className="p-4 animate-fade-in">
      {/* Hero Section */}
      <div className="gradient-hero rounded-xl p-6 mb-6 text-white shadow-elevated">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Welcome to Mock Test Pro!</h1>
          <p className="text-white/90 text-sm">Ready to ace your next test?</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-2xl font-bold block">{stats.testsTaken}</span>
            <span className="text-xs text-white/80">Tests Taken</span>
          </div>
          <div>
            <span className="text-2xl font-bold block">{stats.avgScore}%</span>
            <span className="text-xs text-white/80">Average Score</span>
          </div>
          <div>
            <span className="text-2xl font-bold block">{stats.bestScore}%</span>
            <span className="text-xs text-white/80">Best Score</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        <ActionCard
          icon={<FileText className="w-8 h-8" />}
          title="Create Test"
          description="Upload questions & start"
          onClick={() => onNavigate('create')}
        />
        <ActionCard
          icon={<BookOpen className="w-8 h-8" />}
          title="My Tests"
          description="Access saved tests"
          onClick={() => onNavigate('my-tests')}
        />
        <ActionCard
          icon={<BarChart3 className="w-8 h-8" />}
          title="Results"
          description="View performance"
          onClick={() => onNavigate('results')}
          className="col-span-2"
        />
      </div>
    </div>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const ActionCard = ({ icon, title, description, onClick, className = '' }: ActionCardProps) => (
  <button
    onClick={onClick}
    className={`bg-card border border-border rounded-xl p-5 text-center shadow-card 
      hover:shadow-elevated hover:-translate-y-0.5 transition-all ${className}`}
  >
    <div className="text-primary mb-3 flex justify-center">{icon}</div>
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
);

export default Dashboard;
