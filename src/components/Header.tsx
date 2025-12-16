import { Menu } from 'lucide-react';
import { Screen } from '@/pages/Index';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
}

const Header = ({ onNavigate }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">📚</span>
          </div>
          <h1 className="text-lg font-bold text-primary">Mock Test Pro</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
              <Menu className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
              🏠 Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('my-tests')}>
              📝 My Tests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('results')}>
              📊 Results
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
