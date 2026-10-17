export interface Product {
  id: number;
  barcode: string;
  name: string;
  category: string;
  price: number;
  inventory_quantity: number;
  image_url: string;
  weight_grams: number;
  description?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  barcode: string;
  category: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  weight_grams: number;
}

export interface CartSummary {
  session_id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  tax: number;
  total: number;
  calculated_weight_grams: number;
}

export interface Discrepancy {
  id?: number;
  discrepancy_type: 'MISSED_SCAN' | 'QUANTITY_MISMATCH' | 'UNKNOWN_BARCODE' | 'PRODUCT_MISMATCH' | 'INSUFFICIENT_DATA';
  description: string;
  product_id?: number;
  product_name?: string;
  barcode?: string;
  expected_quantity?: number;
  observed_quantity?: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: string;
  resolution_status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolution_reason?: string;
  resolved_by?: string;
}

export interface VerificationResult {
  session_id: string;
  verification_status: 'LOW_RISK' | 'REVIEW_REQUIRED' | 'VERIFICATION_INCOMPLETE';
  risk_score: number;
  is_clean: boolean;
  summary: string;
  recommended_action: string;
  discrepancies: Discrepancy[];
  sensor_evidence: Array<{
    source: string;
    type: string;
    barcode?: string;
    product_name?: string;
    observed_quantity?: number;
    expected_quantity?: number;
    metadata?: Record<string, any>;
  }>;
  confidence_level: number;
  verification_timestamp: string;
}

export interface PurchasedProductItem {
  product_id: number;
  name: string;
  barcode: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  category: string;
}

export interface Receipt {
  transaction_id: string;
  date_time: string;
  customer_name: string;
  store_name: string;
  store_address: string;
  purchased_products: PurchasedProductItem[];
  item_count: number;
  subtotal: number;
  tax: number;
  final_total: number;
  payment_method: string;
  payment_status: string;
  verification_status: string;
  risk_score: number;
  security_barcode: string;
  exit_pass_code: string;
}

export interface AdminStats {
  total_sessions: number;
  total_transactions: number;
  flagged_orders_pending: number;
  resolved_discrepancies: number;
  total_products: number;
  total_revenue: number;
  prevented_loss: number;
  loss_prevention_rate: string;
}

export interface TransactionRecord {
  id: string;
  session_id: string;
  customer_name: string;
  subtotal: number;
  tax: number;
  total: number;
  item_count: number;
  items: PurchasedProductItem[];
  payment_status: string;
  payment_method: string;
  verification_status: string;
  risk_score: number;
  created_at: string;
}
