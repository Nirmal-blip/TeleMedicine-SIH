import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class NearbyHospitalsPage extends StatefulWidget {
  const NearbyHospitalsPage({Key? key}) : super(key: key);

  @override
  State<NearbyHospitalsPage> createState() => _NearbyHospitalsPageState();
}

class _NearbyHospitalsPageState extends State<NearbyHospitalsPage> {
  // ✅ API Configuration
  static const String apiBaseUrl =
      "https://489dbddec86a.ngrok-free.app/api/hospitals";

  // State variables
  bool _loading = true;
  String? _error;
  Position? _currentPosition;
  List<Map<String, dynamic>> _hospitals = [];
  final TextEditingController _searchController = TextEditingController();
  int _selectedRadius = 10; // km

  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _fetchLocationAndHospitals();
  }

  Future<void> _fetchLocationAndHospitals() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _error =
            'Location permission denied. Please enable location access.';
            _loading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _error =
          'Location permissions are permanently denied. Please enable from settings.';
          _loading = false;
        });
        return;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );

      setState(() {
        _currentPosition = position;
      });

      await _fetchNearbyHospitals(position.latitude, position.longitude);
    } catch (e) {
      setState(() {
        _error = 'Failed to get location: $e';
        _loading = false;
      });
    }
  }

  Future<void> _fetchNearbyHospitals(double lat, double lng) async {
    try {
      final radius = _selectedRadius * 1000; // km → meters
      final url =
      Uri.parse('$apiBaseUrl?lat=$lat&lon=$lng&radius=$radius');

      final response =
      await http.get(url).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final hospitals = data['hospitals'] as List<dynamic>;
        _processHospitals(hospitals);
      } else {
        _setError('Failed to fetch hospitals: ${response.statusCode}');
      }
    } catch (e) {
      _setError('Error fetching hospitals: $e');
    }
  }

  void _processHospitals(List<dynamic> hospitals) {
    List<Map<String, dynamic>> hospitalList = hospitals.map((hospital) {
      return {
        'name': hospital['name'] ?? 'Unknown Hospital',
        'lat': (hospital['lat'] as num).toDouble(),
        'lng': (hospital['lon'] as num).toDouble(),
        'maps_url': hospital['maps_url'] ?? '',
      };
    }).toList();

    setState(() {
      _hospitals = hospitalList;
      _loading = false;
      _updateMarkers();
    });
  }

  void _updateMarkers() {
    _markers.clear();

    // Add current location marker
    if (_currentPosition != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId("current_location"),
          position: LatLng(
            _currentPosition!.latitude,
            _currentPosition!.longitude,
          ),
          infoWindow: const InfoWindow(title: "You are here"),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        ),
      );
    }

    // Add hospital markers
    for (var hospital in _hospitals) {
      _markers.add(
        Marker(
          markerId: MarkerId(hospital['name']),
          position: LatLng(hospital['lat'], hospital['lng']),
          infoWindow: InfoWindow(title: hospital['name']),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    }
  }

  void _setError(String message) {
    setState(() {
      _error = message;
      _loading = false;
    });
  }

  void _openInMaps(double lat, double lng, String name) async {
    final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
    try {
      await launchUrl(Uri.parse(url));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open maps: $e')),
      );
    }
  }

  void _onRadiusChanged(int radius) {
    setState(() {
      _selectedRadius = radius;
    });

    if (_currentPosition != null) {
      _fetchNearbyHospitals(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
      );
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Nearby Hospitals'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.green))
          : _error != null
          ? Center(child: Text(_error!))
          : Column(
        children: [
          // 📍 Current Location Card
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 4,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Your Current Location",
                    style: TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(
                  _currentPosition != null
                      ? "Lat: ${_currentPosition!.latitude.toStringAsFixed(4)}, Lng: ${_currentPosition!.longitude.toStringAsFixed(4)}"
                      : "Fetching...",
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 8),
                Text("${_hospitals.length} hospitals found"),
              ],
            ),
          ),

          // 🗺️ Google Map
          SizedBox(
            height: 300,
            child: GoogleMap(
              onMapCreated: (controller) {
                _mapController = controller;
              },
              initialCameraPosition: CameraPosition(
                target: _currentPosition != null
                    ? LatLng(_currentPosition!.latitude,
                    _currentPosition!.longitude)
                    : const LatLng(20.5937, 78.9629), // fallback: India
                zoom: 14,
              ),
              markers: _markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
            ),
          ),

          const SizedBox(height: 16),

          // 🏥 Hospitals List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _hospitals.length,
              itemBuilder: (context, index) {
                final hospital = _hospitals[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.local_hospital,
                        color: Colors.red),
                    title: Text(hospital['name']),
                    subtitle: Text(
                        "${hospital['lat']}, ${hospital['lng']}"),
                    trailing: IconButton(
                      icon: const Icon(Icons.directions,
                          color: Colors.green),
                      onPressed: () => _openInMaps(
                        hospital['lat'],
                        hospital['lng'],
                        hospital['name'],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}


