import {
  Product,
  CartSummary,
  VerificationResult,
  Receipt,
  AdminStats,
  TransactionRecord,
  Discrepancy
} from './types';

import {
  MOCK_PRODUCTS,
  computeMockCartSummary,
  mockAddToCart,
  mockUpdateQty,
  mockRemoveItem,
  mockClearCart,
  mockVerify,
  mockExecuteCheckout,
  mockLoadScenario,
  mockAdminStats,
  mockTransactions,
  mockDiscrepancies,
  mockAnalytics
} from './mockData';

const ENV_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
const API_BASE = ENV_URL ? `${ENV_URL.replace(/\/$/, '')}/api` : '/api';

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.info('Using client offline mock data for products');
    let list = [...MOCK_PRODUCTS];
    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
    }
    return list;
  }
}

export async function fetchProductByBarcode(barcode: string): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(barcode)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Barcode '${barcode}' not found`);
    }
    return await res.json();
  } catch (err) {
    const found = MOCK_PRODUCTS.find(p => p.barcode === barcode);
    if (found) return found;
    throw new Error(`Barcode '${barcode}' not found in store catalogue`);
  }
}

export async function startShoppingSession(customerName?: string): Promise<{ session_id: string; customer_name: string }> {
  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: customerName || 'Pranav (Demo Customer)' })
    });
    if (!res.ok) throw new Error('Failed to create shopping session');
    return await res.json();
  } catch (err) {
    return {
      session_id: 'SES-DEMO-01',
      customer_name: customerName || 'Pranav (Demo Customer)'
    };
  }
}

export async function fetchCart(sessionId: string): Promise<CartSummary> {
  try {
    const res = await fetch(`${API_BASE}/cart/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    return await res.json();
  } catch (err) {
    return computeMockCartSummary(sessionId);
  }
}

export async function addToCart(
  sessionId: string,
  payload: { productId?: number; barcode?: string; quantity?: number }
): Promise<CartSummary> {
  try {
    const res = await fetch(`${API_BASE}/cart/${sessionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: payload.productId,
        barcode: payload.barcode,
        quantity: payload.quantity || 1
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add item to cart');
    }
    return await res.json();
  } catch (err) {
    return mockAddToCart(sessionId, payload.productId, payload.barcode, payload.quantity || 1);
  }
}

export async function updateCartQuantity(
  sessionId: string,
  itemId: number,
  quantity: number
): Promise<CartSummary> {
  try {
    const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error('Failed to update cart item');
    return await res.json();
  } catch (err) {
    return mockUpdateQty(sessionId, itemId, quantity);
  }
}

export async function removeCartItem(sessionId: string, itemId: number): Promise<CartSummary> {
  try {
    const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove cart item');
    return await res.json();
  } catch (err) {
    return mockRemoveItem(sessionId, itemId);
  }
}

export async function clearCart(sessionId: string): Promise<CartSummary> {
  try {
    const res = await fetch(`${API_BASE}/cart/${sessionId}/clear`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear cart');
    return await res.json();
  } catch (err) {
    return mockClearCart(sessionId);
  }
}

export async function runCartVerification(sessionId: string): Promise<VerificationResult> {
  try {
    const res = await fetch(`${API_BASE}/verify/${sessionId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run cart verification');
    return await res.json();
  } catch (err) {
    return mockVerify(sessionId);
  }
}

export async function executeCheckout(
  sessionId: string,
  paymentMethod: string = 'Apple Pay',
  allowOverride: boolean = false
): Promise<{
  success: boolean;
  message: string;
  transaction_id?: string;
  receipt?: Receipt;
  discrepancies?: Discrepancy[];
}> {
  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        payment_method: paymentMethod,
        allow_override_flag: allowOverride
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Checkout process encountered an error');
    }
    return await res.json();
  } catch (err) {
    return mockExecuteCheckout(sessionId, paymentMethod, allowOverride);
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json();
  } catch (err) {
    return mockAdminStats();
  }
}

export async function fetchTransactions(statusFilter?: string): Promise<TransactionRecord[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') params.append('status_filter', statusFilter);
    const res = await fetch(`${API_BASE}/admin/transactions?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch (err) {
    let txns = mockTransactions();
    if (statusFilter && statusFilter !== 'All') {
      txns = txns.filter(t => t.verification_status === statusFilter);
    }
    return txns;
  }
}

export async function fetchDiscrepancies(statusFilter?: string): Promise<Discrepancy[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') params.append('resolution_status', statusFilter);
    const res = await fetch(`${API_BASE}/admin/discrepancies?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch discrepancies');
    return await res.json();
  } catch (err) {
    let list = mockDiscrepancies();
    if (statusFilter && statusFilter !== 'All') {
      list = list.filter(d => d.resolution_status === statusFilter);
    }
    return list;
  }
}

export async function resolveDiscrepancy(
  discrepancyId: number,
  action: 'RESOLVE' | 'DISMISS',
  reason: string,
  staffName: string = 'Store Associate'
): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/discrepancies/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discrepancy_id: discrepancyId,
        resolution_action: action,
        resolution_reason: reason,
        staff_name: staffName
      })
    });
    if (!res.ok) throw new Error('Failed to resolve discrepancy');
    return await res.json();
  } catch (err) {
    return {
      status: 'RESOLVED',
      message: `Discrepancy #${discrepancyId} successfully cleared by ${staffName}.`
    };
  }
}

export async function fetchAnalytics(): Promise<{
  hourly_traffic: Array<{ hour: string; scans: number; clean_checkouts: number; flags: number }>;
  discrepancy_types: Array<{ name: string; count: number; color: string }>;
  resolution_outcomes: Array<{ name: string; value: number }>;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    return mockAnalytics();
  }
}

export async function loadDemoScenario(scenarioId: number, sessionId: string): Promise<{
  status: string;
  scenario_name: string;
  scenario_description: string;
  cart: CartSummary;
  verification: VerificationResult;
}> {
  try {
    const res = await fetch(`${API_BASE}/demo/scenario/${scenarioId}?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to load demo scenario');
    return await res.json();
  } catch (err) {
    return mockLoadScenario(scenarioId, sessionId);
  }
}

export async function resetDemoState(): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset demo state');
    return await res.json();
  } catch (err) {
    mockClearCart('SES-DEMO-01');
    return { status: 'success', message: 'Demo state reset successfully.' };
  }
}

export async function analyzeCVImage(base64Image: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/verify/cv-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });
    if (!res.ok) throw new Error('Failed to run computer vision analysis');
    return await res.json();
  } catch (err) {
    return {
      status: 'simulated',
      contours_detected: 2,
      confidence: 0.94,
      note: 'Vision edge module simulation fallback'
    };
  }
}
