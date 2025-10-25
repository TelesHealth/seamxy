
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(12),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(product['brand'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(product['name'] ?? ''),
            const SizedBox(height: 8),
            Text("\$${(product['price'] ?? 0).toString()}"),
            const SizedBox(height: 8),
            Row(
              children: [
                Chip(label: Text('Fit ${(product['fit_score'] ?? 0).toString()}')),
                const SizedBox(width: 6),
                Chip(label: Text('Style ${(product['style_match'] ?? 0).toString()}')),
                const SizedBox(width: 6),
                Chip(label: Text('Budget ${(product['budget_match'] ?? 0).toString()}')),
              ],
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () async {
                  final url = Uri.parse(product['checkout_url']);
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                },
                child: const Text("Quick Buy"),
              ),
            )
          ],
        ),
      ),
    );
  }
}
