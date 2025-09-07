import 'package:flutter/material.dart';
import '../models/product_model.dart';

class CartPage extends StatelessWidget {
  final Map<Product, int> cart;
  const CartPage({super.key, required this.cart});

  @override
  Widget build(BuildContext context) {
    double totalPrice = cart.entries
        .map((e) => e.key.price * e.value)
        .fold(0, (a, b) => a + b);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Your Cart"),
        centerTitle: true,
      ),
      body: cart.isEmpty
          ? const Center(child: Text("Your cart is empty 🛒"))
          : ListView(
        padding: const EdgeInsets.all(12),
        children: [
          ...cart.entries.map((entry) {
            final product = entry.key;
            final qty = entry.value;
            return ListTile(
              leading: Image.network(product.imageUrl, width: 50),
              title: Text(product.name),
              subtitle: Text("₹${product.price} x $qty"),
              trailing: Text("₹${product.price * qty}"),
            );
          }),
          const Divider(),
          ListTile(
            title: const Text("Total",
                style:
                TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            trailing: Text("₹$totalPrice",
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              // TODO: Hook with backend checkout
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
            ),
            child: const Text("Proceed to Checkout"),
          )
        ],
      ),
    );
  }
}
