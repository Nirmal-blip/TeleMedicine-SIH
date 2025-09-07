import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/notification_model.dart';

class NotificationService {
  static const String baseUrl = 'http://127.0.0.1:5000';

  Future<List<NotificationModel>> fetchNotifications(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/notifications?user_id=$userId'));
    if (response.statusCode == 200) {
      final List data = json.decode(response.body)['notifications'];
      return data.map((json) => NotificationModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load notifications');
    }
  }

  Future<void> markAsRead(String userId, int notifId) async {
    await http.post(
      Uri.parse('$baseUrl/notifications/read'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'user_id': userId, 'notif_id': notifId}),
    );
  }
}