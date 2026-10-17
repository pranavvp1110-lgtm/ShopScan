import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  ScanLine, 
  ShoppingCart, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Cpu, 
  Scale, 
  CheckCircle2,
  Users
} from 'lucide-react';

interface WelcomePageProps {
  onStartCustomer: () => void;
  onOpenAdmin: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartCustomer,
  onOpenAdmin
}) => {
  return (
    <div className="min-h-full flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top Brand Header */}
      <div className="text-center pt-4 sm:pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-glow-cyan mb-4">
          <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-cyan-400 animate-pulse-slow" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          ScanGuard <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          “Shop Freely. Scan Smartly. Prevent Loss Intelligently.”
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800/80 border border-cyan-500/30 text-[11px] text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Autonomous Retail & Loss Prevention Engine
        </div>
      </div>

      {/* How Scan & Go Works Cards */}
      <div className="my-6 space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 px-1">
          How Smart Scan & Go Works
        </h2>

        <div className="glass-panel rounded-xl p-3.5 flex items-start space-x-3 border-l-4 border-l-cyan-500">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">1. Scan Items On-The-Go</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Use your phone's camera to scan barcodes right from store shelves. Items instantly appear in your digital basket.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5 flex items-start space-x-3 border-l-4 border-l-brand-purple">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">2. Passive Sensor Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Smart overhead vision and cart scales cross-reference items in real time to prevent missed scans and accidental errors.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5 flex items-start space-x-3 border-l-4 border-l-emerald-500">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">3. Instant Checkout & Gate Pass</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Pay with one tap. Low-risk sessions receive an instant digital gate exit pass with zero checkout counter lines.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-4">
        <button
          onClick={onStartCustomer}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-950 shadow-glow-cyan flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Continue as Demo Customer</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={onOpenAdmin}
          className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 flex items-center justify-center space-x-2 transition"
        >
          <Users className="w-3.5 h-3.5 text-brand-purple" />
          <span>Store Staff & Admin Demo Access</span>
        </button>

        <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1 mt-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Server-side protected • Hackathon Prototype Mode</span>
        </p>
      </div>
    </div>
  );
};
