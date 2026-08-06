
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/product_card.dart';

class SearchResultsScreen extends StatefulWidget {
  final String category;
  final double budgetMin;
  final double budgetMax;
  final List<String> styleTags;
  const SearchResultsScreen({super.key, required this.category, required this.budgetMin, required this.budgetMax, required this.styleTags});
  @override
  State<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends State<SearchResultsScreen> {
  List<dynamic> results = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await ApiService.recommend(
      fit: {"category": widget.category},
      styleTags: widget.styleTags,
      budgetRange: [widget.budgetMin, widget.budgetMax],
    );
    setState(() {
      results = data['results'] ?? [];
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Results')),
      body: loading ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
          itemCount: results.length,
          itemBuilder: (context, i) => ProductCard(product: results[i]),
        ),
    );
  }
}
