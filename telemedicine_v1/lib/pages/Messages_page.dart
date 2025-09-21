import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class MessagesPage extends StatefulWidget {
  @override
  _MessagesPageState createState() => _MessagesPageState();
}

class _MessagesPageState extends State<MessagesPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [
    {
      "text":
      "Hello! I'm Dr. AI Assistant. I can help you with:\n\n• Medical advice and symptom analysis\n• Health recommendations and precautions\n• Disease information and treatment guidance\n• Appointment booking assistance\n• Voice input support (🎤 button)\n\nHow can I assist you today?",
      "isUser": false,
      "time": "10:00 AM",
    }
  ];

  /// 🔗 Chatbot API endpoints
  final String chatApiUrl = "https://489dbddec86a.ngrok-free.app/api/chat";
  final String healthApiUrl = "https://489dbddec86a.ngrok-free.app/health";

  bool _isLoading = false;
  bool _isVoiceRecording = false;

  late stt.SpeechToText _speech;
  bool _speechAvailable = false;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize();
    setState(() {});
  }

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty || _isLoading) return;

    String userMessage = _controller.text.trim();

    setState(() {
      _messages.add({
        "text": userMessage,
        "isUser": true,
        "time": _formatTime(),
      });
      _isLoading = true;
    });

    _controller.clear();
    _scrollToBottom();

    // Add loading indicator
    setState(() {
      _messages.add({
        "text": "Dr. AI is thinking...",
        "isUser": false,
        "time": _formatTime(),
        "isLoading": true,
      });
    });
    _scrollToBottom();

    try {
      final response = await http.post(
        Uri.parse(chatApiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "input": userMessage,
          "language": "en",
          "responseLanguage": ""
        }),
      );

      // Remove loading message
      setState(() {
        _messages.removeWhere((msg) => msg["isLoading"] == true);
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String aiReply = data["response"] ??
            "I'm sorry, I couldn't process your request. Please try again.";

        setState(() {
          _messages.add({
            "text": aiReply,
            "isUser": false,
            "time": _formatTime(),
          });
          _isLoading = false;
        });
        _scrollToBottom();
      } else {
        _showError("⚠️ Server error: ${response.statusCode}");
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      _showError(
          "🚫 Connection failed. Please make sure the chatbot server is running.");
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _scrollToBottom() {
    Future.delayed(Duration(milliseconds: 300), () {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  void _showError(String errorMsg) {
    setState(() {
      _messages.add({
        "text": errorMsg,
        "isUser": false,
        "time": _formatTime(),
      });
    });
  }

  String _formatTime() {
    final now = TimeOfDay.now();
    return "${now.hour}:${now.minute.toString().padLeft(2, '0')}";
  }

  void _sendQuickMessage(String message) {
    _controller.text = message;
    _sendMessage();
  }

  Future<void> _startVoiceRecording() async {
    if (_isLoading || _isVoiceRecording) return;

    // Request mic permission
    var status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      _showError("Microphone permission is required for voice input");
      return;
    }

    if (!_speechAvailable) {
      _showError("Speech recognition not available on this device");
      return;
    }

    setState(() {
      _isVoiceRecording = true;
    });

    _messages.add({
      "text": "🎤 Listening... Speak now",
      "isUser": false,
      "time": _formatTime(),
      "isVoiceRecording": true,
    });
    _scrollToBottom();

    await _speech.listen(onResult: (result) async {
      if (result.finalResult) {
        setState(() {
          _messages.removeWhere((msg) => msg["isVoiceRecording"] == true);
          _isVoiceRecording = false;
          _controller.text = result.recognizedWords;
        });
        _sendMessage();
      }
    });
  }

  Widget _buildQuickActionChip(String label, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.shade50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.blue.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Text(
            label,
            style: TextStyle(
              color: Colors.blue.shade700,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Row(
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
              child: const CircleAvatar(
                backgroundImage: AssetImage("assets/images/doctor.png"),
                radius: 20,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Dr. AI Assistant",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withOpacity(0.5),
                            spreadRadius: 1,
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      "Online",
                      style: TextStyle(fontSize: 12, color: Colors.green),
                    ),
                  ],
                ),
              ],
            )
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        shadowColor: Colors.grey.withOpacity(0.1),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg["isUser"] as bool? ?? false;
                final isLoading = msg["isLoading"] == true;
                final isVoiceRecording = msg["isVoiceRecording"] == true;

                return Align(
                  alignment:
                  isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isUser
                            ? [Colors.green.shade400, Colors.green.shade600]
                            : isLoading
                            ? [Colors.blue.shade50, Colors.white]
                            : isVoiceRecording
                            ? [Colors.purple.shade50, Colors.white]
                            : [Colors.white, Colors.grey.shade50],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: isUser
                              ? Colors.green.withOpacity(0.2)
                              : isLoading
                              ? Colors.blue.withOpacity(0.1)
                              : isVoiceRecording
                              ? Colors.purple.withOpacity(0.1)
                              : Colors.grey.withOpacity(0.1),
                          spreadRadius: 0,
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (isLoading)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor:
                                  AlwaysStoppedAnimation<Color>(
                                      Colors.blue.shade600),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                msg["text"],
                                style: TextStyle(
                                  color: Colors.blue.shade700,
                                  fontSize: 15,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          )
                        else if (isVoiceRecording)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.mic,
                                color: Colors.purple.shade600,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                msg["text"],
                                style: TextStyle(
                                  color: Colors.purple.shade700,
                                  fontSize: 15,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          )
                        else
                          Text(
                            msg["text"],
                            style: TextStyle(
                              color: isUser ? Colors.white : Colors.black87,
                              fontSize: 15,
                              height: 1.3,
                            ),
                          ),
                        const SizedBox(height: 6),
                        Text(
                          msg["time"],
                          style: TextStyle(
                            color: isUser ? Colors.white70 : Colors.black54,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick Action Buttons
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickActionChip(
                      "I have a fever", () => _sendQuickMessage("I have a fever")),
                  const SizedBox(width: 8),
                  _buildQuickActionChip("Cold symptoms",
                          () => _sendQuickMessage("I have cold symptoms")),
                  const SizedBox(width: 8),
                  _buildQuickActionChip(
                      "Headache", () => _sendQuickMessage("I have a headache")),
                  const SizedBox(width: 8),
                  _buildQuickActionChip("Book appointment",
                          () => _sendQuickMessage("I want to book an appointment")),
                  const SizedBox(width: 8),
                  _buildQuickActionChip("🎤 Voice Input", () => _startVoiceRecording()),
                ],
              ),
            ),
          ),

          // Input Box
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: TextField(
                        controller: _controller,
                        decoration: const InputDecoration(
                          hintText: "Type a message...",
                          border: InputBorder.none,
                          contentPadding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Voice Recording Button
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _isVoiceRecording
                            ? [Colors.purple.shade400, Colors.purple.shade600]
                            : [Colors.blue.shade400, Colors.blue.shade600],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: _isVoiceRecording
                              ? Colors.purple.withOpacity(0.3)
                              : Colors.blue.withOpacity(0.3),
                          spreadRadius: 0,
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: _isVoiceRecording
                          ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                          : const Icon(Icons.mic, color: Colors.white),
                      onPressed: _isVoiceRecording ? null : _startVoiceRecording,
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Send Button
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _isLoading
                            ? [Colors.grey.shade400, Colors.grey.shade600]
                            : [Colors.green.shade400, Colors.green.shade600],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: _isLoading
                              ? Colors.grey.withOpacity(0.3)
                              : Colors.green.withOpacity(0.3),
                          spreadRadius: 0,
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: _isLoading
                          ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                          : const Icon(Icons.send, color: Colors.white),
                      onPressed: _isLoading ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
