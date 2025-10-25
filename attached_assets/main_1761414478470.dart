
import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const PerfectFitApp());
}

class PerfectFitApp extends StatelessWidget {
  const PerfectFitApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PerfectFit',
      theme: ThemeData(useMaterial3: true, brightness: Brightness.light),
      home: const HomeScreen(),
    );
  }
}
