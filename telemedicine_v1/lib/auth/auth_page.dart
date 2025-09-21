import 'package:flutter/material.dart';
import '../pages/login_page.dart';
import '../pages/sign_up.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool showLogin = true;

  void toggle() {
    setState(() => showLogin = !showLogin);
  }

  @override
  Widget build(BuildContext context) {
    return showLogin
        ? LoginPage(onClickedSignUp: toggle)
        : SignUpPage(onClickedSignIn: toggle);
  }
}
