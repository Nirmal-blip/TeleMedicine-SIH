import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../models/product_model.dart';
import '../widgets/product_card.dart';
import 'cart_page.dart';

class PharmacyPage extends StatefulWidget {
  const PharmacyPage({super.key});

  @override
  State<PharmacyPage> createState() => _PharmacyPageState();
}

class _PharmacyPageState extends State<PharmacyPage> {
  String selectedCategory = "All";
  final List<String> categories = [
    "All",
    "Pain Relief",
    "Cold & Flu",
    "Vitamin",
    "Digestive",
    "Recommended"
  ];

  // API Configuration
  static const String medicineApiUrl = 'https://489dbddec86a.ngrok-free.app/api/medicine';
  
  // State variables
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  List<Product> _searchResults = [];
  String _searchQuery = '';

  // Dummy products (replace with backend later)
  final List<Product> products = [
    Product(
      id: "1",
      name: "Ibuprofen 200mg",
      description: "Pain Relief",
      imageUrl:
      "https://5.imimg.com/data5/SELLER/Default/2024/9/449967961/WE/HQ/HH/229029407/pharmaceutical-dummy-pellets-500x500.jpeg",
      category: "Pain Relief",
      isFeatured: true,
      price: 50,
    ),
    Product(
      id: "2",
      name: "Vitamin C 500mg",
      description: "Immune Support",
      imageUrl:
      "https://thumbs.dreamstime.com/b/probiotic-pills-tablets-box-package-as-supplement-to-healthy-diet-conscious-nutrition-medical-dummy-named-isolated-vector-164958082.jpg",
      category: "Vitamin",
      isFeatured: true,
      price: 120,
    ),
    Product(
      id: "3",
      name: "Paracetamol 500mg",
      description: "Fever Reducer",
      imageUrl:
      "https://5.imimg.com/data5/SELLER/Default/2022/4/PU/VO/BG/98052642/photoroom-20220426-102046-500x500.png",
      category: "Pain Relief",
      isFeatured: false,
      price: 30,
    ),
    Product(
      id: "4",
      name: "Cough Syrup",
      description: "Cough Relief",
      imageUrl: "https://via.placeholder.com/150",
      category: "Cold & Flu",
      isFeatured: false,
      price: 80,
    ),
  ];

  /// 🛒 Shopping cart (Product → quantity)
  final Map<Product, int> cart = {};

  void addToCart(Product product) {
    setState(() {
      cart[product] = (cart[product] ?? 0) + 1;
    });
  }

  void goToCartPage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CartPage(cart: cart),
      ),
    );
  }

  // Medicine search methods
  Future<void> _searchMedicines(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _searchQuery = '';
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _searchQuery = query;
    });

    try {
      final response = await http.post(
        Uri.parse('$medicineApiUrl/recommend'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'medicine_name': query}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final recommendations = data['recommendations'] as List<dynamic>;
        
        setState(() {
          _searchResults = recommendations
              .map((item) => Product.fromMedicineRecommendation(item))
              .toList();
          _isSearching = false;
        });
      } else {
        _showError('Search failed: ${response.statusCode}');
      }
    } catch (e) {
      _showError('Error searching medicines: $e');
    }
  }

  Future<void> _searchMedicinesFromImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.camera);
      
      if (image == null) return;

      setState(() {
        _isSearching = true;
      });

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$medicineApiUrl/recommend-image'),
      );
      
      request.files.add(await http.MultipartFile.fromPath('file', image.path));

      var response = await request.send().timeout(const Duration(seconds: 30));
      var responseData = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final data = json.decode(responseData);
        final recommendations = data['recommendations'] as List<dynamic>;
        
        setState(() {
          _searchResults = recommendations
              .map((item) => Product.fromMedicineRecommendation(item))
              .toList();
          _isSearching = false;
          _searchQuery = data['search'] ?? 'Image Search';
        });
      } else {
        _showError('Image search failed: ${response.statusCode}');
      }
    } catch (e) {
      _showError('Error processing image: $e');
    }
  }

  void _findAlternatives(Product product) {
    _searchController.text = product.name;
    _searchMedicines(product.name);
  }

  void _showError(String message) {
    setState(() {
      _isSearching = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  // Get icon for each category
  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'All':
        return Icons.grid_view;
      case 'Pain Relief':
        return Icons.healing;
      case 'Cold & Flu':
        return Icons.sick;
      case 'Vitamin':
        return Icons.eco;
      case 'Digestive':
        return Icons.restaurant;
      case 'Recommended':
        return Icons.auto_awesome;
      default:
        return Icons.medication;
    }
  }

  // Build banner icon with animation
  Widget _buildBannerIcon(IconData icon, int index) {
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 800 + (index * 200)),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 18,
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    List<Product> featured = products.where((p) => p.isFeatured).toList();
    List<Product> popular = products.where((p) => !p.isFeatured).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text("Pharmacy"),
        centerTitle: true,
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // 🛒 Enhanced Cart icon with badge
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: Stack(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.shopping_cart, color: Colors.white),
                    onPressed: goToCartPage,
                  ),
                ),
                if (cart.isNotEmpty)
                  Positioned(
                    right: 6,
                    top: 6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
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
                      child: Text(
                        cart.length.toString(),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  )
              ],
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Enhanced Search Bar
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 0,
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: "Search for medicines",
                  prefixIcon: Container(
                    padding: const EdgeInsets.all(12),
                    child: Icon(Icons.search, color: Colors.green.shade600),
                  ),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: _searchMedicinesFromImage,
                        icon: Icon(Icons.camera_alt, color: Colors.blue.shade600),
                        tooltip: 'Search by Image',
                      ),
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          onPressed: () {
                            _searchController.clear();
                            _searchMedicines('');
                          },
                          icon: Icon(Icons.clear, color: Colors.grey.shade600),
                        ),
                    ],
                  ),
                  filled: true,
                  fillColor: Colors.transparent,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
                onSubmitted: _searchMedicines,
                onChanged: (value) {
                  if (value.isEmpty) {
                    _searchMedicines('');
                  }
                },
              ),
            ),

            const SizedBox(height: 12),

            // Enhanced Category Chips
            Container(
              height: 60,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  final isSelected = selectedCategory == category;
                  return GestureDetector(
                    onTap: () {
                      setState(() => selectedCategory = category);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isSelected 
                            ? [Colors.green.shade400, Colors.green.shade600]
                            : [Colors.white, Colors.white],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(25),
                        border: Border.all(
                          color: isSelected ? Colors.green.shade300 : Colors.grey.shade300,
                          width: isSelected ? 2 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected 
                              ? Colors.green.withOpacity(0.3)
                              : Colors.grey.withOpacity(0.15),
                            spreadRadius: 0,
                            blurRadius: isSelected ? 12 : 6,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isSelected) ...[
                            Icon(
                              _getCategoryIcon(category),
                              size: 16,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 6),
                          ],
                          Text(
                            category,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.grey.shade700,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 20),

            // Pharmacy Banner
            Container(
              width: double.infinity,
              height: 120,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.green.shade400,
                    Colors.green.shade600,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  // Background Pattern
                  Positioned(
                    right: -20,
                    top: -20,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  Positioned(
                    right: 20,
                    bottom: -10,
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  // Content
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.local_pharmacy,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Smart Pharmacy',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'AI-powered medicine recommendations\nand easy ordering',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 14,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Medicine Icons
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Row(
                              children: [
                                _buildBannerIcon(Icons.medication, 0),
                                const SizedBox(width: 8),
                                _buildBannerIcon(Icons.medication_liquid, 1),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _buildBannerIcon(Icons.medication, 2),
                                const SizedBox(width: 8),
                                _buildBannerIcon(Icons.medication_liquid, 3),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Search Results Section
            if (_isSearching)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: Colors.green),
                      SizedBox(height: 16),
                      Text('Searching medicines...', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              )
            else if (_searchResults.isNotEmpty) ...[
              // Search Results Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.search, color: Colors.blue.shade600, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "Search Results for: $_searchQuery",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      _searchController.clear();
                      _searchMedicines('');
                    },
                    child: const Text('Clear'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Search Results Grid
              GridView.builder(
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: _searchResults.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  final product = _searchResults[index];
                  return ProductCard(
                    product: product,
                    onTap: () => addToCart(product),
                    onFindAlternative: () => _findAlternatives(product),
                  );
                },
              ),
              const SizedBox(height: 20),
            ],

            // Enhanced Section Headers
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.star, color: Colors.orange.shade600, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  "Featured Products",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.grey.shade800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 220,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: featured
                    .map((product) => ProductCard(
                  product: product,
                  onTap: () => addToCart(product),
                  onFindAlternative: () => _findAlternatives(product),
                ))
                    .toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Enhanced Popular Products Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.purple.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.trending_up, color: Colors.purple.shade600, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  "Popular Products",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.grey.shade800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: popular.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12),
              itemBuilder: (context, index) {
                return ProductCard(
                  product: popular[index],
                  onTap: () => addToCart(popular[index]),
                  onFindAlternative: () => _findAlternatives(popular[index]),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
