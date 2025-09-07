
class Product {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String category;
  final bool isFeatured;
  final double price;
  final String? manufacturerName; // From medicine API
  final String? composition; // From medicine API
  final bool isRecommended; // To distinguish API results

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.isFeatured,
    required this.price,
    this.manufacturerName,
    this.composition,
    this.isRecommended = false,
  });

  // For future backend (JSON API / Firestore)
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      category: json['category'] ?? 'All',
      isFeatured: json['isFeatured'] ?? false,
      price: (json['price'] ?? 0).toDouble(),
      manufacturerName: json['manufacturer_name'],
      composition: json['composition'],
      isRecommended: json['isRecommended'] ?? false,
    );
  }

  // Factory for medicine recommendation API
  factory Product.fromMedicineRecommendation(Map<String, dynamic> json) {
    final medicineName = json['name'] ?? '';
    return Product(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: medicineName,
      description: json['manufacturer_name'] ?? 'Medicine',
      imageUrl: _getMedicineImageByName(medicineName), // Consistent image per medicine
      category: 'Recommended',
      isFeatured: false,
      price: double.tryParse(json['price(₹)']?.toString() ?? '0') ?? 0.0,
      manufacturerName: json['manufacturer_name'],
      composition: json['composition'],
      isRecommended: true,
    );
  }

  // List of available medicine images
  static const List<String> _medicineImages = [
    'assets/images/medicine.jpg',
    'assets/images/medicine1.jpeg',
    'assets/images/medicine2.jpg',
    'assets/images/medicine3.jpeg',
    'assets/images/medicine4.jpg',
  ];

  // Get a random medicine image with fallback
  static String _getRandomMedicineImage() {
    final random = DateTime.now().millisecondsSinceEpoch % _medicineImages.length;
    return _medicineImages[random];
  }

  // Get medicine image by name (consistent for same medicine)
  static String _getMedicineImageByName(String medicineName) {
    if (medicineName.isEmpty) return _medicineImages[0];
    
    // Use medicine name hash to get consistent image
    final imageIndex = medicineName.hashCode.abs() % _medicineImages.length;
    return _medicineImages[imageIndex];
  }

  // Get medicine image by index (for consistent display)
  static String getMedicineImageByIndex(int index) {
    if (index >= 0 && index < _medicineImages.length) {
      return _medicineImages[index];
    }
    return _medicineImages[0]; // Fallback to first image
  }





  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'category': category,
      'isFeatured': isFeatured,
      'price': price,
      'manufacturerName': manufacturerName,
      'composition': composition,
      'isRecommended': isRecommended,
    };
  }
}
