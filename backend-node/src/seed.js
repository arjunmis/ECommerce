import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

const products = [
  { name: "Wireless Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", category: "Electronics", price: 2499, stock: 25, description: "Bluetooth over-ear headphones with 30-hour battery." },
  { name: "Smart Watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", category: "Electronics", price: 3999, stock: 15, description: "Fitness tracking, heart-rate monitor and notifications." },
  { name: "Cotton T-Shirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", category: "Clothing", price: 499, stock: 100, description: "Regular-fit 100% cotton t-shirt." },
  { name: "Denim Jacket", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2", category: "Clothing", price: 1799, stock: 30, description: "Classic blue denim jacket." },
  { name: "Running Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", category: "Footwear", price: 2999, stock: 40, description: "Lightweight shoes with cushioned sole." },
  { name: "Steel Water Bottle", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8", category: "Home", price: 399, stock: 80, description: "1 litre insulated bottle, keeps drinks cold for 24 hours." },
  { name: "Table Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c", category: "Home", price: 899, stock: 20, description: "LED desk lamp with three brightness levels." },
  { name: "Backpack", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", category: "Accessories", price: 1299, stock: 35, description: "Water-resistant laptop backpack, 25 litres." },
];

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopnest");
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);

await User.create([
  { name: "Admin", email: "admin@shopnest.dev", password: "admin123", isAdmin: true },
  { name: "Test User", email: "user@shopnest.dev", password: "user123" },
]);
await Product.insertMany(products);

console.log(`Seeded ${products.length} products and 2 users`);
await mongoose.disconnect();
