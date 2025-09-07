import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;

import 'package:permission_handler/permission_handler.dart';
import '../widgets/UserGreetingHeader.dart';
import 'nearby_hospitals.dart';





// 🔹 Helper widget for each prescription
Widget _buildPrescriptionItem({required String title, required String subtitle}) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(subtitle, style: const TextStyle(color: Colors.black54)),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            IconButton(
              icon: const Icon(Icons.download, color: Colors.green),
              onPressed: () {
                // Download prescription logic
              },
            ),
            TextButton.icon(
              onPressed: () {
                // Approve logic
              },
              icon: const Icon(Icons.check_circle, color: Colors.green),
              label: const Text("Approve"),
            ),
            TextButton.icon(
              onPressed: () {
                // Deny logic
              },
              icon: const Icon(Icons.cancel, color: Colors.red),
              label: const Text("Deny"),
            ),
          ],
        ),
        const Divider(height: 1),
      ],
    ),
  );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool hasUnread = false;
  final String userId = 'user1';// Replace with actual user id logic

  bool _locationAvailable = true; // Tracks if location is accessible
  String? _locationErrorMessage;  // Stores error to show in UI


  @override
  void initState() {
    super.initState();
    _checkUnread();
    _checkLocationPermissions();
  }
  Future<void> _checkLocationPermissions() async {
    var status = await Permission.location.status;

    if (status.isDenied) {
      status = await Permission.location.request();
      if (status.isDenied) {
        setState(() {
          _locationAvailable = false;
          _locationErrorMessage = 'Location permission denied';
        });
        return;
      }
    }

    if (status.isPermanentlyDenied) {
      setState(() {
        _locationAvailable = false;
        _locationErrorMessage = 'Location permission permanently denied. Please enable it from settings.';
      });
      await openAppSettings();
      return;
    }

    // If permission granted
    setState(() {
      _locationAvailable = true;
      _locationErrorMessage = null;
    });
  }


  void _checkUnread() async {
    // For demo purposes, we'll simulate checking for unread notifications
    // In real app, you would call your notification service here
    setState(() {
      hasUnread = true; // Demo: always show unread for testing
    });
  }

  void _openNotifications() async {
    // For demo purposes, we'll show a simple dialog
    // In real app, you would navigate to NotificationPage
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Notifications'),
        content: const Text('Notification page would open here.\n\nDemo notifications:\n• Appointment reminder\n• Prescription ready'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                hasUnread = false; // Mark as read
              });
            },
            child: const Text('Mark as Read'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
  void _getUserLocation() async {
    await _checkLocationPermissions();

    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    print("User location: ${position.latitude}, ${position.longitude}");
  }
  void _showNearbyHospitals() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NearbyHospitalsPage()),
    );
  }


  void _sendSOS() async {
    // Show emergency options dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('🚨 Emergency Options'),
        content: const Text('Choose your emergency action:'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _callEmergencyServices();
            },
            child: const Text('📞 Call 108'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _sendEmergencyAlert();
            },
            child: const Text('📱 Send Alert to Doctors'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _shareLocation();
            },
            child: const Text('📍 Share Location'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _callEmergencyServices() async {
    try {
      // Call emergency services
      final Uri phoneUri = Uri(scheme: 'tel', path: '108');
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        _showErrorDialog('Unable to make phone call');
      }
    } catch (e) {
      _showErrorDialog('Error calling emergency services: $e');
    }
  }

  void _sendEmergencyAlert() async {
    try {
      // Request location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showErrorDialog('Location permission denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _showErrorDialog('Location permissions are permanently denied');
        return;
      }

      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 20),
              Text('Sending emergency alert...'),
            ],
          ),
        ),
      );

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final healthStatus = "Emergency! User needs immediate medical attention.";
      final timestamp = DateTime.now().toIso8601String();

      // Send SOS to backend
      final response = await http.post(
        Uri.parse('https://bb76d8476fbe.ngrok-free.app/sos'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'user_id': userId,
          'location': {'lat': position.latitude, 'lng': position.longitude},
          'health_status': healthStatus,
          'timestamp': timestamp,
          'emergency_type': 'medical_emergency',
        }),
      );

      // Close loading dialog
      Navigator.pop(context);

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('🚨 Emergency Alert Sent'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('✅ Alert sent to doctors successfully!'),
                const SizedBox(height: 10),
                Text('📍 Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}'),
                const SizedBox(height: 10),
                Text('⏰ Time: ${DateTime.now().toString().substring(0, 19)}'),
                const SizedBox(height: 10),
                Text('📱 Response: ${result['message'] ?? 'Doctors have been notified'}'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _callEmergencyServices();
                },
                child: const Text('Call 911'),
              ),
            ],
          ),
        );
      } else {
        _showErrorDialog('Failed to send emergency alert. Please call 911 directly.');
      }
    } catch (e) {
      // Close loading dialog if open
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      _showErrorDialog('Error sending emergency alert: $e\n\nPlease call 911 directly.');
    }
  }

  void _shareLocation() async {
    try {
      // Request location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showErrorDialog('Location permission denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _showErrorDialog('Location permissions are permanently denied');
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Create location message
      final locationMessage = '''
🚨 EMERGENCY LOCATION SHARE 🚨

📍 My current location:
Latitude: ${position.latitude.toStringAsFixed(6)}
Longitude: ${position.longitude.toStringAsFixed(6)}

🗺️ Google Maps: https://www.google.com/maps?q=${position.latitude},${position.longitude}

⏰ Time: ${DateTime.now().toString().substring(0, 19)}

📱 Please help! I need emergency assistance.
''';

      // Share location via SMS/WhatsApp
      final Uri smsUri = Uri(
        scheme: 'sms',
        path: '',
        queryParameters: {'body': locationMessage},
      );

      if (await canLaunchUrl(smsUri)) {
        await launchUrl(smsUri);
      } else {
        // Fallback: Copy to clipboard
        await Clipboard.setData(ClipboardData(text: locationMessage));
        _showErrorDialog('Location copied to clipboard. Please share it manually.');
      }
    } catch (e) {
      _showErrorDialog('Error sharing location: $e');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
  Widget _buildIconBox(IconData icon, {VoidCallback? onPressed}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.green.shade700),
        onPressed: onPressed,
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(130),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.green.shade600,
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(10),
              bottomRight: Radius.circular(10),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.green.withOpacity(0.3),
                spreadRadius: 0,
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              spreadRadius: 2,
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),

                      ),
                      const SizedBox(width: 16),
                      const UserGreetingHeader(
                        textColor: Colors.white,
                      ),
                    ],
                  ),
                  Row(
                    children: [

                      Stack(
                        children: [
                          _buildIconBox(Icons.notifications, onPressed: _openNotifications),
                          if (hasUnread)
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.red.withOpacity(0.5),
                                      blurRadius: 4,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),

            // 🔹 Enhanced Upcoming Appointments
            Text(
              "Upcoming Appointments",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 16),

            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green.shade50, Colors.white],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.1),
                    spreadRadius: 0,
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(20),
                leading: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.green.withOpacity(0.2),
                        spreadRadius: 2,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const CircleAvatar(
                    backgroundImage: AssetImage("assets/images/doctor.png"),
                    radius: 30,
                  ),
                ),
                title: Text(
                  "Dr. Pushpinder Singh",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.grey.shade800,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      "Cardiologist",
                      style: TextStyle(
                        color: Colors.green.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "10:00 AM - Video Consultation",
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                trailing: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Colors.green.shade600,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.blue.shade50, Colors.white],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.1),
                    spreadRadius: 0,
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(20),
                leading: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.withOpacity(0.2),
                        spreadRadius: 2,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const CircleAvatar(
                    backgroundImage: AssetImage("assets/images/doctor2.png"),
                    radius: 30,
                  ),
                ),
                title: Text(
                  "Dr. Jitender Sodhi",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.grey.shade800,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      "Dermatologist",
                      style: TextStyle(
                        color: Colors.blue.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "2:30 PM - In-Person Visit",
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                trailing: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Colors.blue.shade600,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // 🔹 Prescriptions (Dropdown List)
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              color: const Color(0xFFE8F5E9),
              elevation: 2,
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent), // removes black borders
                child: ExpansionTile(
                  leading: const Icon(Icons.receipt_long, color: Colors.green),
                  title: const Text("Prescriptions", style: TextStyle(fontWeight: FontWeight.bold)),
                  children: [
                    _buildPrescriptionItem(
                      title: "Atorvastatin (10mg)",
                      subtitle: "Once daily - After dinner",
                    ),
                    _buildPrescriptionItem(
                      title: "Metformin (500mg)",
                      subtitle: "Twice daily - Morning & Night",
                    ),
                    _buildPrescriptionItem(
                      title: "Paracetamol (650mg)",
                      subtitle: "As needed for fever",
                    ),
                    _buildPrescriptionItem(
                      title: "Paracetamol (650mg)",
                      subtitle: "As needed for fever",
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 🔹 Quick Actions
            const Text("Quick Actions", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              childAspectRatio: 1.6,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _QuickActionCard(
                  icon: Icons.video_call,
                  label: "Book Video Consultancy",
                  onTap: () {},
                ),

                _QuickActionCard(
                  icon: Icons.local_hospital,
                  label: "Nearby Hospitals",
                  onTap: _locationAvailable ? _showNearbyHospitals : null,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // 🔹 Emergency Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _locationAvailable ? _sendSOS : null,
                child: const Text("🚨  SOS Emergency Call", style: TextStyle(fontSize: 16, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 🔹 Quick Action Card
class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;


  const _QuickActionCard({required this.icon, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 3,
      color: Colors.green, // <-- Set card background color here
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 32,
                color: Colors.white, // <-- icon color white for contrast
              ),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white, // <-- text color white for contrast
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
