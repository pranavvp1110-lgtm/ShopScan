import {
  Product,
  CartItem,
  CartSummary,
  VerificationResult,
  Receipt,
  PurchasedProductItem,
  AdminStats,
  TransactionRecord,
  Discrepancy
} from './types';

export const MOCK_PRODUCTS: Product[] = [
  // --- Groceries ---
  {
    id: 1,
    barcode: "8901030383120",
    name: "Organic Basmati Royal Rice (1kg)",
    category: "Groceries",
    price: 6.49,
    inventory_quantity: 85,
    weight_grams: 1000.0,
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "Extra long grain aged fragrant basmati rice, naturally nurtured."
  },
  {
    id: 2,
    barcode: "8901030383137",
    name: "Artisan Sourdough Loaf",
    category: "Groceries",
    price: 4.25,
    inventory_quantity: 42,
    weight_grams: 450.0,
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Crispy golden crust with soft, airy open crumb fermented for 24 hours."
  },
  {
    id: 3,
    barcode: "8901030383144",
    name: "Extra Virgin Olive Oil (500ml)",
    category: "Groceries",
    price: 11.99,
    inventory_quantity: 30,
    weight_grams: 650.0,
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "First cold pressed Mediterranean olive oil with peppery finish."
  },
  {
    id: 4,
    barcode: "8901030383151",
    name: "Barilla Italian Penne Rigate Pasta",
    category: "Groceries",
    price: 2.89,
    inventory_quantity: 110,
    weight_grams: 500.0,
    image_url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80",
    description: "100% durum wheat semolina pasta with ridges that hold sauce perfectly."
  },
  {
    id: 5,
    barcode: "8901030383168",
    name: "Organic Hass Avocados (Pack of 3)",
    category: "Groceries",
    price: 4.99,
    inventory_quantity: 55,
    weight_grams: 550.0,
    image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    description: "Creamy, ripe, nutrient-rich ready-to-eat Hass avocados."
  },

  // --- Beverages ---
  {
    id: 6,
    barcode: "8901030383212",
    name: "Farm Fresh Whole Milk (1L)",
    category: "Beverages",
    price: 3.19,
    inventory_quantity: 60,
    weight_grams: 1030.0,
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
    description: "Pasteurized grade A whole milk with natural vitamin D."
  },
  {
    id: 7,
    barcode: "8901030383229",
    name: "Cold Brew Espresso Concentrate (750ml)",
    category: "Beverages",
    price: 7.49,
    inventory_quantity: 38,
    weight_grams: 820.0,
    image_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    description: "Smooth dark roast steeped for 18 hours with hints of cocoa."
  },
  {
    id: 8,
    barcode: "8901030383236",
    name: "Sparkling Mineral Water Lemon (1.25L)",
    category: "Beverages",
    price: 1.99,
    inventory_quantity: 90,
    weight_grams: 1300.0,
    image_url: "https://images.unsplash.com/photo-1559839914-ba2a0f8bfd47?auto=format&fit=crop&w=600&q=80",
    description: "Naturally carbonated mineral water infused with Sicilian lemon zest."
  },
  {
    id: 9,
    barcode: "8901030383243",
    name: "Organic 100% Valencia Orange Juice",
    category: "Beverages",
    price: 4.79,
    inventory_quantity: 45,
    weight_grams: 1050.0,
    image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
    description: "Pure pressed fresh orange juice with gentle pulp and no added sugar."
  },
  {
    id: 10,
    barcode: "8901030383250",
    name: "Pure Japanese Matcha Green Tea (100g)",
    category: "Beverages",
    price: 14.50,
    inventory_quantity: 25,
    weight_grams: 120.0,
    image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
    description: "Ceremonial grade stone ground Uji matcha powder."
  },

  // --- Snacks & Treats ---
  {
    id: 11,
    barcode: "8901030383311",
    name: "Dark Chocolate Sea Salt Bar (85%)",
    category: "Snacks",
    price: 3.75,
    inventory_quantity: 120,
    weight_grams: 100.0,
    image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    description: "Single-origin fair trade cocoa finished with hand-harvested sea salt."
  },
  {
    id: 12,
    barcode: "8901030383328",
    name: "Roasted Almonds with Rosemary (200g)",
    category: "Snacks",
    price: 5.99,
    inventory_quantity: 64,
    weight_grams: 210.0,
    image_url: "https://images.unsplash.com/photo-1508061252966-f72fbef80e34?auto=format&fit=crop&w=600&q=80",
    description: "Slow-roasted California almonds with fresh rosemary and cracked pepper."
  },
  {
    id: 13,
    barcode: "8901030383335",
    name: "Artisan Butter Shortbread Biscuits",
    category: "Snacks",
    price: 3.49,
    inventory_quantity: 78,
    weight_grams: 220.0,
    image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    description: "Traditional Scottish-recipe melted butter biscuits with subtle crunch."
  },
  {
    id: 14,
    barcode: "8901030383342",
    name: "Himalayan Pink Salt Kettle Chips",
    category: "Snacks",
    price: 2.49,
    inventory_quantity: 95,
    weight_grams: 150.0,
    image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
    description: "Batch fried in small kettles for deep potato crunch and natural salt flavor."
  },

  // --- Personal Care ---
  {
    id: 15,
    barcode: "8901030383410",
    name: "Botanical Lavender Body Wash (500ml)",
    category: "Personal Care",
    price: 8.99,
    inventory_quantity: 40,
    weight_grams: 540.0,
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    description: "Sulfate-free hydrating body wash with French lavender essential oil."
  },
  {
    id: 16,
    barcode: "8901030383427",
    name: "Shea Butter Handcrafted Soap Bar",
    category: "Personal Care",
    price: 4.19,
    inventory_quantity: 88,
    weight_grams: 125.0,
    image_url: "https://images.unsplash.com/photo-1607006314180-3077759526b7?auto=format&fit=crop&w=600&q=80",
    description: "Ultra-gentle moisturizing bar with cold-pressed African shea butter."
  },
  {
    id: 17,
    barcode: "8901030383434",
    name: "Natural Charcoal Whitening Toothpaste",
    category: "Personal Care",
    price: 5.49,
    inventory_quantity: 52,
    weight_grams: 140.0,
    image_url: "https://images.unsplash.com/photo-1559591937-e1032c5ef2ff?auto=format&fit=crop&w=600&q=80",
    description: "Fluoride-free whitening toothpaste with activated coconut charcoal and mint."
  },
  {
    id: 18,
    barcode: "8901030383441",
    name: "Mineral Daily Sunscreen SPF 50",
    category: "Personal Care",
    price: 13.99,
    inventory_quantity: 35,
    weight_grams: 110.0,
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    description: "Reef-safe non-nano zinc oxide facial sunscreen with zero white cast."
  },

  // --- Household Essentials ---
  {
    id: 19,
    barcode: "8901030383519",
    name: "Plant-Based Dishwashing Liquid (750ml)",
    category: "Household",
    price: 4.89,
    inventory_quantity: 70,
    weight_grams: 810.0,
    image_url: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
    description: "Tough on grease, gentle on skin, made with 100% biodegradable ingredients."
  },
  {
    id: 20,
    barcode: "8901030383526",
    name: "Multi-Surface Citrus Cleaning Spray",
    category: "Household",
    price: 5.29,
    inventory_quantity: 48,
    weight_grams: 600.0,
    image_url: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
    description: "Disinfects 99.9% of germs with natural grapefruit & lemon essential extracts."
  },
  {
    id: 21,
    barcode: "8901030383533",
    name: "Bamboo Eco-Friendly Paper Towels (3 Rolls)",
    category: "Household",
    price: 6.99,
    inventory_quantity: 62,
    weight_grams: 480.0,
    image_url: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
    description: "Super absorbent, bleach-free sustainable bamboo paper rolls."
  },
  {
    id: 22,
    barcode: "8901030383540",
    name: "Lavender Laundry Detergent Pods (30 Count)",
    category: "Household",
    price: 12.49,
    inventory_quantity: 44,
    weight_grams: 650.0,
    image_url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
    description: "Concentrated 3-in-1 stain remover, color brightener, and fabric softener."
  },
  {
    id: 23,
    barcode: "8901030383557",
    name: "Scented Soy Wax Amber Candle",
    category: "Household",
    price: 9.99,
    inventory_quantity: 35,
    weight_grams: 380.0,
    image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    description: "Hand-poured 100% natural soy wax with cedarwood and warm amber notes."
  },
  {
    id: 24,
    barcode: "8901030383564",
    name: "Compostable Heavy-Duty Trash Bags (25 Pack)",
    category: "Household",
    price: 7.89,
    inventory_quantity: 50,
    weight_grams: 400.0,
    image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
    description: "Tear-resistant plant-starch trash bags that fully compost within 180 days."
  }
];

// In-Memory Simulated State for Standalone Client Mode
let inMemoryCart: CartItem[] = [
  {
    id: 1,
    product_id: 1,
    product_name: "Organic Basmati Royal Rice (1kg)",
    barcode: "8901030383120",
    quantity: 1,
    unit_price: 6.49,
    line_total: 6.49,
    weight_grams: 1000.0,
    category: "Groceries",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    product_id: 6,
    product_name: "Farm Fresh Whole Milk (1L)",
    barcode: "8901030383212",
    quantity: 1,
    unit_price: 3.19,
    line_total: 3.19,
    weight_grams: 1030.0,
    category: "Beverages",
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80"
  }
];

let inMemoryDiscrepancies: Discrepancy[] = [];
let inMemoryRiskScore = 4;
let inMemoryRiskStatus: 'LOW_RISK' | 'REVIEW_REQUIRED' | 'VERIFICATION_INCOMPLETE' = 'LOW_RISK';

export function computeMockCartSummary(sessionId: string): CartSummary {
  const item_count = inMemoryCart.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = inMemoryCart.reduce((acc, it) => acc + it.line_total, 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const calculated_weight_grams = inMemoryCart.reduce((acc, it) => acc + (it.weight_grams * it.quantity), 0);

  return {
    session_id: sessionId,
    items: inMemoryCart,
    item_count,
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total,
    calculated_weight_grams
  };
}

export function mockAddToCart(sessionId: string, productId?: number, barcode?: string, quantity: number = 1): CartSummary {
  const prod = MOCK_PRODUCTS.find(p => p.id === productId || p.barcode === barcode);
  if (!prod) throw new Error(`Product barcode '${barcode || productId}' not found in catalogue`);

  const existing = inMemoryCart.find(it => it.product_id === prod.id);
  if (existing) {
    existing.quantity += quantity;
    existing.line_total = Number((existing.quantity * existing.unit_price).toFixed(2));
  } else {
    inMemoryCart.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      product_id: prod.id,
      product_name: prod.name,
      barcode: prod.barcode,
      quantity,
      unit_price: prod.price,
      line_total: Number((prod.price * quantity).toFixed(2)),
      weight_grams: prod.weight_grams,
      category: prod.category,
      image_url: prod.image_url
    });
  }

  // Recompute verification
  inMemoryRiskStatus = 'LOW_RISK';
  inMemoryDiscrepancies = [];
  inMemoryRiskScore = 5;

  return computeMockCartSummary(sessionId);
}

export function mockUpdateQty(sessionId: string, itemId: number, quantity: number): CartSummary {
  if (quantity <= 0) {
    inMemoryCart = inMemoryCart.filter(it => it.id !== itemId);
  } else {
    const it = inMemoryCart.find(i => i.id === itemId);
    if (it) {
      it.quantity = quantity;
      it.line_total = Number((it.unit_price * quantity).toFixed(2));
    }
  }
  return computeMockCartSummary(sessionId);
}

export function mockRemoveItem(sessionId: string, itemId: number): CartSummary {
  inMemoryCart = inMemoryCart.filter(it => it.id !== itemId);
  return computeMockCartSummary(sessionId);
}

export function mockClearCart(sessionId: string): CartSummary {
  inMemoryCart = [];
  inMemoryDiscrepancies = [];
  inMemoryRiskStatus = 'LOW_RISK';
  return computeMockCartSummary(sessionId);
}

export function mockVerify(sessionId: string): VerificationResult {
  const is_clean = inMemoryRiskStatus === 'LOW_RISK';
  return {
    session_id: sessionId,
    verification_status: inMemoryRiskStatus,
    risk_score: inMemoryRiskScore,
    is_clean,
    summary: is_clean
      ? "Basket verified against smart sensor telemetry. Autonomous clearance approved."
      : "Discrepancy detected between digital cart and physical camera/scale telemetry. Review required.",
    recommended_action: is_clean ? "APPROVE_CHECKOUT" : "HOLD_FOR_REVIEW",
    discrepancies: inMemoryDiscrepancies,
    sensor_evidence: inMemoryCart.map(it => ({
      source: "Overhead Vision Cam-01",
      type: "BASKET_DETECTION",
      barcode: it.barcode,
      product_name: it.product_name,
      observed_quantity: it.quantity,
      expected_quantity: it.quantity
    })),
    confidence_level: is_clean ? 0.98 : 0.45,
    verification_timestamp: new Date().toISOString()
  };
}

export function mockExecuteCheckout(sessionId: string, paymentMethod: string, _allowOverride: boolean) {
  const cartSummary = computeMockCartSummary(sessionId);
  const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  
  const purchased_products: PurchasedProductItem[] = cartSummary.items.map(it => ({
    product_id: it.product_id,
    name: it.product_name,
    barcode: it.barcode,
    unit_price: it.unit_price,
    quantity: it.quantity,
    line_total: it.line_total,
    category: it.category
  }));

  const receipt: Receipt = {
    transaction_id: txnId,
    date_time: new Date().toISOString(),
    customer_name: "Pranav (Demo Customer)",
    store_name: "ShopScan Metro Flagship",
    store_address: "100 Innovation Way, Suite 400",
    purchased_products,
    item_count: cartSummary.item_count,
    subtotal: cartSummary.subtotal,
    tax: cartSummary.tax,
    final_total: cartSummary.total,
    payment_method: paymentMethod,
    payment_status: "SUCCESSFUL",
    verification_status: inMemoryRiskStatus,
    risk_score: inMemoryRiskScore,
    security_barcode: `SEC-${Date.now().toString(36).toUpperCase()}`,
    exit_pass_code: `GATE-PASS-${Math.floor(Math.random() * 89999 + 10000)}`
  };

  return {
    success: true,
    message: "Checkout completed successfully! Turnstile gate exit pass generated.",
    transaction_id: txnId,
    receipt,
    discrepancies: inMemoryDiscrepancies
  };
}

export function mockLoadScenario(scenarioId: number, sessionId: string) {
  const rice = MOCK_PRODUCTS[0];
  const milk = MOCK_PRODUCTS[5];
  const soap = MOCK_PRODUCTS[15];

  if (scenarioId === 1) {
    inMemoryCart = [
      {
        id: 101,
        product_id: rice.id,
        product_name: rice.name,
        barcode: rice.barcode,
        quantity: 1,
        unit_price: rice.price,
        line_total: rice.price,
        weight_grams: rice.weight_grams,
        category: rice.category,
        image_url: rice.image_url
      },
      {
        id: 102,
        product_id: milk.id,
        product_name: milk.name,
        barcode: milk.barcode,
        quantity: 1,
        unit_price: milk.price,
        line_total: milk.price,
        weight_grams: milk.weight_grams,
        category: milk.category,
        image_url: milk.image_url
      }
    ];
    inMemoryDiscrepancies = [];
    inMemoryRiskScore = 4;
    inMemoryRiskStatus = 'LOW_RISK';
    return {
      status: "success",
      scenario_name: "Scenario 1: Clean Cart (All items scanned correctly)",
      scenario_description: "Physical items match scanned records. Autonomous clearance granted.",
      cart: computeMockCartSummary(sessionId),
      verification: mockVerify(sessionId)
    };
  } else if (scenarioId === 2) {
    inMemoryCart = [
      {
        id: 201,
        product_id: rice.id,
        product_name: rice.name,
        barcode: rice.barcode,
        quantity: 1,
        unit_price: rice.price,
        line_total: rice.price,
        weight_grams: rice.weight_grams,
        category: rice.category,
        image_url: rice.image_url
      }
    ];
    inMemoryDiscrepancies = [
      {
        id: 501,
        product_id: soap.id,
        product_name: soap.name,
        barcode: soap.barcode,
        discrepancy_type: "MISSED_SCAN",
        description: `Overhead vision observed 1 unit of '${soap.name}', but it was never added to the digital basket.`,
        risk_level: "HIGH",
        expected_quantity: 0,
        observed_quantity: 1,
        recommended_action: "SCAN_MISSING_ITEM",
        resolution_status: "PENDING"
      }
    ];
    inMemoryRiskScore = 85;
    inMemoryRiskStatus = 'REVIEW_REQUIRED';
    return {
      status: "success",
      scenario_name: "Scenario 2: Missed Scan (Shrinkage Detected)",
      scenario_description: "Overhead basket camera spotted soap bar that wasn't scanned. Review required.",
      cart: computeMockCartSummary(sessionId),
      verification: mockVerify(sessionId)
    };
  } else if (scenarioId === 3) {
    inMemoryCart = [
      {
        id: 301,
        product_id: milk.id,
        product_name: milk.name,
        barcode: milk.barcode,
        quantity: 1,
        unit_price: milk.price,
        line_total: milk.price,
        weight_grams: milk.weight_grams,
        category: milk.category,
        image_url: milk.image_url
      }
    ];
    inMemoryDiscrepancies = [
      {
        id: 601,
        product_id: milk.id,
        product_name: milk.name,
        barcode: milk.barcode,
        discrepancy_type: "QUANTITY_MISMATCH",
        description: `Cart has 1 unit of '${milk.name}', but smart weight scale and overhead camera detected 2 units.`,
        risk_level: "MEDIUM",
        expected_quantity: 1,
        observed_quantity: 2,
        recommended_action: "ADJUST_QUANTITY",
        resolution_status: "PENDING"
      }
    ];
    inMemoryRiskScore = 65;
    inMemoryRiskStatus = 'REVIEW_REQUIRED';
    return {
      status: "success",
      scenario_name: "Scenario 3: Quantity Discrepancy",
      scenario_description: "1 item scanned, but 2 units physically present. Review required.",
      cart: computeMockCartSummary(sessionId),
      verification: mockVerify(sessionId)
    };
  }

  return {
    status: "success",
    scenario_name: "Default State",
    scenario_description: "Standard cart loaded.",
    cart: computeMockCartSummary(sessionId),
    verification: mockVerify(sessionId)
  };
}

export function mockAdminStats(): AdminStats {
  return {
    total_sessions: 142,
    total_transactions: 1358,
    flagged_orders_pending: 3,
    resolved_discrepancies: 59,
    total_products: 24,
    total_revenue: 14850.75,
    prevented_loss: 2840.50,
    loss_prevention_rate: "96.8%"
  };
}

export function mockTransactions(): TransactionRecord[] {
  return [
    {
      id: "TXN-88A91F-301",
      session_id: "SES-DEMO-01",
      customer_name: "Sarah Jenkins",
      subtotal: 24.50,
      tax: 1.96,
      total: 26.46,
      item_count: 3,
      payment_method: "Apple Pay",
      payment_status: "SUCCESSFUL",
      verification_status: "LOW_RISK",
      risk_score: 4,
      items: [
        { product_id: 1, name: "Organic Basmati Royal Rice (1kg)", barcode: "8901030383120", quantity: 2, unit_price: 6.49, line_total: 12.98, category: "Groceries" },
        { product_id: 3, name: "Extra Virgin Olive Oil (500ml)", barcode: "8901030383144", quantity: 1, unit_price: 11.99, line_total: 11.99, category: "Groceries" }
      ],
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    },
    {
      id: "TXN-72C40E-205",
      session_id: "SES-DEMO-02",
      customer_name: "David Chen",
      subtotal: 18.20,
      tax: 1.46,
      total: 19.66,
      item_count: 3,
      payment_method: "Google Pay",
      payment_status: "SUCCESSFUL",
      verification_status: "REVIEW_REQUIRED",
      risk_score: 78,
      items: [
        { product_id: 6, name: "Farm Fresh Whole Milk (1L)", barcode: "8901030383212", quantity: 2, unit_price: 3.19, line_total: 6.38, category: "Beverages" },
        { product_id: 7, name: "Cold Brew Espresso Concentrate (750ml)", barcode: "8901030383229", quantity: 1, unit_price: 7.49, line_total: 7.49, category: "Beverages" }
      ],
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    }
  ];
}

export function mockDiscrepancies(): Discrepancy[] {
  return [
    {
      id: 1,
      product_id: 16,
      product_name: "Shea Butter Handcrafted Soap Bar",
      barcode: "8901030383427",
      discrepancy_type: "MISSED_SCAN",
      description: "Overhead basket camera Cam-02 detected 1x Shea Butter Soap Bar not in cart.",
      risk_level: "HIGH",
      expected_quantity: 0,
      observed_quantity: 1,
      recommended_action: "SCAN_MISSING_ITEM",
      resolution_status: "RESOLVED",
      resolution_reason: "Customer verified item and completed add-to-cart.",
      resolved_by: "Store Associate - Jordan"
    },
    ...inMemoryDiscrepancies
  ];
}

export function mockAnalytics() {
  return {
    hourly_traffic: [
      { hour: "09:00", scans: 45, clean_checkouts: 44, flags: 1 },
      { hour: "10:00", scans: 88, clean_checkouts: 85, flags: 3 },
      { hour: "11:00", scans: 140, clean_checkouts: 134, flags: 6 },
      { hour: "12:00", scans: 220, clean_checkouts: 209, flags: 11 },
      { hour: "13:00", scans: 195, clean_checkouts: 188, flags: 7 },
      { hour: "14:00", scans: 160, clean_checkouts: 153, flags: 7 },
      { hour: "15:00", scans: 180, clean_checkouts: 172, flags: 8 },
      { hour: "16:00", scans: 230, clean_checkouts: 219, flags: 11 },
      { hour: "17:00", scans: 310, clean_checkouts: 298, flags: 12 },
      { hour: "18:00", scans: 290, clean_checkouts: 279, flags: 11 }
    ],
    discrepancy_types: [
      { name: "Missed Scan", count: 34, color: "#EF4444" },
      { name: "Quantity Mismatch", count: 18, color: "#F59E0B" },
      { name: "Weight Anomaly", count: 7, color: "#8B5CF6" },
      { name: "Unknown Barcode", count: 3, color: "#3B82F6" }
    ],
    resolution_outcomes: [
      { name: "Scanned & Corrected", value: 42 },
      { name: "Staff Cleared (No Shrinkage)", value: 16 },
      { name: "Item Returned to Shelf", value: 4 }
    ]
  };
}
