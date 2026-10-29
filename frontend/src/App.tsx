import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  ShoppingCart, 
  CreditCard,
  Building2,
  RotateCcw
} from 'lucide-react';
import { 
  Product, 
  CartSummary, 
  VerificationResult, 
  Receipt 
} from './types';
import { 
  fetchProducts, 
  fetchCart, 
  addToCart, 
  updateCartQuantity, 
  removeCartItem, 
  clearCart, 
  runCartVerification, 
  loadDemoScenario, 
  resetDemoState 
} from './api';

import { InstallPromptBanner } from './components/InstallPromptBanner';
import { InstallAppModal } from './components/InstallAppModal';
import { DemoControlBar } from './components/DemoControlBar';
import { BarcodeScannerPage } from './components/BarcodeScannerPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  // Navigation & View State: 'cart' | 'scan' | 'checkout' | 'admin'
  const [activeTab, setActiveTab] = useState<'cart' | 'scan' | 'checkout' | 'admin'>('cart');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Application Data State
  const [sessionId] = useState<string>('SES-DEMO-01');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeScenarioName, setActiveScenarioName] = useState<string>('');

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        const prods = await fetchProducts();
        setProducts(prods);

        const initialCart = await fetchCart(sessionId);
        setCart(initialCart);

        const initVerif = await runCartVerification(sessionId);
        setVerification(initVerif);
      } catch (e) {
        console.warn('Initial load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [sessionId]);

  // Cart Operations
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const updatedCart = await addToCart(sessionId, {
        productId: product.id,
        barcode: product.barcode,
        quantity
      });
      setCart(updatedCart);
      const verif = await runCartVerification(sessionId);
      setVerification(verif);
    } catch (e) {
      console.warn('Error adding to cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    setIsLoading(true);
    try {
      const updatedCart = await updateCartQuantity(sessionId, itemId, newQty);
      setCart(updatedCart);
      const verif = await runCartVerification(sessionId);
      setVerification(verif);
    } catch (e) {
      console.warn('Error updating qty:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      const updatedCart = await removeCartItem(sessionId, itemId);
      setCart(updatedCart);
      const verif = await runCartVerification(sessionId);
      setVerification(verif);
    } catch (e) {
      console.warn('Error removing item:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    setIsLoading(true);
    try {
      const updatedCart = await clearCart(sessionId);
      setCart(updatedCart);
      const verif = await runCartVerification(sessionId);
      setVerification(verif);
      setReceipt(null);
    } catch (e) {
      console.warn('Error clearing cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Scenarios Handler
  const handleSelectScenario = async (scenarioId: number) => {
    setIsLoading(true);
    try {
      const res = await loadDemoScenario(scenarioId, sessionId);
      setCart(res.cart);
      setVerification(res.verification);
      setActiveScenarioName(res.scenario_name);
      setReceipt(null);
      setActiveTab('cart');
    } catch (e) {
      console.warn('Error loading scenario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await resetDemoState();
      const updatedCart = await fetchCart(sessionId);
      setCart(updatedCart);
      const verif = await runCartVerification(sessionId);
      setVerification(verif);
      setReceipt(null);
      setActiveScenarioName('Reset to Clean State');
      setActiveTab('cart');
    } catch (e) {
      console.warn('Error resetting demo:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewShopping = () => {
    setReceipt(null);
    handleClearCart();
    setActiveTab('cart');
  };

  const cartItemCount = cart?.item_count || 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* PWA Install Banner */}
      <InstallPromptBanner onOpenModal={() => setIsInstallModalOpen(true)} />

      {/* Top Demo Bar */}
      <DemoControlBar
        sessionId={sessionId}
        activeView={activeTab === 'admin' ? 'admin' : 'mobile'}
        setActiveView={(v) => setActiveTab(v === 'admin' ? 'admin' : 'cart')}
        onSelectScenario={handleSelectScenario}
        onResetDemo={handleResetDemo}
        isLoading={isLoading}
        activeScenarioName={activeScenarioName}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Global Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Mobile-Aligned App Container */}
      <main className="flex-1 w-full max-w-md mx-auto bg-slate-50 min-h-screen shadow-lg sm:border-x sm:border-slate-200 flex flex-col relative pb-20 overflow-x-hidden">
        {/* VIEW 1: Cart Items */}
        {activeTab === 'cart' && (
          <CartPage
            cart={cart}
            verification={verification}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenScanner={() => setActiveTab('scan')}
            onProceedToCheckout={() => setActiveTab('checkout')}
            isLoading={isLoading}
          />
        )}

        {/* VIEW 2: Barcode Scanner */}
        {activeTab === 'scan' && (
          <BarcodeScannerPage
            onBackToCart={() => setActiveTab('cart')}
            onAddToCart={handleAddToCart}
            sampleProducts={products}
          />
        )}

        {/* VIEW 3: Payment Details & Receipt */}
        {activeTab === 'checkout' && (
          <CheckoutPage
            cart={cart}
            verification={verification}
            onPaymentSuccess={(r) => setReceipt(r)}
            onBackToCart={() => setActiveTab('cart')}
            onStartNewShopping={handleStartNewShopping}
            existingReceipt={receipt}
          />
        )}

        {/* VIEW 4: Admin (List of Items & Payment Details) */}
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {/* Mobile-Aligned Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 z-40 flex items-center justify-around shadow-md">
          {/* Cart Tab */}
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === 'cart' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Cart</span>
          </button>

          {/* Center Elevated Scanner Button */}
          <button
            onClick={() => setActiveTab('scan')}
            className="flex flex-col items-center py-1 px-3 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center -mt-6 shadow-md shadow-blue-500/30 group-active:scale-95 transition">
              <ScanLine className="w-6 h-6 font-bold" />
            </div>
            <span className="text-[10px] mt-0.5 text-blue-600 font-bold">Scan</span>
          </button>

          {/* Payment Tab */}
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === 'checkout' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Pay</span>
          </button>

          {/* Admin Tab */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;
