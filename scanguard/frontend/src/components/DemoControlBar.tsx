import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  RotateCcw, 
  Smartphone, 
  ShieldCheck, 
  ShieldAlert,
  LayoutDashboard
} from 'lucide-react';

interface DemoControlBarProps {
  sessionId: string;
  activeView: 'mobile' | 'admin';
  setActiveView: (view: 'mobile' | 'admin') => void;
  onSelectScenario: (scenarioId: number) => Promise<void>;
  onResetDemo: () => Promise<void>;
  isLoading: boolean;
  activeScenarioName?: string;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  sessionId,
  activeView,
  setActiveView,
  onSelectScenario,
  onResetDemo,
  isLoading,
  activeScenarioName
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);

  const handleScenarioClick = async (id: number) => {
    setSelectedScenarioId(id);
    await onSelectScenario(id);
  };

  const handleReset = async () => {
    setSelectedScenarioId(null);
    await onResetDemo();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-2.5 shadow-sm text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                ScanGuard <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mobile Checkout & Loss Prevention
            </p>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline mr-1">
            Test Scenarios:
          </span>

          <button
            onClick={() => handleScenarioClick(1)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              selectedScenarioId === 1
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clean Cart</span>
          </button>

          <button
            onClick={() => handleScenarioClick(2)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              selectedScenarioId === 2
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Missed Scan</span>
          </button>

          <button
            onClick={() => handleScenarioClick(3)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              selectedScenarioId === 3
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Qty Mismatch</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1"
            title="Reset Cart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* View Switcher: Customer App vs Store Admin */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'mobile'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Shopper (Scanner & Cart)</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'admin'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {activeScenarioName && (
        <div className="max-w-6xl mx-auto mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700">
          <span>Active Demonstration: <strong>{activeScenarioName}</strong></span>
          <span className="text-slate-500 font-mono text-[10px]">Session: {sessionId}</span>
        </div>
      )}
    </header>
  );
};
