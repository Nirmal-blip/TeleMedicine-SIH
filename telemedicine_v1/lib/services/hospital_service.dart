import 'dart:convert';
import 'package:http/http.dart' as http;

class HospitalService {
  Future<List<Map<String, dynamic>>> fetchNearbyHospitals(double lat, double lng) async {
    // Dummy API: Replace with a real one if needed
    final response = await http.get(Uri.parse(
      'https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:$lng,$lat,5000&limit=5&apiKey=YOUR_GEOAPIFY_API_KEY'
    ));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return List<Map<String, dynamic>>.from(data['features'].map((f) => f['properties']));
    } else {
      throw Exception('Failed to load hospitals');
    }
  }
}