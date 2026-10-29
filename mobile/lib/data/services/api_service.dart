import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/shop_models.dart';
import '../mock_data.dart';

class ApiService {
  final String baseUrl;
  final http.Client client;

  ApiService({
    this.baseUrl = 'http://127.0.0.1:8000/api',
    http.Client? client,
  }) : client = client ?? http.Client();

  Future<List<Product>> fetchProducts({String? category, String? search}) async {
    try {
      final uri = Uri.parse('$baseUrl/products').replace(queryParameters: {
        if (category != null && category != 'All') 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
      });

      final response = await client.get(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body) as List<dynamic>;
        return list.map((item) => Product.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {
      // Fallback to offline mock data
    }

    var result = List<Product>.from(MockData.products);
    if (category != null && category != 'All') {
      result = result.where((p) => p.category.toLowerCase() == category.toLowerCase()).toList();
    }
    if (search != null && search.isNotEmpty) {
      final q = search.toLowerCase();
      result = result.where((p) => p.name.toLowerCase().contains(q) || p.barcode.contains(q)).toList();
    }
    return result;
  }

  Future<CartSummary> fetchCart(String sessionId) async {
    try {
      final uri = Uri.parse('$baseUrl/cart/$sessionId');
      final response = await client.get(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return CartSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.getCartSummary(sessionId);
  }

  Future<CartSummary> addToCart(
    String sessionId, {
    int? productId,
    String? barcode,
    int quantity = 1,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/cart/$sessionId/items');
      final payload = <String, dynamic>{'quantity': quantity};
      if (productId != null) payload['product_id'] = productId;
      if (barcode != null) payload['barcode'] = barcode;

      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 2));

      if (response.statusCode == 200) {
        return CartSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}

    final prod = MockData.products.firstWhere(
      (p) => p.id == productId || p.barcode == barcode,
      orElse: () => MockData.products.first,
    );
    return MockData.addToCart(sessionId, prod, quantity: quantity);
  }

  Future<CartSummary> updateQuantity(String sessionId, int itemId, int quantity) async {
    try {
      final uri = Uri.parse('$baseUrl/cart/$sessionId/items/$itemId');
      final response = await client.put(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'quantity': quantity}),
      ).timeout(const Duration(seconds: 2));

      if (response.statusCode == 200) {
        return CartSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.updateQuantity(sessionId, itemId, quantity);
  }

  Future<CartSummary> removeItem(String sessionId, int itemId) async {
    try {
      final uri = Uri.parse('$baseUrl/cart/$sessionId/items/$itemId');
      final response = await client.delete(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return CartSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.removeItem(sessionId, itemId);
  }

  Future<CartSummary> clearCart(String sessionId) async {
    try {
      final uri = Uri.parse('$baseUrl/cart/$sessionId/clear');
      final response = await client.delete(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return CartSummary.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.clearCart(sessionId);
  }

  Future<VerificationResult> runVerification(String sessionId) async {
    try {
      final uri = Uri.parse('$baseUrl/verify/$sessionId');
      final response = await client.post(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return VerificationResult.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.verifyCart(sessionId);
  }

  Future<Receipt> executeCheckout(String sessionId, String paymentMethod) async {
    try {
      final uri = Uri.parse('$baseUrl/checkout');
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'session_id': sessionId,
          'payment_method': paymentMethod,
          'allow_override_flag': false,
        }),
      ).timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['receipt'] != null) {
          return Receipt.fromJson(data['receipt'] as Map<String, dynamic>);
        }
      }
    } catch (_) {}
    return MockData.executeCheckout(sessionId, paymentMethod);
  }

  Future<void> loadScenario(int scenarioId, String sessionId) async {
    try {
      final uri = Uri.parse('$baseUrl/demo/scenario/$scenarioId?session_id=$sessionId');
      await client.post(uri).timeout(const Duration(seconds: 2));
    } catch (_) {
      MockData.loadScenario(scenarioId);
    }
  }

  Future<AdminStats> fetchAdminStats() async {
    try {
      final uri = Uri.parse('$baseUrl/admin/stats');
      final response = await client.get(uri).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return AdminStats.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      }
    } catch (_) {}
    return MockData.getAdminStats();
  }
}
