class NotificationModel {
  final int id;
  final String title;
  final String body;
  final bool read;
  final String timestamp;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.read,
    required this.timestamp,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      title: json['title'],
      body: json['body'],
      read: json['read'],
      timestamp: json['timestamp'],
    );
  }
}