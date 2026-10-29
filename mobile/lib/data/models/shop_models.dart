class Product {
  final int id;
  final String barcode;
  final String name;
  final String category;
  final double price;
  final int inventoryQuantity;
  final double weightGrams;
  final String imageUrl;
  final String description;

  const Product({
    required this.id,
    required this.barcode,
    required this.name,
    required this.category,
    required this.price,
    required this.inventoryQuantity,
    required this.weightGrams,
    required this.imageUrl,
    this.description = '',
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int? ?? 0,
      barcode: json['barcode'] as String? ?? '',
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      inventoryQuantity: json['inventory_quantity'] as int? ?? 0,
      weightGrams: (json['weight_grams'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['image_url'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'barcode': barcode,
    'name': name,
    'category': category,
    'price': price,
    'inventory_quantity': inventoryQuantity,
    'weight_grams': weightGrams,
    'image_url': imageUrl,
    'description': description,
  };
}

class CartItem {
  final int id;
  final int productId;
  final String productName;
  final String barcode;
  final String category;
  final String imageUrl;
  final double unitPrice;
  int quantity;
  double lineTotal;
  final double weightGrams;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.barcode,
    required this.category,
    required this.imageUrl,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
    required this.weightGrams,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as int? ?? 0,
      productId: json['product_id'] as int? ?? 0,
      productName: json['product_name'] as String? ?? '',
      barcode: json['barcode'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      imageUrl: json['image_url'] as String? ?? '',
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      lineTotal: (json['line_total'] as num?)?.toDouble() ?? 0.0,
      weightGrams: (json['weight_grams'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'product_id': productId,
    'product_name': productName,
    'barcode': barcode,
    'category': category,
    'image_url': imageUrl,
    'unit_price': unitPrice,
    'quantity': quantity,
    'line_total': lineTotal,
    'weight_grams': weightGrams,
  };
}

class Discrepancy {
  final int? id;
  final String discrepancyType;
  final String description;
  final int? productId;
  final String? productName;
  final String? barcode;
  final int? expectedQuantity;
  final int? observedQuantity;
  final String riskLevel;
  final String recommendedAction;
  String resolutionStatus;
  String? resolutionReason;
  String? resolvedBy;

  Discrepancy({
    this.id,
    required this.discrepancyType,
    required this.description,
    this.productId,
    this.productName,
    this.barcode,
    this.expectedQuantity,
    this.observedQuantity,
    this.riskLevel = 'MEDIUM',
    this.recommendedAction = 'REVIEW_BASKET',
    this.resolutionStatus = 'PENDING',
    this.resolutionReason,
    this.resolvedBy,
  });

  factory Discrepancy.fromJson(Map<String, dynamic> json) {
    return Discrepancy(
      id: json['id'] as int?,
      discrepancyType: json['discrepancy_type'] as String? ?? 'DISCREPANCY',
      description: json['description'] as String? ?? '',
      productId: json['product_id'] as int?,
      productName: json['product_name'] as String?,
      barcode: json['barcode'] as String?,
      expectedQuantity: json['expected_quantity'] as int?,
      observedQuantity: json['observed_quantity'] as int?,
      riskLevel: json['risk_level'] as String? ?? 'MEDIUM',
      recommendedAction: json['recommended_action'] as String? ?? 'REVIEW_BASKET',
      resolutionStatus: json['resolution_status'] as String? ?? 'PENDING',
      resolutionReason: json['resolution_reason'] as String?,
      resolvedBy: json['resolved_by'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'discrepancy_type': discrepancyType,
    'description': description,
    if (productId != null) 'product_id': productId,
    if (productName != null) 'product_name': productName,
    if (barcode != null) 'barcode': barcode,
    if (expectedQuantity != null) 'expected_quantity': expectedQuantity,
    if (observedQuantity != null) 'observed_quantity': observedQuantity,
    'risk_level': riskLevel,
    'recommended_action': recommendedAction,
    'resolution_status': resolutionStatus,
    if (resolutionReason != null) 'resolution_reason': resolutionReason,
    if (resolvedBy != null) 'resolved_by': resolvedBy,
  };
}

class CartSummary {
  final String sessionId;
  final List<CartItem> items;
  final int itemCount;
  final double subtotal;
  final double tax;
  final double total;
  final double calculatedWeightGrams;

  const CartSummary({
    required this.sessionId,
    required this.items,
    required this.itemCount,
    required this.subtotal,
    required this.tax,
    required this.total,
    required this.calculatedWeightGrams,
  });

  factory CartSummary.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final itemsList = rawItems.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList();
    return CartSummary(
      sessionId: json['session_id'] as String? ?? '',
      items: itemsList,
      itemCount: json['item_count'] as int? ?? itemsList.fold(0, (acc, it) => acc + it.quantity),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      calculatedWeightGrams: (json['calculated_weight_grams'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class VerificationResult {
  final String sessionId;
  final String verificationStatus;
  final int riskScore;
  final bool isClean;
  final String summary;
  final String recommendedAction;
  final List<Discrepancy> discrepancies;
  final double confidenceLevel;
  final String verificationTimestamp;

  const VerificationResult({
    required this.sessionId,
    required this.verificationStatus,
    required this.riskScore,
    required this.isClean,
    required this.summary,
    required this.recommendedAction,
    required this.discrepancies,
    required this.confidenceLevel,
    required this.verificationTimestamp,
  });

  factory VerificationResult.fromJson(Map<String, dynamic> json) {
    final rawDiscs = json['discrepancies'] as List<dynamic>? ?? [];
    final status = json['verification_status'] as String? ?? 'LOW_RISK';
    return VerificationResult(
      sessionId: json['session_id'] as String? ?? '',
      verificationStatus: status,
      riskScore: json['risk_score'] as int? ?? (status == 'LOW_RISK' ? 5 : 75),
      isClean: json['is_clean'] as bool? ?? (status == 'LOW_RISK'),
      summary: json['summary'] as String? ?? (status == 'LOW_RISK' ? 'Cart clear' : 'Discrepancy found'),
      recommendedAction: json['recommended_action'] as String? ?? (status == 'LOW_RISK' ? 'APPROVE_CHECKOUT' : 'HOLD_FOR_REVIEW'),
      discrepancies: rawDiscs.map((e) => Discrepancy.fromJson(e as Map<String, dynamic>)).toList(),
      confidenceLevel: (json['confidence_level'] as num?)?.toDouble() ?? 0.95,
      verificationTimestamp: json['verification_timestamp'] as String? ?? DateTime.now().toIso8601String(),
    );
  }
}

class Receipt {
  final String transactionId;
  final String dateTime;
  final String customerName;
  final String storeName;
  final String storeAddress;
  final List<Map<String, dynamic>> purchasedProducts;
  final int itemCount;
  final double subtotal;
  final double tax;
  final double finalTotal;
  final String paymentMethod;
  final String paymentStatus;
  final String verificationStatus;
  final int riskScore;
  final String securityBarcode;
  final String exitPassCode;

  const Receipt({
    required this.transactionId,
    required this.dateTime,
    required this.customerName,
    required this.storeName,
    required this.storeAddress,
    required this.purchasedProducts,
    required this.itemCount,
    required this.subtotal,
    required this.tax,
    required this.finalTotal,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.verificationStatus,
    required this.riskScore,
    required this.securityBarcode,
    required this.exitPassCode,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    final rawProducts = json['purchased_products'] as List<dynamic>? ?? [];
    return Receipt(
      transactionId: json['transaction_id'] as String? ?? '',
      dateTime: json['date_time'] as String? ?? DateTime.now().toIso8601String(),
      customerName: json['customer_name'] as String? ?? 'Customer',
      storeName: json['store_name'] as String? ?? 'ShopScan Metro Store',
      storeAddress: json['store_address'] as String? ?? '100 Innovation Way',
      purchasedProducts: rawProducts.map((e) => Map<String, dynamic>.from(e as Map)).toList(),
      itemCount: json['item_count'] as int? ?? 0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      finalTotal: (json['final_total'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['payment_method'] as String? ?? 'Apple Pay',
      paymentStatus: json['payment_status'] as String? ?? 'SUCCESSFUL',
      verificationStatus: json['verification_status'] as String? ?? 'LOW_RISK',
      riskScore: json['risk_score'] as int? ?? 5,
      securityBarcode: json['security_barcode'] as String? ?? '',
      exitPassCode: json['exit_pass_code'] as String? ?? '',
    );
  }
}

class AdminStats {
  final int totalSessions;
  final int totalTransactions;
  final int flaggedOrdersPending;
  final int resolvedDiscrepancies;
  final int totalProducts;
  final double totalRevenue;
  final double preventedLoss;
  final String lossPreventionRate;

  const AdminStats({
    required this.totalSessions,
    required this.totalTransactions,
    required this.flaggedOrdersPending,
    required this.resolvedDiscrepancies,
    required this.totalProducts,
    required this.totalRevenue,
    required this.preventedLoss,
    required this.lossPreventionRate,
  });

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      totalSessions: json['total_sessions'] as int? ?? 142,
      totalTransactions: json['total_transactions'] as int? ?? 1358,
      flaggedOrdersPending: json['flagged_orders_pending'] as int? ?? 3,
      resolvedDiscrepancies: json['resolved_discrepancies'] as int? ?? 59,
      totalProducts: json['total_products'] as int? ?? 24,
      totalRevenue: (json['total_revenue'] as num?)?.toDouble() ?? 14850.75,
      preventedLoss: (json['prevented_loss'] as num?)?.toDouble() ?? 2840.50,
      lossPreventionRate: json['loss_prevention_rate'] as String? ?? '96.8%',
    );
  }
}
