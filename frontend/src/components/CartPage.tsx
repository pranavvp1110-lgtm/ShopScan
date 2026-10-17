import React from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ScanLine, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { CartSummary, VerificationResult } from '../types';

interface CartPageProps {
  cart: CartSummary | null;
  verification: VerificationResult | null;
  onUpdateQty: (itemId: number, newQty: number) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
  onClearCart: () => Promise<void>;
  onOpenScanner: () => void;
  onProceedToCheckout: () => void;
  isLoading: boolean;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  verification,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenScanner,
  onProceedToCheckout,
  isLoading
}) => {
  const items = cart?.items || [];
  const itemCount = cart?.item_count || 0;
  const subtotal = cart?.subtotal || 0;
  const tax = cart?.tax || 0;
  const total = cart?.total || 0;

  const isVerified = verification?.verification_status === 'LOW_RISK' || verification?.is_clean;
  const hasDiscrepancy = verification?.verification_status === 'REVIEW_REQUIRED';

  return (
    <div className="pb-28 pt-3 px-4 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Items in Cart</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {itemCount}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">Scan barcodes to add items</p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <ScanLine className="w-4 h-4" />
          <span>Scan Item</span>
        </button>
      </div>

      {/* Verification Loss-Prevention Status Banner */}
      {items.length > 0 && (
        <div>
          {isVerified ? (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold">Cart Verified:</span> Sensor records match all items in cart.
              </div>
            </div>
          ) : hasDiscrepancy ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">Item Verification Notice:</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {verification?.summary || 'Cart discrepancy detected between sensor records and scanned items.'}
                </p>
                <button
                  onClick={onOpenScanner}
                  className="mt-2 text-xs font-bold text-blue-700 underline"
                >
                  Scan missing item
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="clean-card p-10 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Your Cart is Empty</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tap the button below to scan products and add them to your cart.
          </p>
          <button
            onClick={onOpenScanner}
            className="mt-4 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm inline-flex items-center gap-1.5 transition"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open Barcode Scanner</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="clean-card p-3 flex items-center space-x-3"
            >
              <img
                src={item.image_url}
                alt={item.product_name}
                className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product_name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-red-500 p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>${item.unit_price.toFixed(2)} each</span>
                  <span>•</span>
                  <span className="font-mono">{item.barcode}</span>
                </div>

                {/* Quantity and Line Total */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      disabled={isLoading}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      disabled={isLoading}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-blue-600 font-mono">
                    ${item.line_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <div className="text-right pt-1">
            <button
              onClick={onClearCart}
              className="text-[11px] text-slate-400 hover:text-red-600 underline"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}

      {/* Order Pricing Breakdown */}
      {items.length > 0 && (
        <div className="clean-card p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span>Sales Tax (8%)</span>
            <span className="font-mono font-medium">${tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
            <span>Total to Pay</span>
            <span className="text-base font-extrabold text-blue-600 font-mono">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      {items.length > 0 && (
        <div className="pt-1">
          <button
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center space-x-2 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Checkout (${total.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};
