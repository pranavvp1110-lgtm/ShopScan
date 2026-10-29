import 'package:flutter/material.dart';
import '../../view_models/shop_view_model.dart';

class DemoControlBar extends StatelessWidget {
  final ShopScanViewModel viewModel;

  const DemoControlBar({super.key, required this.viewModel});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.shield_outlined, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        children: [
                          TextSpan(text: 'ShopScan '),
                          TextSpan(text: 'AI', style: TextStyle(color: Color(0xFF2563EB))),
                        ],
                      ),
                    ),
                    Text(
                      'Smart Mobile Checkout & Loss Prevention',
                      style: TextStyle(fontSize: 10.5, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.restart_alt_rounded, size: 20, color: Colors.grey),
                tooltip: 'Reset Demo State',
                onPressed: () => viewModel.resetDemo(),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildScenarioChip(
                  label: 'Clean Cart',
                  icon: Icons.check_circle_outline,
                  color: const Color(0xFF10B981),
                  isSelected: viewModel.activeScenarioName.contains('Clean'),
                  onTap: () => viewModel.loadScenario(1),
                ),
                const SizedBox(width: 6),
                _buildScenarioChip(
                  label: 'Missed Scan',
                  icon: Icons.warning_amber_rounded,
                  color: const Color(0xFFEF4444),
                  isSelected: viewModel.activeScenarioName.contains('Missed'),
                  onTap: () => viewModel.loadScenario(2),
                ),
                const SizedBox(width: 6),
                _buildScenarioChip(
                  label: 'Extra Qty',
                  icon: Icons.scale_outlined,
                  color: const Color(0xFFF59E0B),
                  isSelected: viewModel.activeScenarioName.contains('Quantity'),
                  onTap: () => viewModel.loadScenario(3),
                ),
                const SizedBox(width: 6),
                ActionChip(
                  label: const Text('Reset', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  avatar: const Icon(Icons.refresh, size: 14),
                  backgroundColor: Colors.grey.shade100,
                  side: BorderSide(color: Colors.grey.shade300),
                  onPressed: () => viewModel.resetDemo(),
                ),
              ],
            ),
          ),
          if (viewModel.activeScenarioName.isNotEmpty) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: viewModel.activeScenarioName.contains('Clean')
                    ? const Color(0xFFECFDF5)
                    : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: viewModel.activeScenarioName.contains('Clean')
                      ? const Color(0xFFA7F3D0)
                      : const Color(0xFFFECACA),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    viewModel.activeScenarioName.contains('Clean')
                        ? Icons.check_circle
                        : Icons.info,
                    size: 14,
                    color: viewModel.activeScenarioName.contains('Clean')
                        ? const Color(0xFF059669)
                        : const Color(0xFFDC2626),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      viewModel.activeScenarioName,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: viewModel.activeScenarioName.contains('Clean')
                            ? const Color(0xFF065F46)
                            : const Color(0xFF991B1B),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildScenarioChip({
    required String label,
    required IconData icon,
    required Color color,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.12) : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? color : Colors.grey.shade700),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                color: isSelected ? color : Colors.grey.shade800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
