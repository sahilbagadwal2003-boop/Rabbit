const express = require("express");
const mongoose = require("mongoose");
const Checkout = require("../Models/Checkout");
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Product = require("../Models/product");
const { softProtect } = require("../middleware/authmiddleware");

const router = express.Router();

// Apply softProtect to all checkout routes
router.use(softProtect);

// @route   POST /api/checkout
// @desc    Initiate/create a checkout session
// @access  Public / Private
router.post("/", async (req, res) => {
    try {
        const { checkoutItems, shippingAddress, paymentMethod, totalPrice, guestId } = req.body;

        if (!checkoutItems || checkoutItems.length === 0) {
            return res.status(400).json({ message: "No checkout items provided" });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({ message: "Shipping address is incomplete" });
        }

        // Validate stock for items that exist in MongoDB
        for (const item of checkoutItems) {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product && product.countInStock < item.quantity) {
                        return res.status(400).json({
                            message: `Not enough stock for ${product.name}. Available: ${product.countInStock}`,
                        });
                    }
                } catch (_) {}
            }
        }

        const isPaid = paymentMethod === "PayPal" || paymentMethod === "Credit Card" || req.body.isPaid === true;

        const checkout = new Checkout({
            user: req.user ? req.user._id : null,
            guestId: guestId || req.headers["x-guest-id"] || null,
            checkoutItems,
            shippingAddress,
            paymentMethod: paymentMethod || "PayPal",
            totalPrice: Number(totalPrice) || 0,
            isPaid,
            paidAt: isPaid ? Date.now() : null,
            paymentStatus: isPaid ? "paid" : "pending",
        });

        const createdCheckout = await checkout.save();
        res.status(201).json(createdCheckout);
    } catch (error) {
        console.error("Create checkout error:", error);
        res.status(500).json({ message: "Server error initiating checkout" });
    }
});

// @route   GET /api/checkout/:id
// @desc    Get checkout session by ID
// @access  Public / Private
router.get("/:id", async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id).populate("user", "name email");

        if (!checkout) {
            return res.status(404).json({ message: "Checkout session not found" });
        }

        res.json(checkout);
    } catch (error) {
        console.error("Get checkout error:", error);
        res.status(500).json({ message: "Server error getting checkout details" });
    }
});

// @route   PUT /api/checkout/:id/pay
// @desc    Update checkout session payment status
// @access  Public / Private
router.put("/:id/pay", async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout session not found" });
        }

        checkout.isPaid = true;
        checkout.paidAt = Date.now();
        checkout.paymentStatus = "paid";
        checkout.paymentDetails = req.body.paymentDetails || {
            transactionId: "TXN_" + Date.now(),
            status: "SUCCESS",
        };

        const updatedCheckout = await checkout.save();
        res.json(updatedCheckout);
    } catch (error) {
        console.error("Checkout pay error:", error);
        res.status(500).json({ message: "Server error updating checkout payment" });
    }
});

// @route   POST /api/checkout/:id/finalize
// @desc    Finalize checkout into an Order, deduct stock, and clear user cart
// @access  Public / Private
router.post("/:id/finalize", async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout session not found" });
        }

        if (checkout.isFinalized) {
            const existingOrder = await Order.findOne({ "paymentResult.checkoutId": checkout._id })
                .populate("user", "name email");
            if (existingOrder) {
                return res.status(200).json({
                    message: "Checkout already finalized",
                    order: existingOrder,
                });
            }
        }

        // Deduct product stock where valid
        for (const item of checkout.checkoutItems) {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.countInStock = Math.max(0, product.countInStock - item.quantity);
                        await product.save();
                    }
                } catch (_) {}
            }
        }

        // Calculate breakdown
        const itemsPrice = checkout.checkoutItems.reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
        );
        const shippingPrice = itemsPrice > 50 || itemsPrice === 0 ? 0 : 9.99;
        const taxPrice = Number((itemsPrice * 0.08).toFixed(2));

        // Create official Order
        const order = new Order({
            user: checkout.user || (req.user ? req.user._id : null),
            orderItems: checkout.checkoutItems,
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod || "PayPal",
            itemsPrice: Number(itemsPrice.toFixed(2)),
            shippingPrice: Number(shippingPrice.toFixed(2)),
            taxPrice: Number(taxPrice.toFixed(2)),
            totalPrice: Number(checkout.totalPrice || (itemsPrice + shippingPrice + taxPrice).toFixed(2)),
            isPaid: checkout.isPaid,
            paidAt: checkout.paidAt || (checkout.isPaid ? Date.now() : null),
            paymentResult: {
                ...(checkout.paymentDetails || {}),
                checkoutId: checkout._id.toString(),
            },
            status: "Processing",
        });

        const createdOrder = await order.save();

        checkout.isFinalized = true;
        checkout.finalizedAt = Date.now();
        await checkout.save();

        // Clear user or guest cart
        if (req.user && req.user._id) {
            await Cart.findOneAndUpdate({ user: req.user._id }, { products: [], totalPrice: 0 });
        }
        if (checkout.guestId) {
            await Cart.findOneAndUpdate({ guestId: checkout.guestId }, { products: [], totalPrice: 0 });
        }

        res.status(201).json({
            message: "Order finalized successfully",
            order: createdOrder,
        });
    } catch (error) {
        console.error("Finalize checkout error:", error);
        res.status(500).json({ message: "Server error finalizing checkout into order" });
    }
});

module.exports = router;
