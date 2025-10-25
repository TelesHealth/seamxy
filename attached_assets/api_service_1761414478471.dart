
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String base = "http://localhost:8080/api/v1";

  static Future<Map<String, dynamic>> recommend({required Map<String,dynamic> fit, required List<String> styleTags, required List<double> budgetRange}) async {
    final res = await http.post(Uri.parse("$base/recommend"),
      headers: {"Content-Type":"application/json"},
      body: json.encode({"fit": fit, "style_tags": styleTags, "budget_range": budgetRange})
    );
    return json.decode(res.body) as Map<String,dynamic>;
  }
}
