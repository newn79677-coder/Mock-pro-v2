import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import CreateTest from '@/components/CreateTest';
import TestPreview from '@/components/TestPreview';
import TestScreen from '@/components/TestScreen';
import MyTests from '@/components/MyTests';
import Results from '@/components/Results';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useTestStore } from '@/store/testStore';
import { Toaster } from '@/components/ui/sonner';

export type Screen = 'dashboard' | 'create' | 'preview' | 'test' | 'my-tests' | 'results';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const { testState } = useTestStore();

  const isInTest = currentScreen === 'test' && testState;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} />;
      case 'create':
        return <CreateTest onNavigate={setCurrentScreen} />;
      case 'preview':
        return <TestPreview onNavigate={setCurrentScreen} />;
      case 'test':
        return <TestScreen onNavigate={setCurrentScreen} />;
      case 'my-tests':
        return <MyTests onNavigate={setCurrentScreen} />;
      case 'results':
        return <Results onNavigate={setCurrentScreen} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!isInTest && <Header onNavigate={setCurrentScreen} />}
      
      <main className={`${isInTest ? '' : 'pb-20'}`}>
        {renderScreen()}
      </main>
      
      {!isInTest && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}
      
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
