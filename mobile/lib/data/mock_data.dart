import 'dart:math';
import 'models/shop_models.dart';

class MockData {
  static final List<Product> products = [
    // --- Groceries ---
    const Product(
      id: 1,
      barcode: "8901030383120",
      name: "Organic Basmati Royal Rice (1kg)",
      category: "Groceries",
      price: 6.49,
      inventoryQuantity: 85,
      weightGrams: 1000.0,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      description: "Extra long grain aged fragrant basmati rice, naturally nurtured.",
    ),
    const Product(
      id: 2,
      barcode: "8901030383137",
      name: "Artisan Sourdough Loaf",
      category: "Groceries",
      price: 4.25,
      inventoryQuantity: 42,
      weightGrams: 450.0,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      description: "Crispy golden crust with soft, airy open crumb fermented for 24 hours.",
    ),
    const Product(
      id: 3,
      barcode: "8901030383144",
      name: "Extra Virgin Olive Oil (500ml)",
      category: "Groceries",
      price: 11.99,
      inventoryQuantity: 30,
      weightGrams: 650.0,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
      description: "First cold pressed Mediterranean olive oil with peppery finish.",
    ),
    const Product(
      id: 4,
      barcode: "8901030383151",
      name: "Barilla Italian Penne Rigate Pasta",
      category: "Groceries",
      price: 2.89,
      inventoryQuantity: 110,
      weightGrams: 500.0,
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80",
      description: "100% durum wheat semolina pasta with ridges that hold sauce perfectly.",
    ),
    const Product(
      id: 5,
      barcode: "8901030383168",
      name: "Organic Hass Avocados (Pack of 3)",
      category: "Groceries",
      price: 4.99,
      inventoryQuantity: 55,
      weightGrams: 550.0,
      imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
      description: "Creamy, ripe, nutrient-rich ready-to-eat Hass avocados.",
    ),

    // --- Beverages ---
    const Product(
      id: 6,
      barcode: "8901030383212",
      name: "Farm Fresh Whole Milk (1L)",
      category: "Beverages",
      price: 3.19,
      inventoryQuantity: 60,
      weightGrams: 1030.0,
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
      description: "Pasteurized grade A whole milk with natural vitamin D.",
    ),
    const Product(
      id: 7,
      barcode: "8901030383229",
      name: "Cold Brew Espresso Concentrate (750ml)",
      category: "Beverages",
      price: 7.49,
      inventoryQuantity: 38,
      weightGrams: 820.0,
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      description: "Smooth dark roast steeped for 18 hours with hints of cocoa.",
    ),
    const Product(
      id: 8,
      barcode: "8901030383236",
      name: "Sparkling Mineral Water Lemon (1.25L)",
      category: "Beverages",
      price: 1.99,
      inventoryQuantity: 90,
      weightGrams: 1300.0,
      imageUrl: "https://images.unsplash.com/photo-1559839914-ba2a0f8bfd47?auto=format&fit=crop&w=600&q=80",
      description: "Naturally carbonated mineral water infused with Sicilian lemon zest.",
    ),
    const Product(
      id: 9,
      barcode: "8901030383243",
      name: "Organic 100% Valencia Orange Juice",
      category: "Beverages",
      price: 4.79,
      inventoryQuantity: 45,
      weightGrams: 1050.0,
      imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
      description: "Pure pressed fresh orange juice with gentle pulp and no added sugar.",
    ),
    const Product(
      id: 10,
      barcode: "8901030383250",
      name: "Pure Japanese Matcha Green Tea (100g)",
      category: "Beverages",
      price: 14.50,
      inventoryQuantity: 25,
      weightGrams: 120.0,
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
      description: "Ceremonial grade stone ground Uji matcha powder.",
    ),

    // --- Snacks & Treats ---
    const Product(
      id: 11,
      barcode: "8901030383311",
      name: "Dark Chocolate Sea Salt Bar (85%)",
      category: "Snacks",
      price: 3.75,
      inventoryQuantity: 120,
      weightGrams: 100.0,
      imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
      description: "Single-origin fair trade cocoa finished with hand-harvested sea salt.",
    ),
    const Product(
      id: 12,
      barcode: "8901030383328",
      name: "Roasted Almonds with Rosemary (200g)",
      category: "Snacks",
      price: 5.99,
      inventoryQuantity: 64,
      weightGrams: 210.0,
      imageUrl: "https://images.unsplash.com/photo-1508061252966-f72fbef80e34?auto=format&fit=crop&w=600&q=80",
      description: "Slow-roasted California almonds with fresh rosemary and cracked pepper.",
    ),
    const Product(
      id: 13,
      barcode: "8901030383335",
      name: "Artisan Butter Shortbread Biscuits",
      category: "Snacks",
      price: 3.49,
      inventoryQuantity: 78,
      weightGrams: 220.0,
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
      description: "Traditional Scottish-recipe melted butter biscuits with subtle crunch.",
    ),
    const Product(
      id: 14,
      barcode: "8901030383342",
      name: "Himalayan Pink Salt Kettle Chips",
      category: "Snacks",
      price: 2.49,
      inventoryQuantity: 95,
      weightGrams: 150.0,
      imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
      description: "Batch fried in small kettles for deep potato crunch and natural salt flavor.",
    ),

    // --- Personal Care ---
    const Product(
      id: 15,
      barcode: "8901030383410",
      name: "Botanical Lavender Body Wash (500ml)",
      category: "Personal Care",
      price: 8.99,
      inventoryQuantity: 40,
      weightGrams: 540.0,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
      description: "Sulfate-free hydrating body wash with French lavender essential oil.",
    ),
    const Product(
      id: 16,
      barcode: "8901030383427",
      name: "Shea Butter Handcrafted Soap Bar",
      category: "Personal Care",
      price: 4.19,
      inventoryQuantity: 88,
      weightGrams: 125.0,
      imageUrl: "https://images.unsplash.com/photo-1607006314180-3077759526b7?auto=format&fit=crop&w=600&q=80",
      description: "Ultra-gentle moisturizing bar with cold-pressed African shea butter.",
    ),
    const Product(
      id: 17,
      barcode: "8901030383434",
      name: "Natural Charcoal Whitening Toothpaste",
      category: "Personal Care",
      price: 5.49,
      inventoryQuantity: 52,
      weightGrams: 140.0,
      imageUrl: "https://images.unsplash.com/photo-1559591937-e1032c5ef2ff?auto=format&fit=crop&w=600&q=80",
      description: "Fluoride-free whitening toothpaste with activated coconut charcoal and mint.",
    ),
    const Product(
      id: 18,
      barcode: "8901030383441",
      name: "Mineral Daily Sunscreen SPF 50",
      category: "Personal Care",
      price: 13.99,
      inventoryQuantity: 35,
      weightGrams: 110.0,
      imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
      description: "Reef-safe non-nano zinc oxide facial sunscreen with zero white cast.",
    ),

    // --- Household Essentials ---
    const Product(
      id: 19,
      barcode: "8901030383519",
      name: "Plant-Based Dishwashing Liquid (750ml)",
      category: "Household",
      price: 4.89,
      inventoryQuantity: 70,
      weightGrams: 810.0,
      imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
      description: "Tough on grease, gentle on skin, made with 100% biodegradable ingredients.",
    ),
    const Product(
      id: 20,
      barcode: "8901030383526",
      name: "Multi-Surface Citrus Cleaning Spray",
      category: "Household",
      price: 5.29,
      inventoryQuantity: 48,
      weightGrams: 600.0,
      imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
      description: "Disinfects 99.9% of germs with natural grapefruit & lemon essential extracts.",
    ),
    const Product(
      id: 21,
      barcode: "8901030383533",
      name: "Bamboo Eco-Friendly Paper Towels (3 Rolls)",
      category: "Household",
      price: 6.99,
      inventoryQuantity: 62,
      weightGrams: 480.0,
      imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
      description: "Super absorbent, bleach-free sustainable bamboo paper rolls.",
    ),
    const Product(
      id: 22,
      barcode: "8901030383540",
      name: "Lavender Laundry Detergent Pods (30 Count)",
      category: "Household",
      price: 12.49,
      inventoryQuantity: 44,
      weightGrams: 650.0,
      imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
      description: "Concentrated 3-in-1 stain remover, color brightener, and fabric softener.",
    ),
    const Product(
      id: 23,
      barcode: "8901030383557",
      name: "Scented Soy Wax Amber Candle",
      category: "Household",
      price: 9.99,
      inventoryQuantity: 35,
      weightGrams: 380.0,
      imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
      description: "Hand-poured 100% natural soy wax with cedarwood and warm amber notes.",
    ),
    const Product(
      id: 24,
      barcode: "8901030383564",
      name: "Compostable Heavy-Duty Trash Bags (25 Pack)",
      category: "Household",
      price: 7.89,
      inventoryQuantity: 50,
      weightGrams: 400.0,
      imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
      description: "Tear-resistant plant-starch trash bags that fully compost within 180 days.",
    ),
  ];

  // In-Memory Simulated State
  static List<CartItem> simulatedCart = [
    CartItem(
      id: 1,
      productId: 1,
      productName: "Organic Basmati Royal Rice (1kg)",
      barcode: "8901030383120",
      category: "Groceries",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      unitPrice: 6.49,
      quantity: 1,
      lineTotal: 6.49,
      weightGrams: 1000.0,
    ),
    CartItem(
      id: 2,
      productId: 6,
      productName: "Farm Fresh Whole Milk (1L)",
      barcode: "8901030383212",
      category: "Beverages",
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
      unitPrice: 3.19,
      quantity: 1,
      lineTotal: 3.19,
      weightGrams: 1030.0,
    ),
  ];

  static List<Discrepancy> simulatedDiscrepancies = [];
  static String simulatedRiskStatus = 'LOW_RISK';
  static int simulatedRiskScore = 4;

  static CartSummary getCartSummary(String sessionId) {
    final count = simulatedCart.fold<int>(0, (sum, it) => sum + it.quantity);
    final sub = simulatedCart.fold<double>(0.0, (sum, it) => sum + it.lineTotal);
    final tax = double.parse((sub * 0.08).toStringAsFixed(2));
    final tot = double.parse((sub + tax).toStringAsFixed(2));
    final weight = simulatedCart.fold<double>(0.0, (sum, it) => sum + (it.weightGrams * it.quantity));

    return CartSummary(
      sessionId: sessionId,
      items: List.from(simulatedCart),
      itemCount: count,
      subtotal: double.parse(sub.toStringAsFixed(2)),
      tax: tax,
      total: tot,
      calculatedWeightGrams: weight,
    );
  }

  static CartSummary addToCart(String sessionId, Product product, {int quantity = 1}) {
    final existingIndex = simulatedCart.indexWhere((it) => it.productId == product.id);
    if (existingIndex >= 0) {
      simulatedCart[existingIndex].quantity += quantity;
      simulatedCart[existingIndex].lineTotal = double.parse(
        (simulatedCart[existingIndex].quantity * simulatedCart[existingIndex].unitPrice).toStringAsFixed(2),
      );
    } else {
      simulatedCart.add(
        CartItem(
          id: DateTime.now().millisecondsSinceEpoch,
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          category: product.category,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: quantity,
          lineTotal: double.parse((product.price * quantity).toStringAsFixed(2)),
          weightGrams: product.weightGrams,
        ),
      );
    }

    simulatedRiskStatus = 'LOW_RISK';
    simulatedDiscrepancies = [];
    simulatedRiskScore = 4;
    return getCartSummary(sessionId);
  }

  static CartSummary updateQuantity(String sessionId, int itemId, int newQuantity) {
    if (newQuantity <= 0) {
      simulatedCart.removeWhere((it) => it.id == itemId);
    } else {
      final index = simulatedCart.indexWhere((it) => it.id == itemId);
      if (index >= 0) {
        simulatedCart[index].quantity = newQuantity;
        simulatedCart[index].lineTotal = double.parse(
          (newQuantity * simulatedCart[index].unitPrice).toStringAsFixed(2),
        );
      }
    }
    return getCartSummary(sessionId);
  }

  static CartSummary removeItem(String sessionId, int itemId) {
    simulatedCart.removeWhere((it) => it.id == itemId);
    return getCartSummary(sessionId);
  }

  static CartSummary clearCart(String sessionId) {
    simulatedCart.clear();
    simulatedDiscrepancies.clear();
    simulatedRiskStatus = 'LOW_RISK';
    simulatedRiskScore = 0;
    return getCartSummary(sessionId);
  }

  static VerificationResult verifyCart(String sessionId) {
    final isClean = simulatedRiskStatus == 'LOW_RISK';
    return VerificationResult(
      sessionId: sessionId,
      verificationStatus: simulatedRiskStatus,
      riskScore: simulatedRiskScore,
      isClean: isClean,
      summary: isClean
          ? "Basket matches smart camera & scale telemetry. Clearance approved."
          : "Discrepancy detected between digital basket and sensor telemetry.",
      recommendedAction: isClean ? "APPROVE_CHECKOUT" : "HOLD_FOR_REVIEW",
      discrepancies: List.from(simulatedDiscrepancies),
      confidenceLevel: isClean ? 0.98 : 0.42,
      verificationTimestamp: DateTime.now().toIso8601String(),
    );
  }

  static Receipt executeCheckout(String sessionId, String paymentMethod) {
    final summary = getCartSummary(sessionId);
    final rand = Random();
    final txnId = "TXN-${DateTime.now().millisecondsSinceEpoch.toRadixString(36).toUpperCase()}-${rand.nextInt(900) + 100}";

    return Receipt(
      transactionId: txnId,
      dateTime: DateTime.now().toIso8601String(),
      customerName: "Pranav (Demo Customer)",
      storeName: "ShopScan Metro Flagship",
      storeAddress: "100 Innovation Way, Suite 400",
      purchasedProducts: summary.items.map((it) => {
        'product_id': it.productId,
        'name': it.productName,
        'barcode': it.barcode,
        'unit_price': it.unitPrice,
        'quantity': it.quantity,
        'line_total': it.lineTotal,
        'category': it.category,
      }).toList(),
      itemCount: summary.itemCount,
      subtotal: summary.subtotal,
      tax: summary.tax,
      finalTotal: summary.total,
      paymentMethod: paymentMethod,
      paymentStatus: "SUCCESSFUL",
      verificationStatus: simulatedRiskStatus,
      riskScore: simulatedRiskScore,
      securityBarcode: "SEC-${DateTime.now().millisecondsSinceEpoch.toRadixString(36).toUpperCase()}",
      exitPassCode: "GATE-PASS-${rand.nextInt(89999) + 10000}",
    );
  }

  static void loadScenario(int id) {
    final rice = products[0];
    final milk = products[5];
    final soap = products[15];

    if (id == 1) {
      simulatedCart = [
        CartItem(
          id: 101,
          productId: rice.id,
          productName: rice.name,
          barcode: rice.barcode,
          category: rice.category,
          imageUrl: rice.imageUrl,
          unitPrice: rice.price,
          quantity: 1,
          lineTotal: rice.price,
          weightGrams: rice.weightGrams,
        ),
        CartItem(
          id: 102,
          productId: milk.id,
          productName: milk.name,
          barcode: milk.barcode,
          category: milk.category,
          imageUrl: milk.imageUrl,
          unitPrice: milk.price,
          quantity: 1,
          lineTotal: milk.price,
          weightGrams: milk.weightGrams,
        ),
      ];
      simulatedDiscrepancies = [];
      simulatedRiskStatus = 'LOW_RISK';
      simulatedRiskScore = 4;
    } else if (id == 2) {
      simulatedCart = [
        CartItem(
          id: 201,
          productId: rice.id,
          productName: rice.name,
          barcode: rice.barcode,
          category: rice.category,
          imageUrl: rice.imageUrl,
          unitPrice: rice.price,
          quantity: 1,
          lineTotal: rice.price,
          weightGrams: rice.weightGrams,
        ),
      ];
      simulatedDiscrepancies = [
        Discrepancy(
          id: 501,
          productId: soap.id,
          productName: soap.name,
          barcode: soap.barcode,
          discrepancyType: "MISSED_SCAN",
          description: "Overhead basket camera spotted 1 unit of '${soap.name}' not scanned into digital cart.",
          riskLevel: "HIGH",
          expectedQuantity: 0,
          observedQuantity: 1,
          recommendedAction: "SCAN_MISSING_ITEM",
          resolutionStatus: "PENDING",
        ),
      ];
      simulatedRiskStatus = 'REVIEW_REQUIRED';
      simulatedRiskScore = 85;
    } else if (id == 3) {
      simulatedCart = [
        CartItem(
          id: 301,
          productId: milk.id,
          productName: milk.name,
          barcode: milk.barcode,
          category: milk.category,
          imageUrl: milk.imageUrl,
          unitPrice: milk.price,
          quantity: 1,
          lineTotal: milk.price,
          weightGrams: milk.weightGrams,
        ),
      ];
      simulatedDiscrepancies = [
        Discrepancy(
          id: 601,
          productId: milk.id,
          productName: milk.name,
          barcode: milk.barcode,
          discrepancyType: "QUANTITY_MISMATCH",
          description: "Digital cart has 1x '${milk.name}', but load cell scale and vision telemetry detected 2 units.",
          riskLevel: "MEDIUM",
          expectedQuantity: 1,
          observedQuantity: 2,
          recommendedAction: "ADJUST_QUANTITY",
          resolutionStatus: "PENDING",
        ),
      ];
      simulatedRiskStatus = 'REVIEW_REQUIRED';
      simulatedRiskScore = 65;
    }
  }

  static AdminStats getAdminStats() {
    return const AdminStats(
      totalSessions: 142,
      totalTransactions: 1358,
      flaggedOrdersPending: 2,
      resolvedDiscrepancies: 59,
      totalProducts: 24,
      totalRevenue: 14850.75,
      preventedLoss: 2840.50,
      lossPreventionRate: "96.8%",
    );
  }
}
