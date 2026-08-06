
import 'package:flutter/material.dart';
import 'search_results_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _budgetMin = TextEditingController(text: "50");
  final _budgetMax = TextEditingController(text: "150");
  final _style = TextEditingController(text: "minimalist, smart-casual");
  final _category = TextEditingController(text: "chino");

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PerfectFit')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Quick Search", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(controller: _category, decoration: const InputDecoration(labelText: "Category (e.g., chino, shirt)")),
            Row(children: [
              Expanded(child: TextField(controller: _budgetMin, decoration: const InputDecoration(labelText: "Budget Min"))),
              const SizedBox(width: 8),
              Expanded(child: TextField(controller: _budgetMax, decoration: const InputDecoration(labelText: "Budget Max"))),
            ]),
            TextField(controller: _style, decoration: const InputDecoration(labelText: "Style tags (comma-separated)")),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => SearchResultsScreen(
                  category: _category.text,
                  budgetMin: double.tryParse(_budgetMin.text) ?? 0,
                  budgetMax: double.tryParse(_budgetMax.text) ?? 9999,
                  styleTags: _style.text.split(",").map((s)=>s.trim()).toList(),
                )));
              },
              child: const Text("Find Matches"),
            ),
          ],
        ),
      ),
    );
  }
}
