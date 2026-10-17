import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCw, 
  Cpu, 
  Camera, 
  Scale, 
  ScanLine, 
  ArrowRight, 
  UserCheck, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { VerificationResult, CartSummary } from '../types';
import { analyzeCVImage } from '../api';

interface VerificationPageProps {
  cart: CartSummary | null;
  verification: VerificationResult | null;
  onRefreshVerification: () => Promise<void>;
  onOpenScanner: () => void;
  onProceedToCheckout: () => void;
  onBackToCart: () => void;
  isLoading: boolean;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  cart,
  verification,
  onRefreshVerification,
  onOpenScanner,
  onProceedToCheckout,
  onBackToCart,
  isLoading
}) => {
  const [cvResult, setCvResult] = useState<any | null>(null);
  const [cvLoading, setCvLoading] = useState<boolean>(false);
  const [staffNotified, setStaffNotified] = useState<boolean>(false);

  const status = verification?.verification_status || 'VERIFICATION_INCOMPLETE';
  const riskScore = verification?.risk_score ?? 15;
  const isClean = verification?.is_clean ?? false;
  const discrepancies = verification?.discrepancies || [];
  const sensorEvidence = verification?.sensor_evidence || [];

  const handleTestCV = async () => {
    setCvLoading(true);
    try {
      // Create a simulated 200x200 canvas with simulated retail items to run through OpenCV backend!
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 320, 240);
        // Draw 3 simulated boxes representing packaging in the basket
        ctx.fillStyle = '#22c55e'; // Green avocado box
        ctx.fillRect(40, 50, 70, 70);
        ctx.fillStyle = '#06b6d4'; // Blue bottle
        ctx.fillRect(150, 40, 50, 110);
        ctx.fillStyle = '#f59e0b'; // Amber snacks box
        ctx.fillRect(230, 80, 60, 60);
      }
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      const res = await analyzeCVImage(base64);
      setCvResult(res);
    } catch (e) {
      console.warn('CV analysis error:', e);
    } finally {
      setCvLoading(false);
    }
  };

  const handleCallStaff = () => {
    setStaffNotified(true);
    setTimeout(() => setStaffNotified(false), 4000);
  };

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-navy-800">
        <button
          onClick={onBackToCart}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <button
          onClick={onRefreshVerification}
          disabled={isLoading}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-cyan-400 border border-navy-700 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Re-run Verification Check"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-verify</span>
        </button>
      </div>

      {/* Hero Verification Status Shield */}
      <div className="mt-4">
        {status === 'LOW_RISK' && (
          <div className="rounded-2xl p-5 bg-gradient-to-b from-emerald-950/80 to-navy-900 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-400/40 mb-3">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              LOW RISK — VERIFIED
            </span>
            <h3 className="text-base font-bold text-white mt-2">
              All Basket Items Consistent
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Digital cart matches physical overhead vision records and smart scale readings. Ready for one-tap checkout.
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Risk Score</span>
                <span className="text-sm font-bold text-emerald-400">{riskScore}/100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Confidence</span>
                <span className="text-sm font-bold text-emerald-400">
                  {Math.round((verification?.confidence_level || 0.98) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Flag Status</span>
                <span className="text-sm font-bold text-emerald-400">Zero Flags</span>
              </div>
            </div>
          </div>
        )}

        {status === 'REVIEW_REQUIRED' && (
          <div className="rounded-2xl p-5 bg-gradient-to-b from-rose-950/80 to-navy-900 border-2 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)] text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border-2 border-rose-400/40 mb-3 animate-pulse">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
              REVIEW REQUIRED
            </span>
            <h3 className="text-base font-bold text-white mt-2">
              Item Discrepancy Detected
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              {verification?.summary || 'A mismatch needs a re-scan or associate verification before checkout can be completed.'}
            </p>

            <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Risk Score</span>
                <span className="text-sm font-bold text-rose-400">{riskScore}/100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Issues</span>
                <span className="text-sm font-bold text-rose-400">{discrepancies.length} Flagged</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Action</span>
                <span className="text-sm font-bold text-rose-300">Re-scan / Review</span>
              </div>
            </div>
          </div>
        )}

        {status === 'VERIFICATION_INCOMPLETE' && (
          <div className="rounded-2xl p-5 bg-gradient-to-b from-navy-900 to-navy-950 border-2 border-cyan-500/40 shadow-glow-cyan text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border-2 border-cyan-400/30 mb-3">
              <HelpCircle className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              VERIFICATION INCOMPLETE
            </span>
            <h3 className="text-base font-bold text-white mt-2">
              Awaiting Physical Sensor Data
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Smart cart overhead camera or scale data has not been received yet. Place items inside the detection area.
            </p>
          </div>
        )}
      </div>

      {/* Discrepancy Details List */}
      {discrepancies.length > 0 && (
        <div className="mt-5 space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 px-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Detected Discrepancies ({discrepancies.length})</span>
          </h4>

          {discrepancies.map((disc, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-xl p-3.5 border-l-4 border-l-rose-500 border-navy-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {disc.discrepancy_type.replace('_', ' ')}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  disc.resolution_status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  Status: {disc.resolution_status}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {disc.description}
              </p>

              {(disc.expected_quantity !== undefined || disc.observed_quantity !== undefined) && (
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 bg-navy-900/90 p-2 rounded-lg border border-navy-800">
                  <span>Cart Expected: <strong className="text-white">{disc.expected_quantity ?? 0}</strong></span>
                  <span>•</span>
                  <span>Sensors Observed: <strong className="text-cyan-400">{disc.observed_quantity ?? 0}</strong></span>
                </div>
              )}

              <div className="p-2 rounded-lg bg-navy-900/60 text-[11px] text-cyan-300 border border-cyan-500/20">
                <strong>Recommended Next Action:</strong> {disc.recommended_action}
              </div>

              {disc.resolution_reason && (
                <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  <strong>Staff Resolution Reason:</strong> {disc.resolution_reason} ({disc.resolved_by})
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sensor Evidence Stream */}
      <div className="mt-5 glass-panel rounded-2xl p-4 border border-navy-700">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Sensor Feeds & Evidence</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {sensorEvidence.length} Events Logged
          </span>
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {sensorEvidence.map((ev, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-navy-900/80 border border-navy-800 flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center space-x-2">
                {ev.type === 'SMART_SCALE' ? (
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <div>
                  <p className="font-semibold text-white">{ev.source}</p>
                  <p className="text-[10px] text-slate-400">
                    {ev.product_name || ev.barcode || ev.type}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-navy-950 px-1.5 py-0.5 rounded border border-navy-700">
                Observed: {ev.observed_quantity ?? 1}
              </span>
            </div>
          ))}

          {sensorEvidence.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">
              No physical sensor telemetry registered for this session.
            </p>
          )}
        </div>
      </div>

      {/* OpenCV AI Visual Inspector Card */}
      <div className="mt-4 glass-panel rounded-2xl p-4 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>OpenCV Vision Module (Python Edge AI)</span>
          </span>
          <button
            onClick={handleTestCV}
            disabled={cvLoading}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-purple/20 hover:bg-brand-purple/40 text-purple-300 border border-brand-purple/40 transition"
          >
            {cvLoading ? 'Processing...' : 'Run CV Contour Test'}
          </button>
        </div>
        <p className="text-[11px] text-slate-300">
          Executes real OpenCV contour extraction, HSV color classification, and packaging bounding box detection.
        </p>

        {cvResult && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-[11px] font-mono text-slate-300 space-y-1">
            <p className="text-emerald-400 font-bold">
              ✓ OpenCV {cvResult.opencv_version}: Detected {cvResult.detected_item_count} items
            </p>
            <p className="text-slate-400 text-[10px]">
              Frame: {cvResult.frame_dimensions?.width}x{cvResult.frame_dimensions?.height}px • Sharpness: {cvResult.image_quality?.sharpness_variance}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-y-2.5">
        {status === 'LOW_RISK' || isClean ? (
          <button
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-navy-950 shadow-glow-cyan flex items-center justify-center space-x-2 transition active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onOpenScanner}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 shadow-glow-cyan flex items-center justify-center space-x-2 transition active:scale-[0.99]"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Missing / Additional Item</span>
            </button>

            <button
              onClick={handleCallStaff}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 flex items-center justify-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4 text-brand-purple" />
              <span>{staffNotified ? 'Associate Alerted — Assistance Dispatched!' : 'Request Associate Basket Verification'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
