import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ScanLine, 
  Plus, 
  ShoppingCart, 
  Tag, 
  Weight, 
  Check, 
  SlidersHorizontal,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, CartSummary } from '../types';

interface ShoppingHomePageProps {
  products: Product[];
  cart: CartSummary | null;
  onAddToCart: (product: Product) => Promise<void>;
  onOpenScanner: () => void;
  onOpenCart: () => void;
  isLoading: boolean;
}

const CATEGORIES = ['All', 'Groceries', 'Beverages', 'Snacks', 'Personal Care', 'Household'];

export const ShoppingHomePage: React.FC<ShoppingHomePageProps> = ({
  products,
  cart,
  onAddToCart,
  onOpenScanner,
  onOpenCart,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = 
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery.trim()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddClick = async (product: Product) => {
    setAddedProductId(product.id);
    await onAddToCart(product);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  const cartCount = cart?.item_count || 0;
  const cartTotal = cart?.total || 0;

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-2xl mx-auto">
      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <span>ScanGuard Store</span>
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
              Station #104
            </span>
          </h2>
          <p className="text-xs text-slate-400">Scan barcodes or add items directly to your cart</p>
        </div>

        {/* Quick Cart Indicator Button */}
        <button
          onClick={onOpenCart}
          className="relative p-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-white transition flex items-center gap-2"
          aria-label="View Cart"
        >
          <ShoppingCart className="w-5 h-5 text-cyan-400" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-brand-purple text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-navy-950 shadow-md">
              {cartCount}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            ${cartTotal.toFixed(2)}
          </span>
        </button>
      </div>

      {/* Hero Scanner Banner */}
      <div className="mt-3 relative rounded-2xl overflow-hidden bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950 p-4 border border-cyan-500/25 shadow-glow-cyan">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mobile Self-Checkout</span>
            </div>
            <h3 className="text-base font-bold text-white leading-tight">
              Ready to scan items from store shelves?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Point your camera at any product barcode to add it in seconds.
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="px-4 py-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-navy-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-500/30 transition transform active:scale-95 shrink-0"
          >
            <ScanLine className="w-5 h-5" />
            <span>Open Scanner</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mt-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product name, category, or barcode..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900/90 border border-navy-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-navy-950 font-semibold shadow-sm shadow-cyan-500/20'
                : 'bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
          const isAdded = addedProductId === product.id;
          const cartItem = cart?.items.find((i) => i.product_id === product.id);

          return (
            <div
              key={product.id}
              className="glass-panel glass-panel-hover rounded-xl p-3 flex flex-col justify-between relative group"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-navy-900 mb-2.5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <span className="absolute top-1.5 left-1.5 bg-navy-950/80 backdrop-blur-sm text-[10px] text-cyan-300 px-1.5 py-0.5 rounded font-medium border border-cyan-500/20">
                  {product.category}
                </span>

                {cartItem && (
                  <span className="absolute top-1.5 right-1.5 bg-brand-purple text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    {cartItem.quantity} in cart
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div>
                <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug min-h-[2rem]">
                  {product.name}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] text-slate-400 bg-navy-900 px-1 rounded border border-navy-700">
                    {product.barcode.slice(-6)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Weight className="w-2.5 h-2.5" />
                    {product.weight_grams}g
                  </span>
                </div>
              </div>

              {/* Price & Add to Cart Button */}
              <div className="mt-3 pt-2 border-t border-navy-700/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleAddClick(product)}
                  disabled={isLoading}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-navy-950 border border-cyan-500/40'
                  }`}
                  title="Add to digital cart"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium">No products match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-2 text-xs text-cyan-400 underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Checkout Bottom Bar if cart has items */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40">
          <div className="bg-navy-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                {cartCount}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Running Total</p>
                <p className="text-sm font-bold text-white">${cartTotal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-brand-purple text-white shadow-glow-cyan flex items-center gap-1.5 transition active:scale-95"
            >
              <span>View Cart & Verify</span>
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
