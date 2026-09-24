const express = require("express");
const User = require("../Models/User");
const Product = require("../Models/product");
const Order = require("../Models/Order");
const { softProtect } = require("../middleware/authmiddleware");

const router = express.Router();

router.use(softProtect);

router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const deliveredOrdersCount = await Order.countDocuments({
            $or: [{ status: "Delivered" }, { isDelivered: true }]
        });
        const unpaidOrdersCount = await Order.countDocuments({ isPaid: false });

        const orders = await Order.find({ isPaid: true });
        const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(8);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            deliveredOrdersCount,
            unpaidOrdersCount,
            totalSales: Number(totalSales.toFixed(2)),
            recentOrders,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Admin fetch orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

router.put("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const { status, isPaid, isDelivered } = req.body;

        if (status !== undefined) order.status = status;
        if (isPaid !== undefined) {
            order.isPaid = isPaid;
            if (isPaid && !order.paidAt) order.paidAt = Date.now();
        }
        if (isDelivered !== undefined) {
            order.isDelivered = isDelivered;
            if (isDelivered && !order.deliveredAt) order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Admin update order error:", error);
        res.status(500).json({ message: "Failed to update order" });
    }
});

router.delete("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.deleteOne();
        res.json({ message: "Order removed successfully" });
    } catch (error) {
        console.error("Admin delete order error:", error);
        res.status(500).json({ message: "Failed to delete order" });
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Admin fetch users error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

router.put("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { role, name, email } = req.body;

        if (role !== undefined) user.role = role.toLowerCase();
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error("Admin update user error:", error);
        res.status(500).json({ message: "Failed to update user" });
    }
});

router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete currently logged in admin" });
        }

        await user.deleteOne();
        res.json({ message: "User removed successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

module.exports = router;
