import {
  Product,
  CartSummary,
  VerificationResult,
  Receipt,
  AdminStats,
  TransactionRecord,
  Discrepancy
} from './types';

const ENV_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
const API_BASE = ENV_URL ? `${ENV_URL.replace(/\/$/, '')}/api` : '/api';

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductByBarcode(barcode: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(barcode)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Barcode '${barcode}' not found`);
  }
  return res.json();
}

export async function startShoppingSession(customerName?: string): Promise<{ session_id: string; customer_name: string }> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: customerName || 'Demo Customer' })
  });
  if (!res.ok) throw new Error('Failed to create shopping session');
  return res.json();
}

export async function fetchCart(sessionId: string): Promise<CartSummary> {
  const res = await fetch(`${API_BASE}/cart/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(
  sessionId: string,
  payload: { productId?: number; barcode?: string; quantity?: number }
): Promise<CartSummary> {
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
  return res.json();
}

export async function updateCartQuantity(
  sessionId: string,
  itemId: number,
  quantity: number
): Promise<CartSummary> {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) throw new Error('Failed to update cart item');
  return res.json();
}

export async function removeCartItem(sessionId: string, itemId: number): Promise<CartSummary> {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${itemId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  return res.json();
}

export async function clearCart(sessionId: string): Promise<CartSummary> {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/clear`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}

export async function runCartVerification(sessionId: string): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/verify/${sessionId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run cart verification');
  return res.json();
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
  return res.json();
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export async function fetchTransactions(statusFilter?: string): Promise<TransactionRecord[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'All') params.append('status_filter', statusFilter);
  const res = await fetch(`${API_BASE}/admin/transactions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchDiscrepancies(statusFilter?: string): Promise<Discrepancy[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'All') params.append('resolution_status', statusFilter);
  const res = await fetch(`${API_BASE}/admin/discrepancies?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch discrepancies');
  return res.json();
}

export async function resolveDiscrepancy(
  discrepancyId: number,
  action: 'RESOLVE' | 'DISMISS',
  reason: string,
  staffName: string = 'Store Associate'
): Promise<{ status: string; message: string }> {
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
  return res.json();
}

export async function fetchAnalytics(): Promise<{
  hourly_traffic: Array<{ hour: string; scans: number; clean_checkouts: number; flags: number }>;
  discrepancy_types: Array<{ name: string; count: number; color: string }>;
  resolution_outcomes: Array<{ name: string; value: number }>;
}> {
  const res = await fetch(`${API_BASE}/admin/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function loadDemoScenario(scenarioId: number, sessionId: string): Promise<{
  status: string;
  scenario_name: string;
  scenario_description: string;
  cart: CartSummary;
  verification: VerificationResult;
}> {
  const res = await fetch(`${API_BASE}/demo/scenario/${scenarioId}?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to load demo scenario');
  return res.json();
}

export async function resetDemoState(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo state');
  return res.json();
}

export async function analyzeCVImage(base64Image: string): Promise<any> {
  const res = await fetch(`${API_BASE}/verify/cv-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
  if (!res.ok) throw new Error('Failed to run computer vision analysis');
  return res.json();
}
