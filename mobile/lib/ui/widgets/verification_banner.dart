import 'package:flutter/material.dart';
import '../../data/models/shop_models.dart';
import '../../view_models/shop_view_model.dart';

class VerificationBanner extends StatelessWidget {
  final VerificationResult? verification;
  final ShopScanViewModel viewModel;

  const VerificationBanner({
    super.key,
    required this.verification,
    required this.viewModel,
  });

  @override
  Widget build(BuildContext context) {
    if (verification == null) return const SizedBox.shrink();

    final isClean = verification!.verificationStatus == 'LOW_RISK';
    final statusColor = isClean ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final bgColor = isClean ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2);
    final borderColor = isClean ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: statusColor.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isClean ? Icons.verified_user_rounded : Icons.shield_rounded,
                  color: statusColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isClean ? 'LOW RISK: CLEARANCE APPROVED' : 'REVIEW REQUIRED: FLAG DETECTED',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: statusColor,
                        letterSpacing: 0.3,
                      ),
                    ),
                    Text(
                      'AI Confidence: ${(verification!.confidenceLevel * 100).toInt()}% • Risk Score: ${verification!.riskScore}/100',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            verification!.summary,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: isClean ? const Color(0xFF065F46) : const Color(0xFF991B1B),
            ),
          ),
          if (verification!.discrepancies.isNotEmpty) ...[
            const SizedBox(height: 8),
            const Divider(height: 1, thickness: 1),
            const SizedBox(height: 8),
            ...verification!.discrepancies.map((d) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${d.discrepancyType}: ${d.productName ?? 'Item'}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        Text(
                          d.description,
                          style: TextStyle(fontSize: 10.5, color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => _showResolveDialog(context, d),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      visualDensity: VisualDensity.compact,
                    ),
                    child: const Text('Resolve', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            )),
          ],
        ],
      ),
    );
  }

  void _showResolveDialog(BuildContext context, Discrepancy discrepancy) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Resolve Discrepancy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Item: ${discrepancy.productName ?? "Uncatalogued Item"}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              discrepancy.description,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
            ),
            const SizedBox(height: 16),
            const Text(
              'Store Associate Action:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              '• Verified item scanned into cart or shelf returned.\n• Cleared false positive warning.',
              style: TextStyle(fontSize: 11.5),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              viewModel.resolveDiscrepancy(
                discrepancy.id,
                'Customer basket physically checked & item accounted for.',
                'Associate Jordan',
              );
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Discrepancy resolved. Cart cleared for checkout!'),
                  backgroundColor: Color(0xFF10B981),
                ),
              );
            },
            child: const Text('Confirm Clearance'),
          ),
        ],
      ),
    );
  }
}
