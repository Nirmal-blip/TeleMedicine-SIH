import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationPage extends StatefulWidget {
  final String userId;
  const NotificationPage({Key? key, required this.userId}) : super(key: key);

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  late Future<List<NotificationModel>> _notifications;
  final NotificationService _service = NotificationService();

  @override
  void initState() {
    super.initState();
    _notifications = _service.fetchNotifications(widget.userId);
  }

  void _markAsRead(int notifId) async {
    await _service.markAsRead(widget.userId, notifId);
    setState(() {
      _notifications = _service.fetchNotifications(widget.userId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: FutureBuilder<List<NotificationModel>>(
        future: _notifications,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No notifications.'));
          }
          final notifications = snapshot.data!;
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notif = notifications[index];
              return ListTile(
                title: Text(notif.title),
                subtitle: Text('${notif.body}\n${notif.timestamp}'),
                isThreeLine: true,
                trailing: notif.read
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.mark_email_read, color: Colors.green),
                        onPressed: () => _markAsRead(notif.id),
                      ),
                tileColor: notif.read ? Colors.white : Colors.green[50],
              );
            },
          );
        },
      ),
    );
  }
}