import 'package:flutter/material.dart';
import '../../view_models/shop_view_model.dart';
import '../widgets/demo_control_bar.dart';
import 'cart_screen.dart';
import 'scanner_screen.dart';
import 'checkout_screen.dart';
import 'admin_screen.dart';

class HomeScreen extends StatefulWidget {
  final ShopScanViewModel viewModel;

  const HomeScreen({super.key, required this.viewModel});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.viewModel,
      builder: (context, _) {
        final itemCount = widget.viewModel.cart?.itemCount ?? 0;
        final hasDiscrepancy = widget.viewModel.verification != null && !widget.viewModel.verification!.isClean;

        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                DemoControlBar(viewModel: widget.viewModel),
                Expanded(
                  child: IndexedStack(
                    index: _currentIndex,
                    children: [
                      CartScreen(
                        viewModel: widget.viewModel,
                        onNavigateToScanner: () => setState(() => _currentIndex = 1),
                        onNavigateToCheckout: () => setState(() => _currentIndex = 2),
                      ),
                      ScannerScreen(
                        viewModel: widget.viewModel,
                        onNavigateToCart: () => setState(() => _currentIndex = 0),
                      ),
                      CheckoutScreen(
                        viewModel: widget.viewModel,
                        onStartNewTrip: () => setState(() => _currentIndex = 1),
                      ),
                      AdminScreen(
                        viewModel: widget.viewModel,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
            ),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (index) => setState(() => _currentIndex = index),
              backgroundColor: Colors.white,
              indicatorColor: const Color(0xFF2563EB).withValues(alpha: 0.12),
              destinations: [
                NavigationDestination(
                  icon: Badge(
                    isLabelVisible: itemCount > 0,
                    label: Text('$itemCount', style: const TextStyle(fontSize: 10)),
                    child: const Icon(Icons.shopping_cart_outlined),
                  ),
                  selectedIcon: Badge(
                    isLabelVisible: itemCount > 0,
                    label: Text('$itemCount', style: const TextStyle(fontSize: 10)),
                    child: const Icon(Icons.shopping_cart, color: Color(0xFF2563EB)),
                  ),
                  label: 'Basket',
                ),
                const NavigationDestination(
                  icon: Icon(Icons.qr_code_scanner),
                  selectedIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF2563EB)),
                  label: 'Scan & Go',
                ),
                NavigationDestination(
                  icon: Badge(
                    isLabelVisible: hasDiscrepancy,
                    backgroundColor: const Color(0xFFEF4444),
                    child: const Icon(Icons.credit_card_outlined),
                  ),
                  selectedIcon: Badge(
                    isLabelVisible: hasDiscrepancy,
                    backgroundColor: const Color(0xFFEF4444),
                    child: const Icon(Icons.credit_card, color: Color(0xFF2563EB)),
                  ),
                  label: 'Checkout',
                ),
                NavigationDestination(
                  icon: Badge(
                    isLabelVisible: hasDiscrepancy,
                    backgroundColor: const Color(0xFFEF4444),
                    child: const Icon(Icons.security_outlined),
                  ),
                  selectedIcon: Badge(
                    isLabelVisible: hasDiscrepancy,
                    backgroundColor: const Color(0xFFEF4444),
                    child: const Icon(Icons.security, color: Color(0xFF2563EB)),
                  ),
                  label: 'Security',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
