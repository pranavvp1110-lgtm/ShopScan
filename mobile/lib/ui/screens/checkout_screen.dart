import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../view_models/shop_view_model.dart';
import '../../data/models/shop_models.dart';

class CheckoutScreen extends StatefulWidget {
  final ShopScanViewModel viewModel;
  final VoidCallback onStartNewTrip;

  const CheckoutScreen({
    super.key,
    required this.viewModel,
    required this.onStartNewTrip,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedPayment = 'Apple Pay';
  Receipt? _completedReceipt;

  @override
  void initState() {
    super.initState();
    _completedReceipt = widget.viewModel.lastReceipt;
  }

  void _onCompleteCheckout() async {
    final verification = widget.viewModel.verification;
    if (verification != null && !verification.isClean) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot checkout: Discrepancy detected! Please resolve flag first.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    final receipt = await widget.viewModel.checkout(_selectedPayment);
    if (!mounted) return;

    if (receipt != null) {
      setState(() {
        _completedReceipt = receipt;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_completedReceipt != null) {
      return _buildReceiptView(_completedReceipt!);
    }

    final cart = widget.viewModel.cart;
    final verification = widget.viewModel.verification;
    final isClean = verification?.isClean ?? true;

    if (cart == null || cart.items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.receipt_long_outlined, size: 56, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('No Pending Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Add products to your cart before proceeding to checkout.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: widget.onStartNewTrip,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white),
                child: const Text('Start Shopping'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gate Status Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isClean ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isClean ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA), width: 1.5),
              ),
              child: Row(
                children: [
                  Icon(
                    isClean ? Icons.check_circle_rounded : Icons.warning_rounded,
                    color: isClean ? const Color(0xFF059669) : const Color(0xFFDC2626),
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isClean ? 'AUTONOMOUS CLEARANCE READY' : 'CLEARANCE HOLD REQUIRED',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: isClean ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                          ),
                        ),
                        Text(
                          isClean
                              ? 'Sensor telemetry matched. Ready to open turnstiles.'
                              : 'Discrepancy detected. Resolve flag to permit checkout.',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                  ),
                  if (!isClean)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDC2626),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        visualDensity: VisualDensity.compact,
                      ),
                      onPressed: () {
                        widget.viewModel.resolveDiscrepancy(null, 'Staff override approved', 'Associate Jordan');
                      },
                      child: const Text('Override', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Order Breakdown Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Order Summary', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),
                  ...cart.items.map((it) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${it.quantity}x ${it.productName}',
                            style: const TextStyle(fontSize: 12, color: Colors.black87),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '\$${it.lineTotal.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Subtotal', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                      Text('\$${cart.subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Sales Tax (8%)', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                      Text('\$${cart.tax.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Due', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                      Text(
                        '\$${cart.total.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2563EB)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Payment Selection
            const Text('Payment Method', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            _buildPaymentOption('Apple Pay', Icons.apple, const Color(0xFF0F172A)),
            const SizedBox(height: 8),
            _buildPaymentOption('Google Pay', Icons.g_mobiledata_rounded, const Color(0xFF4285F4)),
            const SizedBox(height: 8),
            _buildPaymentOption('Credit / Debit Card', Icons.credit_card_rounded, const Color(0xFF10B981)),
            const SizedBox(height: 24),

            // Pay Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isClean ? const Color(0xFF2563EB) : Colors.grey.shade400,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                onPressed: widget.viewModel.isLoading ? null : _onCompleteCheckout,
                child: widget.viewModel.isLoading
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_outline, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Pay \$${cart.total.toStringAsFixed(2)} & Generate Exit Pass',
                            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String name, IconData icon, Color color) {
    final isSelected = _selectedPayment == name;
    return InkWell(
      onTap: () => setState(() => _selectedPayment = name),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF2563EB) : Colors.grey.shade200,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                name,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Color(0xFF2563EB), size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptView(Receipt receipt) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Color(0xFFECFDF5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 40),
                  ),
                  const SizedBox(height: 12),
                  const Text('Payment Successful!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text(receipt.storeName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                  Text(receipt.storeAddress, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                  const SizedBox(height: 16),

                  // Animated Turnstile QR Pass
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'EXPRESS TURNSTILE EXIT PASS',
                          style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(8),
                          color: Colors.white,
                          child: QrImageView(
                            data: receipt.exitPassCode,
                            version: QrVersions.auto,
                            size: 140,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          receipt.exitPassCode,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Scan this barcode at automated turnstile gate 04',
                          style: TextStyle(color: Colors.white60, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Line Items
                  const Divider(),
                  ...receipt.purchasedProducts.map((p) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${p['quantity']}x ${p['name']}', style: const TextStyle(fontSize: 11.5)),
                        Text('\$${(p['line_total'] as num).toStringAsFixed(2)}', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Paid', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('\$${receipt.finalTotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF2563EB))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  setState(() => _completedReceipt = null);
                  widget.onStartNewTrip();
                },
                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                label: const Text('Start New Shopping Trip', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
