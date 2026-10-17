import React, { useState } from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Lock, 
  ArrowLeft, 
  RotateCcw, 
  AlertTriangle,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartSummary, Receipt, VerificationResult } from '../types';
import { executeCheckout } from '../api';

interface CheckoutPageProps {
  cart: CartSummary | null;
  verification: VerificationResult | null;
  onPaymentSuccess: (receipt: Receipt) => void;
  onBackToCart: () => void;
  onStartNewShopping: () => void;
  existingReceipt: Receipt | null;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  verification,
  onPaymentSuccess,
  onBackToCart,
  onStartNewShopping,
  existingReceipt
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('Apple Pay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(existingReceipt);

  const handlePay = async () => {
    if (!cart) return;
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const res = await executeCheckout(cart.session_id, selectedMethod, false);

      if (res.success && res.receipt) {
        setReceipt(res.receipt);
        onPaymentSuccess(res.receipt);
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      } else {
        setCheckoutError(res.message);
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Receipt & Payment Details View
  if (receipt) {
    return (
      <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Payment Successful</h2>
          <p className="text-xs text-slate-500">Your digital receipt and exit pass are ready</p>
        </div>

        {/* Clean White & Blue Digital Receipt Card */}
        <div className="clean-card border-2 border-blue-600 p-5 shadow-sm space-y-4">
          <div className="text-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">ScanGuard Retail Store</h3>
            <p className="text-xs text-slate-500 mt-0.5">{receipt.store_address}</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-mono text-blue-700 font-semibold">
              <span>{receipt.transaction_id}</span>
              <span>•</span>
              <span>{receipt.date_time}</span>
            </div>
          </div>

          {/* Gate Exit Pass */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>STORE EXIT GATE PASS</span>
            </p>
            {/* Visual Barcode representation */}
            <div className="h-10 bg-white border border-slate-200 rounded p-1.5 flex items-center justify-center space-x-1">
              {[4, 2, 3, 1, 4, 2, 5, 2, 4, 1, 3, 2, 4, 5, 2, 3, 1, 4, 2, 5, 3, 2, 4].map((w, i) => (
                <div key={i} className="h-full bg-slate-900" style={{ width: `${w * 2.2}px` }} />
              ))}
            </div>
            <p className="text-[11px] font-mono font-bold text-slate-700">
              Pass Code: {receipt.exit_pass_code}
            </p>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
            <div className="flex justify-between font-bold text-slate-500 text-[11px] uppercase">
              <span>Item</span>
              <span>Total</span>
            </div>
            {receipt.purchased_products.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-mono font-semibold text-slate-900 shrink-0">
                  ${item.line_total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Payment & Totals */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span className="font-mono">${receipt.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Paid</span>
              <span className="text-base text-blue-600 font-mono">${receipt.final_total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Payment Method:</span>
              <span className="font-semibold text-slate-800">{receipt.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Start New Session */}
        <button
          onClick={onStartNewShopping}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center space-x-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Shopping Cart</span>
        </button>
      </div>
    );
  }

  // Pre-Payment Form
  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onBackToCart}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div className="text-right">
          <h2 className="text-sm font-bold text-slate-900">Payment Details</h2>
          <p className="text-[11px] text-slate-500">Fast checkout</p>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="clean-card p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Payment Method
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          {['Apple Pay', 'Google Pay', 'Credit Card', 'UPI / Cash'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                selectedMethod === method
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {method.includes('Pay') ? (
                <Smartphone className="w-4 h-4 text-blue-600" />
              ) : (
                <CreditCard className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-xs font-bold">{method}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bill Summary */}
      <div className="clean-card p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Order Summary
        </h4>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Items ({cart?.item_count || 0})</span>
          <span className="font-mono">${(cart?.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Sales Tax (8%)</span>
          <span className="font-mono">${(cart?.tax || 0).toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
          <span>Total</span>
          <span className="text-base text-blue-600 font-mono">
            ${(cart?.total || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {checkoutError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Checkout Notice</p>
            <p className="text-[11px] text-red-600 mt-0.5">{checkoutError}</p>
          </div>
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={isProcessing || !cart || cart.items.length === 0}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
      >
        <Lock className="w-4 h-4" />
        <span>
          {isProcessing
            ? 'Processing Payment...'
            : `Pay $${(cart?.total || 0).toFixed(2)} via ${selectedMethod}`}
        </span>
      </button>
    </div>
  );
};
