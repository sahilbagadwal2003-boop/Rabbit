const express = require("express");
const Order = require("../Models/Order");
const { protect, softProtect } = require("../middleware/authmiddleware");

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order (direct checkout)
// @access  Public / Private
router.post("/", softProtect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items provided" });
        }

        const paid = isPaid !== undefined ? isPaid : (paymentMethod === "PayPal" || paymentMethod === "Credit Card");

        const order = new Order({
            user: req.user ? req.user._id : null,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || "PayPal",
            itemsPrice: Number(itemsPrice) || 0,
            taxPrice: Number(taxPrice) || 0,
            shippingPrice: Number(shippingPrice) || 0,
            totalPrice: Number(totalPrice) || 0,
            isPaid: paid,
            paidAt: paid ? Date.now() : null,
            status: "Processing",
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user orders
// @access  Private
router.get("/my-orders", softProtect, async (req, res) => {
    try {
        if (!req.user) {
            return res.json([]);
        }
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Fetch my-orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public / Private
router.get("/:id", softProtect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error("Fetch order by ID error:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order payment status
// @access  Public / Private
router.put("/:id/pay", softProtect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id || "SIMULATED_PAYMENT",
            status: req.body.status || "COMPLETED",
            update_time: req.body.update_time || new Date().toISOString(),
            email_address: req.body.email_address || (req.user ? req.user.email : "guest@rabbit.com"),
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Order pay error:", error);
        res.status(500).json({ message: "Failed to update payment status" });
    }
});

module.exports = router;
