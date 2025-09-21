import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class UserGreetingHeader extends StatelessWidget {
  final Color? textColor;

  const UserGreetingHeader({
    super.key,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final User? user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName ?? 'John Doe';
    final photoUrl = user?.photoURL;
    final Color effectiveColor = textColor ?? Colors.green.shade700;

    return Row(
      children: [
       Transform.translate(offset: const Offset(-15, 5),
        // User Avatar
        child: CircleAvatar(
          backgroundImage: photoUrl != null
              ? NetworkImage(photoUrl) as ImageProvider
              : const AssetImage("assets/images/avatar.png"),
          radius: 40,
        ),),
        const SizedBox(width: 12),
        // Greeting Text
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 15),
            Text(
              "Welcome back,",
              style: TextStyle(
                fontSize: 20,
                color: effectiveColor.withOpacity(0.7),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              displayName,
              style: TextStyle(
                fontSize: 25,
                fontWeight: FontWeight.bold,
                color: effectiveColor,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
