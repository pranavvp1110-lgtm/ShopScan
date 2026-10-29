import 'package:flutter/foundation.dart';
import '../data/models/shop_models.dart';
import '../data/services/api_service.dart';
import '../data/mock_data.dart';

class ShopScanViewModel extends ChangeNotifier {
  final ApiService _apiService;
  final String sessionId;

  ShopScanViewModel({
    ApiService? apiService,
    this.sessionId = 'SES-DEMO-01',
  }) : _apiService = apiService ?? ApiService();

  List<Product> _products = [];
  List<Product> get products => _products;

  CartSummary? _cart;
  CartSummary? get cart => _cart;

  VerificationResult? _verification;
  VerificationResult? get verification => _verification;

  Receipt? _lastReceipt;
  Receipt? get lastReceipt => _lastReceipt;

  AdminStats? _adminStats;
  AdminStats? get adminStats => _adminStats;

  String _selectedCategory = 'All';
  String get selectedCategory => _selectedCategory;

  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String _activeScenarioName = '';
  String get activeScenarioName => _activeScenarioName;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _products = await _apiService.fetchProducts();
      _cart = await _apiService.fetchCart(sessionId);
      _verification = await _apiService.runVerification(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void filterCategory(String category) {
    _selectedCategory = category;
    _refreshProducts();
  }

  void search(String query) {
    _searchQuery = query;
    _refreshProducts();
  }

  Future<void> _refreshProducts() async {
    _products = await _apiService.fetchProducts(
      category: _selectedCategory,
      search: _searchQuery,
    );
    notifyListeners();
  }

  Future<void> addToCart(Product product, {int quantity = 1}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _apiService.addToCart(
        sessionId,
        productId: product.id,
        barcode: product.barcode,
        quantity: quantity,
      );
      _verification = await _apiService.runVerification(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addByBarcode(String barcode) async {
    _isLoading = true;
    notifyListeners();

    try {
      final product = MockData.products.cast<Product?>().firstWhere(
        (p) => p?.barcode == barcode.trim(),
        orElse: () => null,
      );

      if (product == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _cart = await _apiService.addToCart(
        sessionId,
        productId: product.id,
        barcode: product.barcode,
        quantity: 1,
      );
      _verification = await _apiService.runVerification(sessionId);
      return true;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateQuantity(int itemId, int newQuantity) async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _apiService.updateQuantity(sessionId, itemId, newQuantity);
      _verification = await _apiService.runVerification(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeItem(int itemId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _apiService.removeItem(sessionId, itemId);
      _verification = await _apiService.runVerification(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _apiService.clearCart(sessionId);
      _verification = await _apiService.runVerification(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Receipt?> checkout(String paymentMethod) async {
    _isLoading = true;
    notifyListeners();

    try {
      _lastReceipt = await _apiService.executeCheckout(sessionId, paymentMethod);
      _cart = MockData.clearCart(sessionId);
      _verification = MockData.verifyCart(sessionId);
      _adminStats = await _apiService.fetchAdminStats();
      return _lastReceipt;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadScenario(int id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.loadScenario(id, sessionId);
      MockData.loadScenario(id);
      _cart = MockData.getCartSummary(sessionId);
      _verification = MockData.verifyCart(sessionId);

      if (id == 1) {
        _activeScenarioName = 'Scenario 1: Clean Cart (Approved)';
      } else if (id == 2) {
        _activeScenarioName = 'Scenario 2: Missed Scan (Flagged)';
      } else if (id == 3) {
        _activeScenarioName = 'Scenario 3: Quantity Mismatch (Flagged)';
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> resetDemo() async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = MockData.clearCart(sessionId);
      _verification = MockData.verifyCart(sessionId);
      _activeScenarioName = '';
      _lastReceipt = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void resolveDiscrepancy(int? id, String reason, String staffName) {
    if (_verification != null && _verification!.discrepancies.isNotEmpty) {
      for (var d in _verification!.discrepancies) {
        if (d.id == id || id == null) {
          d.resolutionStatus = 'RESOLVED';
          d.resolutionReason = reason;
          d.resolvedBy = staffName;
        }
      }
      MockData.simulatedRiskStatus = 'LOW_RISK';
      MockData.simulatedRiskScore = 5;
      MockData.simulatedDiscrepancies.clear();
      _verification = MockData.verifyCart(sessionId);
      notifyListeners();
    }
  }
}
