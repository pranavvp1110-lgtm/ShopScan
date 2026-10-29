import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shopscan/main.dart';
import 'package:shopscan/view_models/shop_view_model.dart';

void main() {
  testWidgets('ShopScan smoke test verifies brand title and tabs', (WidgetTester tester) async {
    final viewModel = ShopScanViewModel();
    await viewModel.init();

    await tester.pumpWidget(ShopScanApp(viewModel: viewModel));
    await tester.pump(const Duration(milliseconds: 100));

    // Verify subtitle text and RichText presence
    expect(find.text('Smart Mobile Checkout & Loss Prevention'), findsOneWidget);
    expect(find.byType(RichText), findsWidgets);

    // Verify bottom navigation destinations
    expect(find.text('Basket'), findsOneWidget);
    expect(find.text('Scan & Go'), findsOneWidget);
    expect(find.text('Checkout'), findsOneWidget);
    expect(find.text('Security'), findsOneWidget);
  });
}
