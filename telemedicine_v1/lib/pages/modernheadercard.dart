import 'package:flutter/material.dart';
import '../widgets/UserGreetingHeader.dart'; // Assumes you already have this

class ModernHeaderCard extends StatelessWidget {
  final String username;
  final ImageProvider? avatarImage;
  final VoidCallback? onChatPressed;
  final VoidCallback? onNotificationPressed;
  final bool hasUnread;

  const ModernHeaderCard({
    super.key,
    required this.username,
    this.avatarImage,
    this.onChatPressed,
    this.onNotificationPressed,
    this.hasUnread = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // 🔹 Avatar + Greeting
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.withOpacity(0.3),
                      spreadRadius: 2,
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 24,
                  backgroundImage: avatarImage ??
                      const AssetImage("assets/images/avatar.png"),
                ),
              ),
              const SizedBox(width: 16),
              const UserGreetingHeader(),
            ],
          ),

          // 🔹 Chat & Notification Icons
          Row(
            children: [
              _iconButton(
                icon: Icons.chat_bubble,
                onPressed: onChatPressed,
                color: Colors.green.shade600,
              ),
              const SizedBox(width: 8),
              Stack(
                children: [
                  _iconButton(
                    icon: Icons.notifications,
                    onPressed: onNotificationPressed,
                    color: Colors.green.shade600,
                  ),
                  if (hasUnread)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.5),
                              spreadRadius: 1,
                              blurRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Custom icon button with shadow and rounded card feel
  Widget _iconButton({
    required IconData icon,
    required VoidCallback? onPressed,
    required Color color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: color),
      ),
    );
  }
}
