import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// POST /api/orders  body: { items: [{ productId, quantity }], shippingAddress }
// Prices are read from the database, never trusted from the client.
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let total = 0;
    try {
      for (const { productId, quantity } of items) {
        const qty = parseInt(quantity);
        if (!qty || qty < 1) throw Object.assign(new Error("Invalid quantity"), { status: 400 });

        // Atomically decrement stock only if enough is available.
        const product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
        if (!product) {
          throw Object.assign(new Error("Product unavailable or out of stock"), { status: 400 });
        }

        orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: qty });
        total += product.price * qty;
      }

      const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress, total });
      res.status(201).json(order);
    } catch (err) {
      // Put back any stock already reserved for this order.
      await Promise.all(
        orderItems.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } }))
      );
      throw err;
    }
  })
);

// GET /api/orders/mine
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

// GET /api/orders (admin)
router.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  })
);

// PATCH /api/orders/:id/status (admin)
router.patch(
  "/:id/status",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  })
);

export default router;
