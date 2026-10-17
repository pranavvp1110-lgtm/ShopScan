import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Package, 
  RotateCw, 
  Search, 
  Check, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  User,
  DollarSign
} from 'lucide-react';
import { 
  AdminStats, 
  TransactionRecord, 
  Discrepancy, 
  Product 
} from '../types';
import { 
  fetchAdminStats, 
  fetchTransactions, 
  fetchDiscrepancies, 
  resolveDiscrepancy, 
  fetchProducts 
} from '../api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // The user requested: "in admin keep the list of items and payment details"
  const [activeTab, setActiveTab] = useState<'payments' | 'items'>('payments');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Transaction for receipt details
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);

  // Selected discrepancy for quick resolution
  const [selectedDisc, setSelectedDisc] = useState<Discrepancy | null>(null);
  const [staffName, setStaffName] = useState<string>('Associate Maya');
  const [resolutionReason, setResolutionReason] = useState<string>('Customer scanned missing item - verified by staff');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, txns, discs, prods] = await Promise.all([
        fetchAdminStats(),
        fetchTransactions('All'),
        fetchDiscrepancies('All'),
        fetchProducts()
      ]);
      setStats(s);
      setTransactions(txns);
      setDiscrepancies(discs);
      setProducts(prods);
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async () => {
    if (!selectedDisc?.id) return;
    try {
      await resolveDiscrepancy(selectedDisc.id, 'RESOLVE', resolutionReason, staffName);
      setSelectedDisc(null);
      await loadData();
    } catch (e) {
      console.warn('Error resolving:', e);
    }
  };

  const pendingDiscrepancies = discrepancies.filter(d => d.resolution_status === 'PENDING');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery.trim()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Store Admin Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of store payment transactions and product inventory.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Flagged Item Quick Banner if any */}
      {pendingDiscrepancies.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingDiscrepancies.length} Cart Discrepancy Flagged:</strong> {pendingDiscrepancies[0].description}
            </span>
          </div>
          <button
            onClick={() => setSelectedDisc(pendingDiscrepancies[0])}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
          >
            Review & Clear
          </button>
        </div>
      )}

      {/* Main Tabs: Payment Details vs List of Items */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Details ({transactions.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('items'); setSearchQuery(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'items'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>List of Items ({products.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'payments' ? "Search transactions by ID or payment..." : "Search items by name, barcode, or category..."}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
        />
      </div>

      {/* TAB 1: Payment Details & Transactions */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          {/* Mobile Card View (Small screens) */}
          <div className="space-y-2.5 sm:hidden">
            {filteredTransactions.map((txn) => (
              <div key={txn.id} className="clean-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-700">{txn.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {txn.payment_status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{txn.customer_name} • {txn.item_count} items</span>
                  <span className="font-mono font-bold text-slate-900">${txn.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>{txn.payment_method}</span>
                  <button
                    onClick={() => setSelectedTxn(txn)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    View Receipt Details →
                  </button>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="clean-card p-6 text-center text-slate-400 text-xs">
                No transactions found.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="clean-card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Amount Paid</th>
                    <th className="p-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-blue-50/40 transition">
                      <td className="p-3.5 font-mono font-bold text-blue-700">
                        {txn.id}
                      </td>
                      <td className="p-3.5 text-slate-500">{txn.created_at}</td>
                      <td className="p-3.5 font-medium text-slate-800">{txn.customer_name}</td>
                      <td className="p-3.5">{txn.item_count} items</td>
                      <td className="p-3.5 font-medium">{txn.payment_method}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {txn.payment_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        ${txn.total.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: List of Items (Inventory) */}
      {activeTab === 'items' && (
        <div className="space-y-3">
          {/* Mobile Item Card List (Small screens) */}
          <div className="space-y-2.5 sm:hidden">
            {filteredProducts.map((p) => (
              <div key={p.id} className="clean-card p-3 flex items-center space-x-3">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{p.barcode}</p>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="font-extrabold text-blue-600">${p.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.inventory_quantity > 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.inventory_quantity} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="clean-card p-6 text-center text-slate-400 text-xs">
                No products match your search.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="clean-card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Barcode</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition">
                      <td className="p-3.5 flex items-center space-x-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-900">{p.name}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{p.barcode}</td>
                      <td className="p-3.5 font-bold text-blue-600">${p.price.toFixed(2)}</td>
                      <td className="p-3.5 text-right font-medium">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.inventory_quantity > 20
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}>
                          {p.inventory_quantity} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  {selectedTxn.id}
                </h3>
                <p className="text-[11px] text-slate-500">{selectedTxn.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{selectedTxn.customer_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-900">{selectedTxn.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700">{selectedTxn.payment_status}</span>
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="border-y border-slate-100 py-2.5 max-h-48 overflow-y-auto space-y-1.5 text-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Purchased Items:</p>
              {selectedTxn.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-800">
                  <span>{it.quantity}× {it.name}</span>
                  <span className="font-mono font-semibold">${it.line_total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">${selectedTxn.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span className="font-mono">${selectedTxn.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-blue-600 font-mono text-base">${selectedTxn.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Discrepancy Resolution Modal */}
      {selectedDisc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Review Discrepancy
              </h3>
              <button
                onClick={() => setSelectedDisc(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <p className="font-bold">{selectedDisc.discrepancy_type}:</p>
              <p className="mt-1">{selectedDisc.description}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Resolution Reason:</label>
              <input
                type="text"
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Staff Associate Name:</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedDisc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Confirm & Clear Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
